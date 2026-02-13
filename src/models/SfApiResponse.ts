/**
 * Base response class for ALL Service Fabric API calls.
 * 
 * Every REST call (direct or Azure SDK) produces an SfApiResponse that captures
 * status, timing, headers, body, and error details in a single place.
 * Both SfDirectRestClient.makeRequest() and SfRestClient.invokeRequestWithFullResponse()
 * create and log an SfApiResponse, so every API call is uniformly parsed and logged.
 */
import { SfUtility, debugLevel } from '../sfUtility';
import { PiiObfuscation } from '../utils/PiiObfuscation';

export interface SfApiResponseData {
    /** HTTP method (GET, POST, PUT, DELETE) */
    method: string;
    /** Request path (without query params for brevity) */
    path: string;
    /** Full URL (for diagnostics) */
    url?: string;
    /** HTTP status code */
    statusCode: number;
    /** HTTP status message */
    statusMessage?: string;
    /** Response body (raw text) */
    body?: string;
    /** Parsed JSON body (if applicable) */
    parsedBody?: any;
    /** Service Fabric error code from response body (e.g. FABRIC_E_APPLICATION_TYPE_NOT_FOUND) */
    sfErrorCode?: string;
    /** Service Fabric error message from response body */
    sfErrorMessage?: string;
    /** Duration of the request in milliseconds */
    durationMs: number;
    /** Whether the request succeeded (2xx) */
    success: boolean;
    /** Client that produced this response ('direct' | 'sdk') */
    client: 'direct' | 'sdk';
}

export class SfApiResponse {
    public readonly method: string;
    public readonly path: string;
    public readonly url: string;
    public readonly statusCode: number;
    public readonly statusMessage: string;
    public readonly body: string;
    public readonly parsedBody: any;
    public readonly sfErrorCode: string;
    public readonly sfErrorMessage: string;
    public readonly durationMs: number;
    public readonly success: boolean;
    public readonly client: 'direct' | 'sdk';

    constructor(data: SfApiResponseData) {
        this.method = data.method;
        this.path = data.path;
        this.url = data.url || '';
        this.statusCode = data.statusCode;
        this.statusMessage = data.statusMessage || '';
        this.body = data.body || '';
        this.durationMs = data.durationMs;
        this.success = data.success;
        this.client = data.client;

        // Parse body for SF error details
        if (data.parsedBody) {
            this.parsedBody = data.parsedBody;
        } else if (this.body) {
            try {
                this.parsedBody = JSON.parse(this.body);
            } catch {
                this.parsedBody = undefined;
            }
        } else {
            this.parsedBody = undefined;
        }

        // Extract SF error code/message from parsed body
        const error = this.parsedBody?.Error || this.parsedBody?.error;
        this.sfErrorCode = data.sfErrorCode || error?.Code || error?.code || '';
        this.sfErrorMessage = data.sfErrorMessage || error?.Message || error?.message || '';
    }

    /**
     * Log this response at the appropriate level.
     * Success → info, Client errors (4xx) → warn, Server errors (5xx) → error.
     */
    public log(): void {
        const obfuscatedPath = this.path.includes('?')
            ? this.path.substring(0, this.path.indexOf('?'))
            : this.path;

        if (this.success) {
            const bodyPreview = this.body
                ? ` body=${this.body.length}chars`
                : ' (empty body)';
            SfUtility.outputLog(
                `[${this.client}] ${this.method} ${obfuscatedPath} → ${this.statusCode} OK (${this.durationMs}ms)${bodyPreview}`,
                null,
                debugLevel.info
            );
        } else {
            const errorDetail = this.sfErrorCode
                ? ` sfError=${this.sfErrorCode}: ${this.sfErrorMessage}`
                : (this.body ? ` body=${this.body.substring(0, 200)}` : '');
            const level = this.statusCode >= 500 ? debugLevel.error : debugLevel.warn;
            SfUtility.outputLog(
                `[${this.client}] ${this.method} ${obfuscatedPath} → ${this.statusCode} ${this.statusMessage} (${this.durationMs}ms)${errorDetail}`,
                null,
                level
            );
        }
    }

    /**
     * Create an SfApiResponse from a successful direct REST response.
     */
    public static fromDirectSuccess(
        method: string,
        path: string,
        statusCode: number,
        body: string,
        durationMs: number,
        url?: string
    ): SfApiResponse {
        return new SfApiResponse({
            method,
            path,
            url,
            statusCode,
            body,
            durationMs,
            success: true,
            client: 'direct',
        });
    }

    /**
     * Create an SfApiResponse from a failed direct REST response.
     */
    public static fromDirectError(
        method: string,
        path: string,
        statusCode: number,
        statusMessage: string,
        body: string,
        durationMs: number,
        url?: string
    ): SfApiResponse {
        return new SfApiResponse({
            method,
            path,
            url,
            statusCode,
            statusMessage,
            body,
            durationMs,
            success: false,
            client: 'direct',
        });
    }

    /**
     * Create an SfApiResponse from an SDK pipeline response.
     */
    public static fromSdkResponse(
        method: string,
        path: string,
        statusCode: number,
        statusMessage: string,
        body: string,
        durationMs: number,
        success: boolean
    ): SfApiResponse {
        return new SfApiResponse({
            method,
            path,
            statusCode,
            statusMessage,
            body,
            durationMs,
            success,
            client: 'sdk',
        });
    }
}
