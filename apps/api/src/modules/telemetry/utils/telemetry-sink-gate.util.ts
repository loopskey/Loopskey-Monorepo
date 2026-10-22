export type SinkGateLimits = {
  concurrency: number;
  queueLength: number;
  waitMs: number;
};

export type SinkGateResult<T> = { shed: true } | { shed: false; value: T };

type Waiter = { grant: () => void; timer: ReturnType<typeof setTimeout> };

export class SinkGate {
  private active = 0;
  private readonly waiting: Waiter[] = [];

  constructor(private readonly limits: SinkGateLimits) {}

  get inFlight() {
    return this.active;
  }

  get queued() {
    return this.waiting.length;
  }

  async run<T>(task: () => Promise<T>): Promise<SinkGateResult<T>> {
    if (!(await this.acquire())) return { shed: true };
    try {
      return { shed: false, value: await task() };
    } finally {
      this.release();
    }
  }

  private acquire(): Promise<boolean> {
    if (this.active < this.limits.concurrency) {
      this.active += 1;
      return Promise.resolve(true);
    }
    if (this.waiting.length >= this.limits.queueLength)
      return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      const waiter: Waiter = {
        grant: () => {
          clearTimeout(waiter.timer);
          resolve(true);
        },
        timer: setTimeout(() => {
          const index = this.waiting.indexOf(waiter);
          if (index !== -1) this.waiting.splice(index, 1);
          resolve(false);
        }, this.limits.waitMs),
      };
      this.waiting.push(waiter);
    });
  }

  private release() {
    const next = this.waiting.shift();
    if (next) next.grant();
    else this.active -= 1;
  }
}
