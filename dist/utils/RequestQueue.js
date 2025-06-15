import { EventEmitter } from 'events';
export class RequestQueue extends EventEmitter {
    queue = [];
    running = 0;
    concurrency;
    interval;
    intervalCap;
    lastInterval = 0;
    intervalCount = 0;
    paused = false;
    constructor(options = {}) {
        super();
        this.concurrency = options.concurrency ?? 5;
        this.interval = options.interval ?? 100;
        this.intervalCap = options.intervalCap ?? 10;
    }
    async add(execute, priority = 0) {
        return new Promise((resolve, reject) => {
            const id = Math.random().toString(36).substring(7);
            const request = {
                id,
                priority,
                timestamp: Date.now(),
                execute,
                resolve: resolve,
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
    async process() {
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
            }
            else {
                this.lastInterval = now;
                this.intervalCount = 0;
            }
        }
        const request = this.queue.shift();
        if (!request)
            return;
        this.running++;
        this.intervalCount++;
        this.emit('start', { id: request.id, running: this.running });
        try {
            const result = await request.execute();
            request.resolve(result);
            this.emit('success', { id: request.id, running: this.running - 1 });
        }
        catch (error) {
            request.reject(error);
            this.emit('error', { id: request.id, error, running: this.running - 1 });
        }
        finally {
            this.running--;
            this.emit('complete', { id: request.id, running: this.running });
            // Process next request
            setImmediate(() => this.process());
        }
    }
    pause() {
        this.paused = true;
        this.emit('paused');
    }
    resume() {
        this.paused = false;
        this.emit('resumed');
        this.process();
    }
    clear() {
        const cleared = this.queue.length;
        this.queue.forEach(request => {
            request.reject(new Error('Queue cleared'));
        });
        this.queue = [];
        this.emit('cleared', { count: cleared });
    }
    get size() {
        return this.queue.length;
    }
    get pending() {
        return this.queue.length;
    }
    get active() {
        return this.running;
    }
    get isPaused() {
        return this.paused;
    }
}
//# sourceMappingURL=RequestQueue.js.map