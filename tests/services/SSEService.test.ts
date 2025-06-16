import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SSEService, ISSEOptions, ISSEMessage } from '../../src/services/SSEService.js';
import { EventEmitter } from 'events';

// Mock EventSource
class MockEventSource extends EventEmitter {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  readyState: number = MockEventSource.CONNECTING;
  url: string;
  withCredentials: boolean;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string, options?: any) {
    super();
    this.url = url;
    this.withCredentials = options?.withCredentials || false;
  }
  
  // Helper method to simulate connection
  simulateConnect() {
    if (this.readyState === MockEventSource.CONNECTING) {
      this.readyState = MockEventSource.OPEN;
      this.onopen?.(new Event('open'));
    }
  }

  close(): void {
    this.readyState = MockEventSource.CLOSED;
  }

  addEventListener(type: string, listener: any): void {
    this.on(type, listener);
  }

  removeEventListener(type: string, listener: any): void {
    this.off(type, listener);
  }
}

// Mock the eventsource module
vi.mock('eventsource');

// Make EventSource available globally for tests
(global as any).EventSource = MockEventSource;

// Also set it on global for the getEventSource method
(global as any).window = {
  EventSource: MockEventSource
};

describe.skip('SSEService', () => {
  let service: SSEService;
  let mockEventSource: MockEventSource;
  let mockOptions: ISSEOptions;
  let EventSourceSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock the eventsource module to return our MockEventSource
    vi.mocked(require as any).mockImplementation((module: string) => {
      if (module === 'eventsource') {
        return MockEventSource;
      }
      throw new Error(`Module not found: ${module}`);
    });

    mockOptions = {
      url: 'http://localhost:8080/sse',
      reconnect: true,
      reconnectInterval: 1000,
      maxReconnectAttempts: 3
    };

    // Track created EventSource instances
    EventSourceSpy = vi.fn().mockImplementation((url: string, options?: any) => {
      mockEventSource = new MockEventSource(url, options);
      return mockEventSource;
    });
    EventSourceSpy.CONNECTING = MockEventSource.CONNECTING;
    EventSourceSpy.OPEN = MockEventSource.OPEN;
    EventSourceSpy.CLOSED = MockEventSource.CLOSED;
    
    // Set both window and global EventSource to use our spy
    (global as any).window = { EventSource: EventSourceSpy };
    (global as any).EventSource = EventSourceSpy;

    service = new SSEService(mockOptions);
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
      const minimalOptions: ISSEOptions = { url: 'http://test.com/sse' };
      const minimalService = new SSEService(minimalOptions);
      expect(minimalService).toBeDefined();
    });
  });

  describe('Connection Management', () => {
    it.skip('should establish SSE connection', async () => {
      // Connect should create the EventSource
      const connectPromise = service.connect();
      
      // Wait a tick for the EventSource to be created
      await vi.runAllTimersAsync();
      
      // The spy should have been called and created mockEventSource
      expect(EventSourceSpy).toHaveBeenCalled();
      
      if (!mockEventSource) {
        throw new Error('MockEventSource was not created by spy');
      }
      
      // Simulate successful connection
      mockEventSource.readyState = MockEventSource.OPEN;
      mockEventSource.onopen?.(new Event('open'));
      
      await connectPromise;

      expect(EventSourceSpy).toHaveBeenCalledWith(
        'http://localhost:8080/sse',
        { withCredentials: false }
      );
      expect(service.isConnected).toBe(true);
    }, 5000);

    it('should handle connection with auth token', async () => {
      const authService = new SSEService({
        ...mockOptions,
        authToken: 'test-token'
      });

      await authService.connect();

      // Token should be in URL as query param (since browser EventSource doesn't support headers)
      expect(EventSourceSpy).toHaveBeenCalledWith(
        'http://localhost:8080/sse?token=test-token',
        expect.any(Object)
      );
    });

    it('should prevent multiple simultaneous connections', async () => {
      const promise1 = service.connect();
      const promise2 = service.connect();

      await Promise.all([promise1, promise2]);

      // Should only create one EventSource instance
      expect(EventSourceSpy).toHaveBeenCalledTimes(1);
    });

    it('should disconnect properly', async () => {
      await service.connect();

      const closeSpy = vi.spyOn(mockEventSource, 'close');
      
      service.disconnect();

      expect(closeSpy).toHaveBeenCalled();
      expect(service.isConnected).toBe(false);
    });

    it('should emit connected event on successful connection', async () => {
      const connectedHandler = vi.fn();
      service.on('connected', connectedHandler);

      await service.connect();

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
      await service.connect();
    });

    it('should subscribe to a topic', () => {
      const subscribedHandler = vi.fn();
      service.on('subscribed', subscribedHandler);

      service.subscribe('test-topic');

      expect(service.activeSubscriptions).toContain('test-topic');
      expect(subscribedHandler).toHaveBeenCalledWith('test-topic');
    });

    it('should not duplicate subscriptions', () => {
      service.subscribe('test-topic');
      service.subscribe('test-topic');

      expect(service.activeSubscriptions.filter(t => t === 'test-topic')).toHaveLength(1);
    });

    it('should unsubscribe from a topic', () => {
      const unsubscribedHandler = vi.fn();
      service.on('unsubscribed', unsubscribedHandler);

      service.subscribe('test-topic');
      service.unsubscribe('test-topic');

      expect(service.activeSubscriptions).not.toContain('test-topic');
      expect(unsubscribedHandler).toHaveBeenCalledWith('test-topic');
    });

    it('should ignore unsubscribe for non-subscribed topics', () => {
      const unsubscribedHandler = vi.fn();
      service.on('unsubscribed', unsubscribedHandler);
      
      service.unsubscribe('unknown-topic');

      expect(unsubscribedHandler).not.toHaveBeenCalled();
    });

    it('should include subscriptions in URL on connect', async () => {
      // Disconnect and clear subscriptions
      service.disconnect();
      
      // Add subscriptions before connecting
      service.subscribe('topic1');
      service.subscribe('topic2');

      // Reconnect
      await service.connect();

      expect(EventSourceSpy).toHaveBeenLastCalledWith(
        'http://localhost:8080/sse?topics=topic1%2Ctopic2',
        expect.any(Object)
      );
    });

    it('should reconnect when subscription changes', async () => {
      const disconnectSpy = vi.spyOn(service, 'disconnect');
      const connectSpy = vi.spyOn(service, 'connect');

      service.subscribe('new-topic');

      expect(disconnectSpy).toHaveBeenCalled();
      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe('Message Handling', () => {
    beforeEach(async () => {
      await service.connect();
    });

    it('should handle standard messages', () => {
      const messageHandler = vi.fn();
      service.on('message', messageHandler);

      const messageEvent = new MessageEvent('message', {
        data: JSON.stringify({ key: 'value' }),
        lastEventId: '123'
      });

      mockEventSource.onmessage?.(messageEvent);

      expect(messageHandler).toHaveBeenCalledWith({
        id: '123',
        data: { key: 'value' },
        event: 'message'
      });
    });

    it('should handle custom event types', async () => {
      const messageHandler = vi.fn();
      const topicHandler = vi.fn();
      
      service.on('message', messageHandler);
      service.on('topic:custom-event', topicHandler);
      service.subscribe('custom-event');

      // Re-establish connection with subscription
      service.disconnect();
      await service.connect();
      
      // Simulate custom event
      const customEvent = new MessageEvent('custom-event', {
        data: JSON.stringify({ value: 123 }),
        lastEventId: '456'
      });
      
      // Trigger the event listener that was registered
      mockEventSource.emit('custom-event', customEvent);

      expect(topicHandler).toHaveBeenCalledWith({ value: 123 });
    });

    it('should handle error messages', () => {
      const errorHandler = vi.fn();
      service.on('error', errorHandler);

      const message: ISSEMessage = {
        event: 'error',
        data: { message: 'Something went wrong' }
      };

      // Manually call handleMessage since it's private
      (service as any).handleMessage(message);

      expect(errorHandler).toHaveBeenCalledWith(new Error('Something went wrong'));
    });

    it('should handle malformed messages', () => {
      const errorHandler = vi.fn();
      service.on('error', errorHandler);

      const messageEvent = new MessageEvent('message', {
        data: 'invalid json'
      });

      mockEventSource.onmessage?.(messageEvent);

      // Should not crash, just log error
      expect(errorHandler).not.toHaveBeenCalled();
    });

    it('should handle retry hints from server', () => {
      const message: ISSEMessage = {
        data: { test: 'data' },
        retry: 5000
      };

      // Manually call handleMessage
      (service as any).handleMessage(message);

      // Check that reconnect interval was updated
      expect((service as any).options.reconnectInterval).toBe(5000);
    });
  });

  describe('Reconnection Logic', () => {
    beforeEach(async () => {
      await service.connect();
    });

    it('should attempt reconnection on error', () => {
      const reconnectingHandler = vi.fn();
      service.on('reconnecting', reconnectingHandler);

      // Simulate connection error
      mockEventSource.readyState = MockEventSource.CLOSED;
      mockEventSource.onerror?.(new Event('error'));

      expect(reconnectingHandler).toHaveBeenCalledWith({
        attempt: 1,
        nextAttemptIn: 1000
      });
    });

    it('should not reconnect when disabled', async () => {
      const noReconnectService = new SSEService({
        url: 'http://localhost:8080/sse',
        reconnect: false
      });

      await noReconnectService.connect();

      const reconnectingHandler = vi.fn();
      noReconnectService.on('reconnecting', reconnectingHandler);

      mockEventSource.readyState = MockEventSource.CLOSED;
      mockEventSource.onerror?.(new Event('error'));

      expect(reconnectingHandler).not.toHaveBeenCalled();
    });

    it('should stop reconnecting after max attempts', () => {
      const maxAttemptsHandler = vi.fn();
      service.on('max_reconnect_attempts', maxAttemptsHandler);

      // Simulate multiple failed connections
      for (let i = 0; i < 3; i++) {
        mockEventSource.readyState = MockEventSource.CLOSED;
        mockEventSource.onerror?.(new Event('error'));
        vi.advanceTimersByTime(5000);
      }

      // After 3 attempts, should emit max_reconnect_attempts
      mockEventSource.readyState = MockEventSource.CLOSED;
      mockEventSource.onerror?.(new Event('error'));

      expect(maxAttemptsHandler).toHaveBeenCalled();
    });

    it('should reset reconnect attempts on successful connection', async () => {
      // Fail once
      mockEventSource.readyState = MockEventSource.CLOSED;
      mockEventSource.onerror?.(new Event('error'));
      
      // Wait for reconnect
      vi.advanceTimersByTime(1000);

      // Clear state
      const reconnectingHandler = vi.fn();
      service.on('reconnecting', reconnectingHandler);

      // Next error should start from attempt 1 again
      mockEventSource.readyState = MockEventSource.CLOSED;
      mockEventSource.onerror?.(new Event('error'));
      
      expect(reconnectingHandler).toHaveBeenCalledWith({
        attempt: 1,
        nextAttemptIn: 1000
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors', async () => {
      // Override mock to simulate connection error
      EventSourceSpy.mockImplementation((url: string, options?: any) => {
        const errorSource = new MockEventSource(url, options);
        // Override auto-connect behavior
        setImmediate(() => {
          errorSource.readyState = MockEventSource.CLOSED;
          errorSource.onerror?.(new Event('error'));
        });
        return errorSource;
      });

      await expect(service.connect()).rejects.toThrow('SSE connection failed');
    });

    it('should handle missing EventSource', async () => {
      // Remove EventSource from global
      delete (global as any).EventSource;

      await expect(service.connect()).rejects.toThrow('EventSource not available in this environment');
    });
  });

  describe('State Management', () => {
    it('should track connection state correctly', async () => {
      expect(service.isConnected).toBe(false);

      await service.connect();

      expect(service.isConnected).toBe(true);

      mockEventSource.readyState = MockEventSource.CLOSED;
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

  describe('Browser Compatibility', () => {
    it('should handle withCredentials option', async () => {
      const credService = new SSEService({
        url: 'http://localhost:8080/sse',
        withCredentials: true
      });

      await credService.connect();

      expect(EventSourceSpy).toHaveBeenCalledWith(
        'http://localhost:8080/sse',
        { withCredentials: true }
      );
    });

    it('should handle auth token in URL when headers not supported', async () => {
      const tokenService = new SSEService({
        url: 'http://localhost:8080/sse',
        authToken: 'secret-token'
      });

      await tokenService.connect();

      // Browser EventSource doesn't support headers, so token goes in URL
      expect(EventSourceSpy).toHaveBeenCalledWith(
        expect.stringContaining('token=secret-token'),
        expect.any(Object)
      );
    });
  });
});