/**
 * Custom error classes for Service Fabric extension
 * Provides structured error handling with context information
 */

/**
 * Base error class for all Service Fabric related errors
 */
export class ServiceFabricError extends Error {
    constructor(
        message: string,
        public readonly context?: Record<string, any>
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error connecting to or communicating with Service Fabric cluster
 */
export class ClusterConnectionError extends ServiceFabricError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, context);
    }
}

/**
 * Error related to certificate authentication
 */
export class CertificateError extends ServiceFabricError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, context);
    }
}

/**
 * Network-related errors (timeouts, connection refused, etc.)
 */
export class NetworkError extends ServiceFabricError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, context);
    }
}

/**
 * HTTP-specific errors with status code information
 */
export class HttpError extends NetworkError {
    public readonly statusCode: number;
    public readonly url: string;

    constructor(message: string, context: { status: number; url: string }) {
        super(message, context);
        this.statusCode = context.status;
        this.url = context.url;
    }
}

/**
 * Error during paginated API request handling
 */
export class PaginationError extends ServiceFabricError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, context);
    }
}

/**
 * Error calling Azure management APIs
 */
export class AzureApiError extends ServiceFabricError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, context);
    }
}

/**
 * Error parsing or processing configuration
 */
export class ConfigurationError extends ServiceFabricError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, context);
    }
}

/**
 * Error during SDK download or installation
 */
export class SdkInstallationError extends ServiceFabricError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, context);
    }
}
