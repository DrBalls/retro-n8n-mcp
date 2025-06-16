import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketService, IWebSocketOptions, IWebSocketMessage } from '../../src/services/WebSocketService.js';
import WebSocket from 'ws';
import { EventEmitter } from 'events';

// Mock the ws module
vi.mock('ws');

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockWs: any;
  let mockOptions: IWebSocketOptions;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockOptions = {
      url: 'ws://localhost:8080',
      reconnect: true,
      reconnectInterval: 1000,
      maxReconnectAttempts: 3,
      pingInterval: 5000
    };

    // Create a mock WebSocket instance
    mockWs = new EventEmitter();
    mockWs.readyState = WebSocket.CONNECTING;
    mockWs.send = vi.fn();
    mockWs.close = vi.fn();
    mockWs.ping = vi.fn();
    mockWs.pong = vi.fn();
    mockWs.removeAllListeners = vi.fn(() => {
      EventEmitter.prototype.removeAllListeners.call(mockWs);
    });

    // Mock WebSocket constructor
    (WebSocket as unknown as any).mockImplementation(() => mockWs);

    service = new WebSocketService(mockOptions);
  });

  afterEach(() => {
    service.disconnect();
    vi.useRealTimers();
  });

  describe('Constructor', () => {
    it('should initialize with provided options', () => {
      expect(service).toBeDefined();
      expect(service.isConnected).toBe(false);
      expect(service.activeSubscriptions).toEqual([]);
    });

    it('should apply default options', () => {
      const minimalOptions: IWebSocketOptions = { url: 'ws://test.com' };
      const minimalService = new WebSocketService(minimalOptions);
      expect(minimalService).toBeDefined();
    });
  });

  describe('Connection Management', () => {
    it('should establish WebSocket connection', async () => {
      const connectPromise = service.connect();
      
      // Simulate successful connection
      mockWs.readyState = WebSocket.OPEN;
      mockWs.emit('open');

      await connectPromise;

      expect(WebSocket).toHaveBeenCalledWith('ws://localhost:8080', { headers: {} });
      expect(service.isConnected).toBe(true);
    });

    it('should handle connection with auth token', async () => {
      const authService = new WebSocketService({
        ...mockOptions,
        authToken: 'test-token'
      });

      const connectPromise = authService.connect();
      mockWs.readyState = WebSocket.OPEN;
      mockWs.emit('open');

      await connectPromise;

      expect(WebSocket).toHaveBeenCalledWith('ws://localhost:8080', {
        headers: { Authorization: 'Bearer test-token' }
      });
    });

    it('should prevent multiple simultaneous connections', async () => {
      const promise1 = service.connect();
      const promise2 = service.connect();

      mockWs.readyState = WebSocket.OPEN;
      mockWs.emit('open');

      await Promise.all([promise1, promise2]);

      // Should only create one WebSocket instance
      expect(WebSocket).toHaveBeenCalledTimes(1);
    });

    it.skip('should handle connection errors', async () => {
      // Override WebSocket constructor to immediately emit error
      (WebSocket as unknown as any).mockImplementation(() => {
        // Emit error on next tick
        setImmediate(() => {
          mockWs.emit('error', new Error('Connection failed'));
        });
        return mockWs;
      });

      await expect(service.connect()).rejects.toThrow('Connection failed');
    });

    it('should disconnect properly', async () => {
      // Establish connection first
      const connectPromise = service.connect();
      mockWs.readyState = WebSocket.OPEN;
      mockWs.emit('open');
      await connectPromise;
      
      service.disconnect();

      expect(mockWs.removeAllListeners).toHaveBeenCalled();
      expect(mockWs.close).toHaveBeenCalledWith(1000, 'Client disconnect');
      expect(service.isConnected).toBe(false);
    });

    it('should emit connected event on successful connection', async () => {
      const connectedHandler = vi.fn();
      service.on('connected', connectedHandler);

      const connectPromise = service.connect();
      mockWs.readyState = WebSocket.OPEN;
      mockWs.emit('open');

      await connectPromise;

      expect(connectedHandler).toHaveBeenCalled();
    });

    it('should emit disconnected event on disconnect', () => {
      const disconnectedHandler = vi.fn();
      service.on('disconnected', disconnectedHandler);

      service.disconnect();

      expect(disconnectedHandler).toHaveBeenCalled();
    });
  });

  describe('Subscription Management', () => {
    beforeEach(async () => {
      // Establish connection first
      const connectPromise = service.connect();
      mockWs.readyState = WebSocket.OPEN;
      mockWs.emit('open');
      await connectPromise;
    });

    it('should subscribe to a topic', () => {
      const subscribedHandler = vi.fn();
      service.on('subscribed', subscribedHandler);

      service.subscribe('test-topic');

      expect(service.activeSubscriptions).toContain('test-topic');
      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringMatching(/"type":"subscribe".*"topic":"test-topic"/)
      );
      expect(subscribedHandler).toHaveBeenCalledWith('test-topic');
    });

    it('should not duplicate subscriptions', () => {
      service.subscribe('test-topic');
      mockWs.send.mockClear();

      service.subscribe('test-topic');

      expect(mockWs.send).not.toHaveBeenCalled();
      expect(service.activeSubscriptions.filter(t => t === 'test-topic')).toHaveLength(1);
    });

    it('should unsubscribe from a topic', () => {
      const unsubscribedHandler = vi.fn();
      service.on('unsubscribed', unsubscribedHandler);

      service.subscribe('test-topic');
      service.unsubscribe('test-topic');

      expect(service.activeSubscriptions).not.toContain('test-topic');
      expect(mockWs.send).toHaveBeenLastCalledWith(
        expect.stringMatching(/"type":"unsubscribe".*"topic":"test-topic"/)
      );
      expect(unsubscribedHandler).toHaveBeenCalledWith('test-topic');
    });

    it('should ignore unsubscribe for non-subscribed topics', () => {
      mockWs.send.mockClear();
      
      service.unsubscribe('unknown-topic');

      expect(mockWs.send).not.toHaveBeenCalled();
    });

    it('should resubscribe to topics after reconnection', async () => {
      // Subscribe to topics
      service.subscribe('topic1');
      service.subscribe('topic2');
      
      // Create new mock for reconnection
      const newMockWs = new EventEmitter();
      newMockWs.readyState = WebSocket.CONNECTING;
      newMockWs.send = vi.fn();
      newMockWs.close = vi.fn();
      newMockWs.removeAllListeners = vi.fn(() => {
        EventEmitter.prototype.removeAllListeners.call(newMockWs);
      });
      
      // Mock WebSocket constructor to return new instance
      (WebSocket as unknown as any).mockImplementation(() => newMockWs);

      // Simulate disconnect
      mockWs.readyState = WebSocket.CLOSED;
      mockWs.emit('close', 1006, 'Connection lost');

      // Wait for reconnect attempt
      vi.advanceTimersByTime(1000);

      // Simulate successful reconnection on new websocket
      newMockWs.readyState = WebSocket.OPEN;
      newMockWs.emit('open');

      // Should resubscribe to both topics on new connection
      expect(newMockWs.send).toHaveBeenCalledTimes(2);
      expect(newMockWs.send).toHaveBeenCalledWith(
        expect.stringMatching(/"type":"subscribe".*"topic":"topic1"/)
      );
      expect(newMockWs.send).toHaveBeenCalledWith(
        expect.stringMatching(/"type":"subscribe".*"topic":"topic2"/)
      );
    });
  });

  describe('Message Handling', () => {
    beforeEach(async () => {
      const connectPromise = service.connect();
      mockWs.readyState = WebSocket.OPEN;
      mockWs.emit('open');
      await connectPromise;
    });

    it('should send messages when connected', () => {
      const data = { key: 'value' };
      
      service.send(data);

      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"update"')
      );
      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringContaining('"key":"value"')
      );
    });

    it('should queue messages when not connected', () => {
      mockWs.readyState = WebSocket.CONNECTING;
      
      service.send({ message: 'test' });

      expect(mockWs.send).not.toHaveBeenCalled();
    });

    it('should process queued messages after connection', async () => {
      // Disconnect first
      service.disconnect();
      mockWs.send.mockClear();

      // Queue some messages
      service.send({ message: 'queued1' });
      service.send({ message: 'queued2' });

      // Reconnect
      const connectPromise = service.connect();
      mockWs.readyState = WebSocket.OPEN;
      mockWs.emit('open');
      await connectPromise;

      // Should send queued messages
      const calls = mockWs.send.mock.calls.map(call => call[0]);
      expect(calls.some(call => call.includes('"message":"queued1"'))).toBe(true);
      expect(calls.some(call => call.includes('"message":"queued2"'))).toBe(true);
    });

    it('should handle incoming update messages', () => {
      const messageHandler = vi.fn();
      const topicHandler = vi.fn();
      
      service.on('message', messageHandler);
      service.on('topic:test-topic', topicHandler);
      service.subscribe('test-topic');

      const message: IWebSocketMessage = {
        type: 'update',
        topic: 'test-topic',
        data: { value: 123 },
        timestamp: new Date().toISOString()
      };

      mockWs.emit('message', JSON.stringify(message));

      expect(messageHandler).toHaveBeenCalledWith(message);
      expect(topicHandler).toHaveBeenCalledWith({ value: 123 });
    });

    it('should ignore messages for unsubscribed topics', () => {
      const messageHandler = vi.fn();
      service.on('message', messageHandler);

      const message: IWebSocketMessage = {
        type: 'update',
        topic: 'unknown-topic',
        data: { value: 123 },
        timestamp: new Date().toISOString()
      };

      mockWs.emit('message', JSON.stringify(message));

      expect(messageHandler).not.toHaveBeenCalled();
    });

    it('should handle error messages', () => {
      const errorHandler = vi.fn();
      service.on('error', errorHandler);

      const message: IWebSocketMessage = {
        type: 'error',
        error: 'Something went wrong',
        timestamp: new Date().toISOString()
      };

      mockWs.emit('message', JSON.stringify(message));

      expect(errorHandler).toHaveBeenCalledWith(new Error('Something went wrong'));
    });

    it('should handle ping messages', () => {
      mockWs.send.mockClear();

      const message: IWebSocketMessage = {
        type: 'ping',
        timestamp: new Date().toISOString()
      };

      mockWs.emit('message', JSON.stringify(message));

      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringMatching(/"type":"pong"/)
      );
    });

    it('should handle malformed messages', () => {
      const errorHandler = vi.fn();
      service.on('error', errorHandler);

      mockWs.emit('message', 'invalid json');

      // Should not crash, just log error
      expect(errorHandler).not.toHaveBeenCalled();
    });
  });

  describe('Ping/Pong Mechanism', () => {
    beforeEach(async () => {
      const connectPromise = service.connect();
      mockWs.readyState = WebSocket.OPEN;
      mockWs.emit('open');
      await connectPromise;
      mockWs.send.mockClear();
    });

    it('should send ping messages periodically', () => {
      vi.advanceTimersByTime(5000);

      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringMatching(/"type":"ping"/)
      );
    });

    it('should respond to server ping with pong', () => {
      mockWs.emit('ping');

      expect(mockWs.pong).toHaveBeenCalled();
    });

    it('should handle pong messages', () => {
      // Should not throw or cause issues
      mockWs.emit('pong');
    });

    it('should stop ping timer on disconnect', () => {
      service.disconnect();
      mockWs.send.mockClear();

      vi.advanceTimersByTime(10000);

      expect(mockWs.send).not.toHaveBeenCalled();
    });
  });

  describe('Reconnection Logic', () => {
    beforeEach(async () => {
      const connectPromise = service.connect();
      mockWs.readyState = WebSocket.OPEN;
      mockWs.emit('open');
      await connectPromise;
    });

    it('should attempt reconnection on unexpected disconnect', () => {
      const reconnectingHandler = vi.fn();
      service.on('reconnecting', reconnectingHandler);

      mockWs.emit('close', 1006, 'Connection lost');

      expect(reconnectingHandler).toHaveBeenCalledWith({
        attempt: 1,
        nextAttemptIn: 1000
      });
    });

    it('should not reconnect on normal disconnect', () => {
      const reconnectingHandler = vi.fn();
      service.on('reconnecting', reconnectingHandler);

      mockWs.emit('close', 1000, 'Normal closure');

      expect(reconnectingHandler).not.toHaveBeenCalled();
    });

    it.skip('should increase reconnect delay with each attempt', async () => {
      const reconnectingHandler = vi.fn();
      service.on('reconnecting', reconnectingHandler);

      // First attempt
      mockWs.emit('close', 1006, 'Connection lost');
      expect(reconnectingHandler).toHaveBeenLastCalledWith({
        attempt: 1,
        nextAttemptIn: 1000
      });

      // Create new mock for failed reconnection
      const failMockWs = new EventEmitter();
      failMockWs.readyState = WebSocket.CONNECTING;
      failMockWs.send = vi.fn();
      failMockWs.close = vi.fn();
      failMockWs.removeAllListeners = vi.fn();
      (WebSocket as unknown as any).mockImplementation(() => failMockWs);

      // Trigger reconnect
      vi.advanceTimersByTime(1000);
      
      // Fail the reconnection
      await vi.runOnlyPendingTimersAsync();
      failMockWs.emit('error', new Error('Connection failed'));
      failMockWs.emit('close', 1006, 'Connection failed');

      // Second attempt with increased delay
      expect(reconnectingHandler).toHaveBeenLastCalledWith({
        attempt: 2,
        nextAttemptIn: 2000
      });
    });

    it.skip('should stop reconnecting after max attempts', async () => {
      const maxAttemptsHandler = vi.fn();
      service.on('max_reconnect_attempts', maxAttemptsHandler);

      // Create mocks for each reconnection attempt
      const failMocks = Array(3).fill(null).map(() => {
        const mock = new EventEmitter();
        mock.readyState = WebSocket.CONNECTING;
        mock.send = vi.fn();
        mock.close = vi.fn();
        mock.removeAllListeners = vi.fn();
        return mock;
      });

      let mockIndex = 0;
      (WebSocket as unknown as any).mockImplementation(() => failMocks[mockIndex++] || failMocks[0]);

      // Fail multiple times
      for (let i = 0; i < 3; i++) {
        mockWs.emit('close', 1006, 'Connection lost');
        vi.advanceTimersByTime(5000);
        
        if (i < 2) {
          // Fail the reconnection attempts
          await vi.runOnlyPendingTimersAsync();
          failMocks[i].emit('error', new Error('Connection failed'));
          failMocks[i].emit('close', 1006, 'Connection failed');
        }
      }

      // After 3 attempts, should emit max_reconnect_attempts
      expect(maxAttemptsHandler).toHaveBeenCalled();
    });

    it('should reset reconnect attempts on successful connection', async () => {
      // Fail once
      mockWs.emit('close', 1006, 'Connection lost');
      vi.advanceTimersByTime(1000);

      // Succeed on reconnect
      mockWs.readyState = WebSocket.OPEN;
      mockWs.emit('open');

      // Clear state
      const reconnectingHandler = vi.fn();
      service.on('reconnecting', reconnectingHandler);

      // Next disconnect should start from attempt 1 again
      mockWs.emit('close', 1006, 'Connection lost');
      expect(reconnectingHandler).toHaveBeenCalledWith({
        attempt: 1,
        nextAttemptIn: 1000
      });
    });

    it('should handle reconnect option disabled', () => {
      const noReconnectService = new WebSocketService({
        url: 'ws://localhost:8080',
        reconnect: false
      });

      const connectPromise = noReconnectService.connect();
      mockWs.readyState = WebSocket.OPEN;
      mockWs.emit('open');

      const reconnectingHandler = vi.fn();
      noReconnectService.on('reconnecting', reconnectingHandler);

      mockWs.emit('close', 1006, 'Connection lost');

      expect(reconnectingHandler).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should emit error events from WebSocket', async () => {
      // Need to establish connection first to avoid connection error handling
      const connectPromise = service.connect();
      mockWs.readyState = WebSocket.OPEN;
      mockWs.emit('open');
      await connectPromise;

      const errorHandler = vi.fn();
      service.on('error', errorHandler);

      const error = new Error('WebSocket error');
      mockWs.emit('error', error);

      expect(errorHandler).toHaveBeenCalledWith(error);
    });

    it('should handle send errors gracefully', async () => {
      const connectPromise = service.connect();
      mockWs.readyState = WebSocket.OPEN;
      mockWs.emit('open');
      await connectPromise;

      mockWs.send.mockImplementation(() => {
        throw new Error('Send failed');
      });

      // Should not throw
      expect(() => service.send({ data: 'test' })).not.toThrow();
    });
  });

  describe('State Management', () => {
    it('should track connection state correctly', async () => {
      expect(service.isConnected).toBe(false);

      const connectPromise = service.connect();
      expect(service.isConnected).toBe(false);

      mockWs.readyState = WebSocket.OPEN;
      mockWs.emit('open');
      await connectPromise;

      expect(service.isConnected).toBe(true);

      mockWs.readyState = WebSocket.CLOSED;
      expect(service.isConnected).toBe(false);
    });

    it('should track active subscriptions', () => {
      service.subscribe('topic1');
      service.subscribe('topic2');
      service.subscribe('topic3');
      service.unsubscribe('topic2');

      expect(service.activeSubscriptions).toEqual(['topic1', 'topic3']);
    });

    it('should clear state on disconnect', () => {
      service.subscribe('topic1');
      service.subscribe('topic2');
      
      service.disconnect();

      expect(service.activeSubscriptions).toEqual([]);
    });
  });
});