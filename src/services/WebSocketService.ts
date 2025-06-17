import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { Logger } from '../utils/Logger.js';

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

export class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private options: Required<IWebSocketOptions>;
  private reconnectAttempts = 0;
  private isConnecting = false;
  private pingTimer?: NodeJS.Timeout;
  private reconnectTimer?: NodeJS.Timeout;
  private subscriptions = new Set<string>();
  private messageQueue: IWebSocketMessage[] = [];
  private logger = new Logger('WebSocketService');

  constructor(options: IWebSocketOptions) {
    super();
    this.options = {
      url: options.url,
      reconnect: options.reconnect ?? true,
      reconnectInterval: options.reconnectInterval ?? 5000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
      pingInterval: options.pingInterval ?? 30000,
      authToken: options.authToken
    } as Required<IWebSocketOptions>;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.logger.warn('WebSocket already connected');
      return;
    }

    if (this.isConnecting) {
      this.logger.warn('WebSocket connection already in progress');
      return;
    }

    this.isConnecting = true;

    try {
      await this.createConnection();
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.clearTimers();
    this.subscriptions.clear();
    this.messageQueue = [];
    
    if (this.ws) {
      this.ws.removeAllListeners();
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000, 'Client disconnect');
      }
      this.ws = null;
    }

    this.emit('disconnected');
  }

  /**
   * Subscribe to a topic
   */
  subscribe(topic: string): void {
    if (this.subscriptions.has(topic)) {
      this.logger.debug('Already subscribed to topic', { topic });
      return;
    }

    this.subscriptions.add(topic);
    
    const message: IWebSocketMessage = {
      type: 'subscribe',
      topic,
      timestamp: new Date().toISOString()
    };

    this.sendMessage(message);
    this.emit('subscribed', topic);
  }

  /**
   * Unsubscribe from a topic
   */
  unsubscribe(topic: string): void {
    if (!this.subscriptions.has(topic)) {
      this.logger.debug('Not subscribed to topic', { topic });
      return;
    }

    this.subscriptions.delete(topic);
    
    const message: IWebSocketMessage = {
      type: 'unsubscribe',
      topic,
      timestamp: new Date().toISOString()
    };

    this.sendMessage(message);
    this.emit('unsubscribed', topic);
  }

  /**
   * Send a message
   */
  send(data: any): void {
    const message: IWebSocketMessage = {
      type: 'update',
      data,
      timestamp: new Date().toISOString()
    };

    this.sendMessage(message);
  }

  /**
   * Get connection state
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get current subscriptions
   */
  get activeSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }

  /**
   * Create WebSocket connection
   */
  private async createConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const headers: any = {};
        if (this.options.authToken) {
          headers['Authorization'] = `Bearer ${this.options.authToken}`;
        }

        this.ws = new WebSocket(this.options.url, { headers });

        this.ws.on('open', () => {
          this.logger.info('WebSocket connected', { url: this.options.url });
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Resubscribe to topics
          this.subscriptions.forEach(topic => {
            const message: IWebSocketMessage = {
              type: 'subscribe',
              topic,
              timestamp: new Date().toISOString()
            };
            this.sendMessageDirect(message);
          });

          // Process queued messages
          this.processMessageQueue();

          // Start ping timer
          this.startPingTimer();

          this.emit('connected');
          resolve();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString()) as IWebSocketMessage;
            this.handleMessage(message);
          } catch (error) {
            this.logger.error('Failed to parse WebSocket message', { error });
          }
        });

        this.ws.on('error', (error) => {
          this.logger.error('WebSocket error', { error });
          this.emit('error', error);
          
          if (this.isConnecting) {
            this.isConnecting = false;
            reject(error);
          }
        });

        this.ws.on('close', (code, reason) => {
          this.logger.info('WebSocket closed', { code, reason: reason.toString() });
          this.ws = null;
          this.clearTimers();
          
          if (this.isConnecting) {
            this.isConnecting = false;
            reject(new Error(`WebSocket closed during connection: ${reason}`));
            return;
          }

          this.emit('disconnected', { code, reason: reason.toString() });

          // Attempt reconnection if enabled
          if (this.options.reconnect && code !== 1000) {
            this.scheduleReconnect();
          }
        });

        this.ws.on('ping', () => {
          this.logger.debug('Received ping');
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.pong();
          }
        });

        this.ws.on('pong', () => {
          this.logger.debug('Received pong');
        });

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(message: IWebSocketMessage): void {
    switch (message.type) {
      case 'update':
        if (message.topic && this.subscriptions.has(message.topic)) {
          this.emit('message', message);
          this.emit(`topic:${message.topic}`, message.data);
        }
        break;

      case 'error':
        this.logger.error('Received error message', { error: message.error });
        this.emit('error', new Error(message.error || 'Unknown error'));
        break;

      case 'ping':
        this.sendMessageDirect({ type: 'pong', timestamp: new Date().toISOString() });
        break;

      case 'pong':
        // Pong received, connection is alive
        break;

      default:
        this.logger.warn('Unknown message type', { type: message.type });
    }
  }

  /**
   * Send a message through WebSocket
   */
  private sendMessage(message: IWebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendMessageDirect(message);
    } else {
      // Queue message for later
      this.messageQueue.push(message);
      this.logger.debug('Message queued', { type: message.type, queueSize: this.messageQueue.length });
    }
  }

  /**
   * Send message directly without queuing
   */
  private sendMessageDirect(message: IWebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        this.logger.debug('Message sent', { type: message.type, topic: message.topic });
      } catch (error) {
        this.logger.error('Failed to send message', { error, message });
      }
    }
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    const queue = [...this.messageQueue];
    this.messageQueue = [];

    queue.forEach(message => {
      this.sendMessageDirect(message);
    });

    this.logger.info('Processed message queue', { count: queue.length });
  }

  /**
   * Start ping timer
   */
  private startPingTimer(): void {
    this.clearPingTimer();

    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const message: IWebSocketMessage = {
          type: 'ping',
          timestamp: new Date().toISOString()
        };
        this.sendMessageDirect(message);
      }
    }, this.options.pingInterval);
  }

  /**
   * Clear timers
   */
  private clearTimers(): void {
    this.clearPingTimer();
    this.clearReconnectTimer();
  }

  /**
   * Clear ping timer
   */
  private clearPingTimer(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = undefined;
    }
  }

  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
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