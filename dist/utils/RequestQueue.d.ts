import { EventEmitter } from 'events';
export interface QueuedRequest<T = unknown> {
    id: string;
    priority: number;
    timestamp: number;
    execute: () => Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (error: Error) => void;
}
export declare class RequestQueue extends EventEmitter {
    private queue;
    private running;
    private concurrency;
    private interval;
    private intervalCap;
    private lastInterval;
    private intervalCount;
    private paused;
    constructor(options?: {
        concurrency?: number;
        interval?: number;
        intervalCap?: number;
    });
    add<T>(execute: () => Promise<T>, priority?: number): Promise<T>;
    private process;
    pause(): void;
    resume(): void;
    clear(): void;
    get size(): number;
    get pending(): number;
    get active(): number;
    get isPaused(): boolean;
}
//# sourceMappingURL=RequestQueue.d.ts.map