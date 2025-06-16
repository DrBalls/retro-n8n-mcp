import { EventEmitter } from 'events';
export interface ISSEOptions {
    url: string;
    reconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    authToken?: string;
    withCredentials?: boolean;
}
export interface ISSEMessage {
    id?: string;
    event?: string;
    data: any;
    retry?: number;
}
export declare class SSEService extends EventEmitter {
    private eventSource;
    private options;
    private reconnectAttempts;
    private isConnecting;
    private reconnectTimer?;
    private subscriptions;
    private logger;
    private polyfillEventSource;
    constructor(options: ISSEOptions);
    /**
     * Connect to SSE endpoint
     */
    connect(): Promise<void>;
    /**
     * Disconnect from SSE endpoint
     */
    disconnect(): void;
    /**
     * Subscribe to a topic (managed client-side for SSE)
     */
    subscribe(topic: string): void;
    /**
     * Unsubscribe from a topic
     */
    unsubscribe(topic: string): void;
    /**
     * Get connection state
     */
    get isConnected(): boolean;
    /**
     * Get current subscriptions
     */
    get activeSubscriptions(): string[];
    /**
     * Create SSE connection
     */
    private createConnection;
    /**
     * Build URL with query parameters
     */
    private buildUrl;
    /**
     * Handle incoming SSE message
     */
    private handleMessage;
    /**
     * Reconnect with updated subscriptions
     */
    private reconnectWithSubscriptions;
    /**
     * Get EventSource implementation
     */
    private getEventSource;
    /**
     * Check if implementation supports headers
     */
    private supportsHeaders;
    /**
     * Clear reconnect timer
     */
    private clearReconnectTimer;
    /**
     * Schedule reconnection attempt
     */
    private scheduleReconnect;
}
//# sourceMappingURL=SSEService.d.ts.map