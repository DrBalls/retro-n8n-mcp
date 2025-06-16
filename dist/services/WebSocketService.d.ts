import { EventEmitter } from 'events';
export interface IWebSocketMessage {
    type: 'subscribe' | 'unsubscribe' | 'update' | 'error' | 'ping' | 'pong';
    topic?: string;
    data?: any;
    error?: string;
    timestamp: string;
}
export interface IWebSocketOptions {
    url: string;
    reconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    pingInterval?: number;
    authToken?: string;
}
export declare class WebSocketService extends EventEmitter {
    private ws;
    private options;
    private reconnectAttempts;
    private isConnecting;
    private pingTimer?;
    private reconnectTimer?;
    private subscriptions;
    private messageQueue;
    private logger;
    constructor(options: IWebSocketOptions);
    /**
     * Connect to WebSocket server
     */
    connect(): Promise<void>;
    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void;
    /**
     * Subscribe to a topic
     */
    subscribe(topic: string): void;
    /**
     * Unsubscribe from a topic
     */
    unsubscribe(topic: string): void;
    /**
     * Send a message
     */
    send(data: any): void;
    /**
     * Get connection state
     */
    get isConnected(): boolean;
    /**
     * Get current subscriptions
     */
    get activeSubscriptions(): string[];
    /**
     * Create WebSocket connection
     */
    private createConnection;
    /**
     * Handle incoming WebSocket message
     */
    private handleMessage;
    /**
     * Send a message through WebSocket
     */
    private sendMessage;
    /**
     * Send message directly without queuing
     */
    private sendMessageDirect;
    /**
     * Process queued messages
     */
    private processMessageQueue;
    /**
     * Start ping timer
     */
    private startPingTimer;
    /**
     * Clear timers
     */
    private clearTimers;
    /**
     * Clear ping timer
     */
    private clearPingTimer;
    /**
     * Clear reconnect timer
     */
    private clearReconnectTimer;
    /**
     * Schedule reconnection attempt
     */
    private scheduleReconnect;
}
//# sourceMappingURL=WebSocketService.d.ts.map