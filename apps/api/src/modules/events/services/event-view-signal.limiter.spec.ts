import { EventViewSignalLimiter } from "./event-view-signal.limiter";

const MINUTE_MS = 60 * 1000;

describe("EventViewSignalLimiter", () => {
  it("allows the first view and refuses a repeat inside the dedupe window", () => {
    const limiter = new EventViewSignalLimiter();

    expect(limiter.allow("viewer", "event-1", 0)).toBe(true);
    expect(limiter.allow("viewer", "event-1", 29 * MINUTE_MS)).toBe(false);
  });

  it("allows the same viewer again once the dedupe window has passed", () => {
    const limiter = new EventViewSignalLimiter();

    limiter.allow("viewer", "event-1", 0);

    expect(limiter.allow("viewer", "event-1", 31 * MINUTE_MS)).toBe(true);
  });

  it("keeps viewers independent of each other", () => {
    const limiter = new EventViewSignalLimiter();

    expect(limiter.allow("viewer-1", "event-1", 0)).toBe(true);
    expect(limiter.allow("viewer-2", "event-1", 0)).toBe(true);
  });

  it("bounds how many distinct events one viewer can count per hour", () => {
    const limiter = new EventViewSignalLimiter();

    const results = Array.from({ length: 61 }, (_, index) =>
      limiter.allow("viewer", `event-${index}`, index),
    );

    expect(results.filter(Boolean)).toHaveLength(60);
    expect(results[60]).toBe(false);
    expect(limiter.allow("viewer", "event-new", 61 * MINUTE_MS)).toBe(true);
  });
});
