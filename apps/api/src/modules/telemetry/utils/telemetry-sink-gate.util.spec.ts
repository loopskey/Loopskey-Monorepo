import { SinkGate } from "@telemetry/utils/telemetry-sink-gate.util";

const deferred = () => {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
};

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("SinkGate", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("runs at most the allowed number of tasks at once", async () => {
    const gate = new SinkGate({
      concurrency: 2,
      queueLength: 10,
      waitMs: 1000,
    });
    const holds = [deferred(), deferred(), deferred(), deferred()];
    let running = 0;
    let peak = 0;

    const runs = holds.map((hold) =>
      gate.run(async () => {
        running += 1;
        peak = Math.max(peak, running);
        await hold.promise;
        running -= 1;
      }),
    );

    await flush();
    expect(gate.inFlight).toBe(2);
    expect(gate.queued).toBe(2);

    for (const hold of holds) {
      hold.release();
      await flush();
    }
    const results = await Promise.all(runs);

    expect(peak).toBe(2);
    expect(results.every((result) => !result.shed)).toBe(true);
    expect(gate.inFlight).toBe(0);
    expect(gate.queued).toBe(0);
  });

  it("returns the task's value", async () => {
    const gate = new SinkGate({ concurrency: 1, queueLength: 1, waitMs: 100 });

    await expect(gate.run(async () => 42)).resolves.toEqual({
      shed: false,
      value: 42,
    });
  });

  it("sheds a task immediately when the queue is full", async () => {
    const gate = new SinkGate({ concurrency: 1, queueLength: 1, waitMs: 1000 });
    const hold = deferred();
    const first = gate.run(() => hold.promise);
    const second = gate.run(async () => "queued");
    await flush();

    await expect(gate.run(async () => "dropped")).resolves.toEqual({
      shed: true,
    });

    hold.release();
    await first;
    await expect(second).resolves.toEqual({ shed: false, value: "queued" });
  });

  it("sheds a task that waited longer than allowed and frees its place", async () => {
    jest.useFakeTimers();
    const gate = new SinkGate({ concurrency: 1, queueLength: 5, waitMs: 500 });
    const hold = deferred();
    const first = gate.run(() => hold.promise);
    const waiting = gate.run(async () => "late");

    await jest.advanceTimersByTimeAsync(501);

    await expect(waiting).resolves.toEqual({ shed: true });
    expect(gate.queued).toBe(0);

    hold.release();
    await first;
    expect(gate.inFlight).toBe(0);
  });

  it("releases its slot when a task throws", async () => {
    const gate = new SinkGate({ concurrency: 1, queueLength: 1, waitMs: 100 });

    await expect(
      gate.run(async () => {
        throw new Error("sink unavailable");
      }),
    ).rejects.toThrow("sink unavailable");

    expect(gate.inFlight).toBe(0);
    await expect(gate.run(async () => "after")).resolves.toEqual({
      shed: false,
      value: "after",
    });
  });

  it("hands a freed slot to the longest waiting task first", async () => {
    const gate = new SinkGate({ concurrency: 1, queueLength: 5, waitMs: 1000 });
    const order: string[] = [];
    const hold = deferred();
    const first = gate.run(() => hold.promise);
    const second = gate.run(async () => order.push("second"));
    const third = gate.run(async () => order.push("third"));
    await flush();

    hold.release();
    await Promise.all([first, second, third]);

    expect(order).toEqual(["second", "third"]);
  });
});
