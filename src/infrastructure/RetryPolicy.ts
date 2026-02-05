/**
 * Retry utilities for resilient API calls with exponential backoff
 */

import { SfUtility, debugLevel } from '../sfUtility';
import { HttpError } from '../models/Errors';

export interface RetryOptions {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    retryableStatusCodes?: number[];
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
    maxAttempts: 3,
    initialDelayMs: 100,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504] // Timeout, Rate Limit, Server Errors
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic and exponential backoff
 * @param fn Function to execute
 * @param options Retry configuration
 * @returns Result of the function
 * @throws Last error if all retries fail
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: Partial<RetryOptions> = {}
): Promise<T> {
    const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
    let lastError: Error | undefined;
    let delay = opts.initialDelayMs;

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
            SfUtility.outputLog(
                `Attempt ${attempt}/${opts.maxAttempts}`,
                null,
                debugLevel.debug
            );
            
            return await fn();
            
        } catch (error) {
            lastError = error as Error;
            
            // Check if error is retryable
            const shouldRetry = isRetryableError(error, opts.retryableStatusCodes || []);
            
            if (!shouldRetry || attempt >= opts.maxAttempts) {
                SfUtility.outputLog(
                    `Operation failed after ${attempt} attempt(s), not retrying`,
                    error,
                    debugLevel.warn
                );
                throw error;
            }

            SfUtility.outputLog(
                `Attempt ${attempt} failed, retrying in ${delay}ms...`,
                error,
                debugLevel.warn
            );

            await sleep(delay);
            delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs);
        }
    }

    throw lastError!;
}

/**
 * Determine if an error should be retried
 * @param error Error to check
 * @param retryableStatusCodes HTTP status codes that should trigger retry
 */
function isRetryableError(error: any, retryableStatusCodes: number[]): boolean {
    // Don't retry client errors (4xx except specific ones)
    if (error instanceof HttpError) {
        const statusCode = error.statusCode;
        
        // Check if status code is in retryable list
        if (retryableStatusCodes.includes(statusCode)) {
            return true;
        }
        
        // Don't retry most 4xx errors (client errors)
        if (statusCode >= 400 && statusCode < 500) {
            return false;
        }
        
        // Retry 5xx errors (server errors)
        return statusCode >= 500;
    }

    // Check for network errors by message
    const errorMessage = error?.message?.toLowerCase() || '';
    const networkErrorPatterns = [
        'timeout',
        'econnreset',
        'econnrefused',
        'enotfound',
        'network',
        'socket hang up'
    ];

    return networkErrorPatterns.some(pattern => errorMessage.includes(pattern));
}

/**
 * Circuit breaker to prevent cascading failures
 * Opens after threshold failures, closes after timeout
 */
export class CircuitBreaker {
    private failureCount = 0;
    private lastFailureTime = 0;
    private state: 'closed' | 'open' | 'half-open' = 'closed';
    private successCount = 0;

    constructor(
        private readonly name: string,
        private readonly threshold: number = 5,
        private readonly resetTimeoutMs: number = 60000,
        private readonly halfOpenSuccesses: number = 2
    ) {}

    /**
     * Execute function with circuit breaker protection
     */
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        // Check circuit state
        if (this.state === 'open') {
            const timeSinceFailure = Date.now() - this.lastFailureTime;
            
            if (timeSinceFailure > this.resetTimeoutMs) {
                SfUtility.outputLog(
                    `Circuit breaker ${this.name}: Transitioning to half-open`,
                    null,
                    debugLevel.info
                );
                this.state = 'half-open';
                this.successCount = 0;
            } else {
                throw new Error(
                    `Circuit breaker ${this.name} is OPEN - service unavailable. ` +
                    `Retry in ${Math.round((this.resetTimeoutMs - timeSinceFailure) / 1000)}s`
                );
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    /**
     * Handle successful execution
     */
    private onSuccess(): void {
        if (this.state === 'half-open') {
            this.successCount++;
            
            if (this.successCount >= this.halfOpenSuccesses) {
                SfUtility.outputLog(
                    `Circuit breaker ${this.name}: Closing after ${this.successCount} successes`,
                    null,
                    debugLevel.info
                );
                this.state = 'closed';
                this.failureCount = 0;
                this.successCount = 0;
            }
        } else if (this.state === 'closed') {
            this.failureCount = 0;
        }
    }

    /**
     * Handle failed execution
     */
    private onFailure(): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.state === 'half-open') {
            SfUtility.outputLog(
                `Circuit breaker ${this.name}: Opening after failure in half-open state`,
                null,
                debugLevel.warn
            );
            this.state = 'open';
        } else if (this.failureCount >= this.threshold) {
            SfUtility.outputLog(
                `Circuit breaker ${this.name}: Opening after ${this.failureCount} failures`,
                null,
                debugLevel.error
            );
            this.state = 'open';
        }
    }

    /**
     * Get current circuit breaker state
     */
    getState(): { state: string; failureCount: number; successCount: number } {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount
        };
    }

    /**
     * Reset circuit breaker manually
     */
    reset(): void {
        this.state = 'closed';
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = 0;
        
        SfUtility.outputLog(
            `Circuit breaker ${this.name}: Manually reset`,
            null,
            debugLevel.info
        );
    }
}
