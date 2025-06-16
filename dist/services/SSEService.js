import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger.js';
export class SSEService extends EventEmitter {
    eventSource = null;
    options;
    reconnectAttempts = 0;
    isConnecting = false;
    reconnectTimer;
    subscriptions = new Set();
    logger = new Logger('SSEService');
    // For environments without native EventSource
    polyfillEventSource = null;
    constructor(options) {
        super();
        this.options = {
            reconnect: true,
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
            withCredentials: false,
            ...options
        };
    }
    /**
     * Connect to SSE endpoint
     */
    async connect() {
        if (this.eventSource?.readyState === EventSource.OPEN) {
            this.logger.warn('SSE already connected');
            return;
        }
        if (this.isConnecting) {
            this.logger.warn('SSE connection already in progress');
            return;
        }
        this.isConnecting = true;
        try {
            await this.createConnection();
        }
        catch (error) {
            this.isConnecting = false;
            throw error;
        }
    }
    /**
     * Disconnect from SSE endpoint
     */
    disconnect() {
        this.clearReconnectTimer();
        this.subscriptions.clear();
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.emit('disconnected');
    }
    /**
     * Subscribe to a topic (managed client-side for SSE)
     */
    subscribe(topic) {
        if (this.subscriptions.has(topic)) {
            this.logger.debug('Already subscribed to topic', { topic });
            return;
        }
        this.subscriptions.add(topic);
        this.emit('subscribed', topic);
        // For SSE, we might need to reconnect with updated query params
        if (this.eventSource?.readyState === EventSource.OPEN) {
            this.reconnectWithSubscriptions();
        }
    }
    /**
     * Unsubscribe from a topic
     */
    unsubscribe(topic) {
        if (!this.subscriptions.has(topic)) {
            this.logger.debug('Not subscribed to topic', { topic });
            return;
        }
        this.subscriptions.delete(topic);
        this.emit('unsubscribed', topic);
        // Reconnect with updated subscriptions
        if (this.eventSource?.readyState === EventSource.OPEN) {
            this.reconnectWithSubscriptions();
        }
    }
    /**
     * Get connection state
     */
    get isConnected() {
        return this.eventSource?.readyState === EventSource.OPEN;
    }
    /**
     * Get current subscriptions
     */
    get activeSubscriptions() {
        return Array.from(this.subscriptions);
    }
    /**
     * Create SSE connection
     */
    async createConnection() {
        return new Promise((resolve, reject) => {
            try {
                // Build URL with subscriptions
                const url = this.buildUrl();
                // Check for EventSource availability
                const EventSourceImpl = this.getEventSource();
                if (!EventSourceImpl) {
                    throw new Error('EventSource not available in this environment');
                }
                // Create EventSource with credentials if needed
                const eventSourceInit = {
                    withCredentials: this.options.withCredentials
                };
                // Add auth header if available (note: not all implementations support this)
                if (this.options.authToken) {
                    eventSourceInit.headers = {
                        'Authorization': `Bearer ${this.options.authToken}`
                    };
                }
                this.eventSource = new EventSourceImpl(url, eventSourceInit);
                // Handle connection open
                this.eventSource.onopen = () => {
                    this.logger.info('SSE connected', { url });
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    this.emit('connected');
                    resolve();
                };
                // Handle messages
                this.eventSource.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage({
                            id: event.lastEventId,
                            data,
                            event: event.type
                        });
                    }
                    catch (error) {
                        this.logger.error('Failed to parse SSE message', { error, data: event.data });
                    }
                };
                // Handle custom events
                this.subscriptions.forEach(topic => {
                    this.eventSource.addEventListener(topic, (event) => {
                        try {
                            const data = JSON.parse(event.data);
                            this.handleMessage({
                                id: event.lastEventId,
                                event: topic,
                                data
                            });
                        }
                        catch (error) {
                            this.logger.error('Failed to parse SSE event', { error, topic, data: event.data });
                        }
                    });
                });
                // Handle errors
                this.eventSource.onerror = (error) => {
                    this.logger.error('SSE error', { error });
                    if (this.isConnecting) {
                        this.isConnecting = false;
                        reject(new Error('SSE connection failed'));
                        return;
                    }
                    // EventSource will automatically reconnect on error
                    // but we handle our own reconnection logic
                    if (this.eventSource?.readyState === EventSource.CLOSED) {
                        this.eventSource = null;
                        this.emit('disconnected');
                        if (this.options.reconnect) {
                            this.scheduleReconnect();
                        }
                    }
                };
            }
            catch (error) {
                this.isConnecting = false;
                reject(error);
            }
        });
    }
    /**
     * Build URL with query parameters
     */
    buildUrl() {
        const url = new URL(this.options.url);
        // Add subscriptions as query parameter
        if (this.subscriptions.size > 0) {
            url.searchParams.set('topics', Array.from(this.subscriptions).join(','));
        }
        // Add auth token as query param if headers not supported
        if (this.options.authToken && !this.supportsHeaders()) {
            url.searchParams.set('token', this.options.authToken);
        }
        return url.toString();
    }
    /**
     * Handle incoming SSE message
     */
    handleMessage(message) {
        // Emit raw message
        this.emit('message', message);
        // Emit topic-specific event if it matches subscription
        if (message.event && this.subscriptions.has(message.event)) {
            this.emit(`topic:${message.event}`, message.data);
        }
        // Handle special event types
        if (message.event === 'error') {
            this.logger.error('Received error event', { data: message.data });
            this.emit('error', new Error(message.data.message || 'Unknown error'));
        }
        // Handle retry hint from server
        if (message.retry) {
            this.options.reconnectInterval = message.retry;
            this.logger.info('Updated reconnect interval', { interval: message.retry });
        }
    }
    /**
     * Reconnect with updated subscriptions
     */
    reconnectWithSubscriptions() {
        this.disconnect();
        this.connect().catch(error => {
            this.logger.error('Failed to reconnect with updated subscriptions', { error });
        });
    }
    /**
     * Get EventSource implementation
     */
    getEventSource() {
        // Browser environment
        if (typeof window !== 'undefined' && window.EventSource) {
            return window.EventSource;
        }
        // Node.js environment - try to load polyfill
        if (typeof global !== 'undefined') {
            try {
                if (!this.polyfillEventSource) {
                    // Dynamic import for Node.js environment
                    this.polyfillEventSource = require('eventsource');
                }
                return this.polyfillEventSource;
            }
            catch (error) {
                this.logger.warn('EventSource polyfill not available', { error });
            }
        }
        return null;
    }
    /**
     * Check if implementation supports headers
     */
    supportsHeaders() {
        // Native browser EventSource doesn't support custom headers
        // Only some polyfills do
        return this.polyfillEventSource !== null;
    }
    /**
     * Clear reconnect timer
     */
    clearReconnectTimer() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
    }
    /**
     * Schedule reconnection attempt
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
            this.logger.error('Max reconnection attempts reached', {
                attempts: this.reconnectAttempts,
                max: this.options.maxReconnectAttempts
            });
            this.emit('max_reconnect_attempts');
            return;
        }
        this.reconnectAttempts++;
        const delay = this.options.reconnectInterval * Math.min(this.reconnectAttempts, 5);
        this.logger.info('Scheduling reconnection', {
            attempt: this.reconnectAttempts,
            delay,
            max: this.options.maxReconnectAttempts
        });
        this.clearReconnectTimer();
        this.reconnectTimer = setTimeout(() => {
            this.connect().catch(error => {
                this.logger.error('Reconnection failed', { error, attempt: this.reconnectAttempts });
            });
        }, delay);
        this.emit('reconnecting', {
            attempt: this.reconnectAttempts,
            nextAttemptIn: delay
        });
    }
}
//# sourceMappingURL=SSEService.js.map