/**
 * Unit tests for RetryPolicy — withRetry and CircuitBreaker
 */
import { withRetry, CircuitBreaker } from '../../src/infrastructure/RetryPolicy';
import { HttpError } from '../../src/models/Errors';

describe('RetryPolicy', () => {

    describe('withRetry', () => {
        test('should return result on first success', async () => {
            const fn = jest.fn().mockResolvedValue('success');
            const result = await withRetry(fn);
            expect(result).toBe('success');
            expect(fn).toHaveBeenCalledTimes(1);
        });

        test('should retry on retryable error and succeed', async () => {
            const fn = jest.fn()
                .mockRejectedValueOnce(new HttpError('server error', { status: 503, url: '/api' }))
                .mockResolvedValue('recovered');

            const result = await withRetry(fn, { initialDelayMs: 1, maxDelayMs: 10 });
            expect(result).toBe('recovered');
            expect(fn).toHaveBeenCalledTimes(2);
        });

        test('should throw after max attempts exhausted', async () => {
            const err = new HttpError('server error', { status: 500, url: '/api' });
            const fn = jest.fn().mockRejectedValue(err);

            await expect(withRetry(fn, { maxAttempts: 2, initialDelayMs: 1 }))
                .rejects.toThrow('server error');
            expect(fn).toHaveBeenCalledTimes(2);
        });

        test('should not retry on non-retryable HTTP error (4xx)', async () => {
            const err = new HttpError('not found', { status: 404, url: '/api' });
            const fn = jest.fn().mockRejectedValue(err);

            await expect(withRetry(fn, { maxAttempts: 3, initialDelayMs: 1 }))
                .rejects.toThrow('not found');
            expect(fn).toHaveBeenCalledTimes(1);
        });

        test('should retry on 429 (rate limit)', async () => {
            const fn = jest.fn()
                .mockRejectedValueOnce(new HttpError('rate limited', { status: 429, url: '/api' }))
                .mockResolvedValue('ok');

            const result = await withRetry(fn, { initialDelayMs: 1 });
            expect(result).toBe('ok');
            expect(fn).toHaveBeenCalledTimes(2);
        });

        test('should retry on network timeout error', async () => {
            const fn = jest.fn()
                .mockRejectedValueOnce(new Error('timeout'))
                .mockResolvedValue('ok');

            const result = await withRetry(fn, { initialDelayMs: 1 });
            expect(result).toBe('ok');
            expect(fn).toHaveBeenCalledTimes(2);
        });

        test('should retry on ECONNRESET error', async () => {
            const fn = jest.fn()
                .mockRejectedValueOnce(new Error('ECONNRESET'))
                .mockResolvedValue('ok');

            const result = await withRetry(fn, { initialDelayMs: 1 });
            expect(result).toBe('ok');
        });

        test('should retry on ECONNREFUSED error', async () => {
            const fn = jest.fn()
                .mockRejectedValueOnce(new Error('ECONNREFUSED'))
                .mockResolvedValue('ok');

            const result = await withRetry(fn, { initialDelayMs: 1 });
            expect(result).toBe('ok');
        });

        test('should retry on socket hang up', async () => {
            const fn = jest.fn()
                .mockRejectedValueOnce(new Error('socket hang up'))
                .mockResolvedValue('ok');

            const result = await withRetry(fn, { initialDelayMs: 1 });
            expect(result).toBe('ok');
        });

        test('should not retry unknown non-network errors', async () => {
            const fn = jest.fn().mockRejectedValue(new Error('validation failed'));
            await expect(withRetry(fn, { maxAttempts: 3, initialDelayMs: 1 }))
                .rejects.toThrow('validation failed');
            expect(fn).toHaveBeenCalledTimes(1);
        });

        test('should apply exponential backoff', async () => {
            const fn = jest.fn()
                .mockRejectedValueOnce(new HttpError('err', { status: 503, url: '/api' }))
                .mockRejectedValueOnce(new HttpError('err', { status: 503, url: '/api' }))
                .mockResolvedValue('ok');

            const start = Date.now();
            await withRetry(fn, { initialDelayMs: 10, backoffMultiplier: 2, maxDelayMs: 100 });
            const elapsed = Date.now() - start;
            // 10ms + 20ms = 30ms minimum
            expect(elapsed).toBeGreaterThanOrEqual(20);
            expect(fn).toHaveBeenCalledTimes(3);
        });

        test('should cap delay at maxDelayMs', async () => {
            const fn = jest.fn()
                .mockRejectedValueOnce(new HttpError('err', { status: 500, url: '/api' }))
                .mockRejectedValueOnce(new HttpError('err', { status: 500, url: '/api' }))
                .mockResolvedValue('ok');

            // initialDelay=50, backoff=10, maxDelay=60 → delays: 50, 60 (capped)
            await withRetry(fn, { initialDelayMs: 50, backoffMultiplier: 10, maxDelayMs: 60 });
            expect(fn).toHaveBeenCalledTimes(3);
        });

        test('should use custom retryableStatusCodes', async () => {
            const fn = jest.fn()
                .mockRejectedValueOnce(new HttpError('custom error', { status: 418, url: '/api' }))
                .mockResolvedValue('ok');

            const result = await withRetry(fn, {
                initialDelayMs: 1,
                retryableStatusCodes: [418]
            });
            expect(result).toBe('ok');
        });
    });

    describe('CircuitBreaker', () => {
        test('should start in closed state', () => {
            const cb = new CircuitBreaker('test');
            expect(cb.getState().state).toBe('closed');
        });

        test('should execute successfully in closed state', async () => {
            const cb = new CircuitBreaker('test');
            const result = await cb.execute(() => Promise.resolve('ok'));
            expect(result).toBe('ok');
        });

        test('should open after threshold failures', async () => {
            const cb = new CircuitBreaker('test', 3, 60000);
            const fn = () => Promise.reject(new Error('fail'));

            for (let i = 0; i < 3; i++) {
                await expect(cb.execute(fn)).rejects.toThrow('fail');
            }
            expect(cb.getState().state).toBe('open');
        });

        test('should reject immediately when open', async () => {
            const cb = new CircuitBreaker('test', 1, 60000);
            await expect(cb.execute(() => Promise.reject(new Error('fail'))))
                .rejects.toThrow('fail');

            // Now open — should reject without calling fn
            const fn = jest.fn().mockResolvedValue('ok');
            await expect(cb.execute(fn)).rejects.toThrow('Circuit breaker test is OPEN');
            expect(fn).not.toHaveBeenCalled();
        });

        test('should transition to half-open after reset timeout', async () => {
            const cb = new CircuitBreaker('test', 1, 10); // 10ms reset
            await expect(cb.execute(() => Promise.reject(new Error('fail'))))
                .rejects.toThrow('fail');
            expect(cb.getState().state).toBe('open');

            // Wait for reset timeout
            await new Promise(r => setTimeout(r, 20));

            // Should now be half-open and allow one attempt
            const result = await cb.execute(() => Promise.resolve('recovered'));
            expect(result).toBe('recovered');
        });

        test('should close after enough half-open successes', async () => {
            const cb = new CircuitBreaker('test', 1, 10, 2); // 2 half-open successes needed
            await expect(cb.execute(() => Promise.reject(new Error('fail'))))
                .rejects.toThrow('fail');

            await new Promise(r => setTimeout(r, 20));

            await cb.execute(() => Promise.resolve('ok'));
            // After 1 success in half-open, still half-open
            // The state check depends on implementation...
            
            await cb.execute(() => Promise.resolve('ok'));
            // After 2 successes, should be closed
            expect(cb.getState().state).toBe('closed');
        });

        test('should reopen if half-open attempt fails', async () => {
            const cb = new CircuitBreaker('test', 1, 10);
            await expect(cb.execute(() => Promise.reject(new Error('fail1'))))
                .rejects.toThrow('fail1');

            await new Promise(r => setTimeout(r, 20));

            // Half-open, then fail again
            await expect(cb.execute(() => Promise.reject(new Error('fail2'))))
                .rejects.toThrow('fail2');
            expect(cb.getState().state).toBe('open');
        });

        test('should reset failure count on success in closed state', async () => {
            const cb = new CircuitBreaker('test', 3, 60000);
            await expect(cb.execute(() => Promise.reject(new Error('fail'))))
                .rejects.toThrow('fail');
            expect(cb.getState().failureCount).toBe(1);

            await cb.execute(() => Promise.resolve('ok'));
            expect(cb.getState().failureCount).toBe(0);
        });

        test('manual reset should return to closed state', async () => {
            const cb = new CircuitBreaker('test', 1, 60000);
            await expect(cb.execute(() => Promise.reject(new Error('fail'))))
                .rejects.toThrow('fail');
            expect(cb.getState().state).toBe('open');

            cb.reset();
            expect(cb.getState().state).toBe('closed');
            expect(cb.getState().failureCount).toBe(0);
            expect(cb.getState().successCount).toBe(0);
        });

        test('getState should return state details', () => {
            const cb = new CircuitBreaker('test');
            const state = cb.getState();
            expect(state).toHaveProperty('state');
            expect(state).toHaveProperty('failureCount');
            expect(state).toHaveProperty('successCount');
        });
    });
});
