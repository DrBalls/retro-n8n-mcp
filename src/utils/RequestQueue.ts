import { EventEmitter } from 'events';

export interface QueuedRequest<T = unknown> {
  id: string;
  priority: number;
  timestamp: number;
  execute: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (error: Error) => void;
}

export class RequestQueue extends EventEmitter {
  private queue: Array<QueuedRequest<any>> = [];
  private running = 0;
  private concurrency: number;
  private interval: number;
  private intervalCap: number;
  private lastInterval = 0;
  private intervalCount = 0;
  private paused = false;

  constructor(options: {
    concurrency?: number;
    interval?: number;
    intervalCap?: number;
  } = {}) {
    super();
    this.concurrency = options.concurrency ?? 5;
    this.interval = options.interval ?? 100;
    this.intervalCap = options.intervalCap ?? 10;
  }

  async add<T>(
    execute: () => Promise<T>,
    priority = 0,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const id = Math.random().toString(36).substring(7);
      const request: QueuedRequest<T> = {
        id,
        priority,
        timestamp: Date.now(),
        execute,
        resolve: resolve as (value: unknown) => void,
        reject,
      };

      this.queue.push(request);
      this.queue.sort((a, b) => {
        // Higher priority first
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        // Earlier timestamp first (FIFO for same priority)
        return a.timestamp - b.timestamp;
      });

      this.emit('enqueue', { id, queueSize: this.queue.length });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.paused || this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    // Rate limiting by interval
    if (this.interval > 0) {
      const now = Date.now();
      if (now - this.lastInterval < this.interval) {
        if (this.intervalCount >= this.intervalCap) {
          // Wait for next interval
          setTimeout(() => this.process(), this.interval - (now - this.lastInterval));
          return;
        }
      } else {
        this.lastInterval = now;
        this.intervalCount = 0;
      }
    }

    const request = this.queue.shift();
    if (!request) return;

    this.running++;
    this.intervalCount++;
    this.emit('start', { id: request.id, running: this.running });

    try {
      const result = await request.execute();
      request.resolve(result);
      this.emit('success', { id: request.id, running: this.running - 1 });
    } catch (error) {
      request.reject(error as Error);
      this.emit('error', { id: request.id, error, running: this.running - 1 });
    } finally {
      this.running--;
      this.emit('complete', { id: request.id, running: this.running });
      // Process next request
      setImmediate(() => this.process());
    }
  }

  pause(): void {
    this.paused = true;
    this.emit('paused');
  }

  resume(): void {
    this.paused = false;
    this.emit('resumed');
    this.process();
  }

  clear(): void {
    const cleared = this.queue.length;
    this.queue.forEach(request => {
      request.reject(new Error('Queue cleared'));
    });
    this.queue = [];
    this.emit('cleared', { count: cleared });
  }

  get size(): number {
    return this.queue.length;
  }

  get pending(): number {
    return this.queue.length;
  }

  get active(): number {
    return this.running;
  }

  get isPaused(): boolean {
    return this.paused;
  }
}