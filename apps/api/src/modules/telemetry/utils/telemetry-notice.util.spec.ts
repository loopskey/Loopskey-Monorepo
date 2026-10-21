import { SearchHealthNotice } from "@telemetry/enums/telemetry-register.enum";
import { noticesOf } from "@telemetry/utils/telemetry-notice.util";

import type { NoticeFacts } from "@telemetry/utils/telemetry-notice.util";

const facts = (overrides: Partial<NoticeFacts> = {}): NoticeFacts => ({
  days: 7,
  daysWithData: 7,
  sampleRate: 1,
  isCollecting: true,
  minimumSamples: 100,
  failedEvents: 0,
  conversionEvents: 0,
  rateLimitedEvents: 0,
  vitalSegmentSamples: [],
  ...overrides,
});

describe("noticesOf", () => {
  it("reports an enabled collector with nothing in the window as no data, never as zero traffic", () => {
    expect(noticesOf(facts({ daysWithData: 0 }))).toEqual([
      SearchHealthNotice.NO_DATA,
    ]);
  });

  it("reports a disabled collector without calling the window empty", () => {
    expect(noticesOf(facts({ isCollecting: false, daysWithData: 0 }))).toEqual([
      SearchHealthNotice.COLLECTION_DISABLED,
    ]);
  });

  it("keeps older aggregates visible while collection is off", () => {
    expect(
      noticesOf(facts({ isCollecting: false, vitalSegmentSamples: [400] })),
    ).toEqual([
      SearchHealthNotice.COLLECTION_DISABLED,
      SearchHealthNotice.AGGREGATES_AVAILABLE,
    ]);
  });

  it("marks sampled collection only while it is on", () => {
    expect(
      noticesOf(facts({ sampleRate: 0.25, vitalSegmentSamples: [400] })),
    ).toContain(SearchHealthNotice.SAMPLED);
    expect(
      noticesOf(
        facts({
          isCollecting: false,
          sampleRate: 0.25,
          vitalSegmentSamples: [400],
        }),
      ),
    ).not.toContain(SearchHealthNotice.SAMPLED);
  });

  it("flags partial coverage when only some days have data", () => {
    expect(
      noticesOf(facts({ daysWithData: 3, vitalSegmentSamples: [400] })),
    ).toEqual([
      SearchHealthNotice.PARTIAL_COVERAGE,
      SearchHealthNotice.AGGREGATES_AVAILABLE,
    ]);
  });

  it("treats every segment under the floor as insufficient", () => {
    expect(noticesOf(facts({ vitalSegmentSamples: [12, 99] }))).toEqual([
      SearchHealthNotice.INSUFFICIENT_SAMPLES,
      SearchHealthNotice.AGGREGATES_AVAILABLE,
    ]);
  });

  it("stops calling the window insufficient once one segment reaches the floor", () => {
    expect(noticesOf(facts({ vitalSegmentSamples: [12, 100] }))).toEqual([
      SearchHealthNotice.AGGREGATES_AVAILABLE,
    ]);
  });

  it("does not call a window with conversions only insufficient", () => {
    expect(noticesOf(facts({ conversionEvents: 3 }))).toEqual([
      SearchHealthNotice.AGGREGATES_AVAILABLE,
    ]);
  });

  it("reports delivery failures and rate limiting separately", () => {
    expect(
      noticesOf(
        facts({
          failedEvents: 4,
          rateLimitedEvents: 2,
          vitalSegmentSamples: [400],
        }),
      ),
    ).toEqual([
      SearchHealthNotice.DELIVERY_FAILURES,
      SearchHealthNotice.RATE_LIMITED,
      SearchHealthNotice.AGGREGATES_AVAILABLE,
    ]);
  });

  it("reports failures even when nothing could be stored", () => {
    expect(noticesOf(facts({ daysWithData: 0, failedEvents: 9 }))).toEqual([
      SearchHealthNotice.NO_DATA,
      SearchHealthNotice.DELIVERY_FAILURES,
    ]);
  });
});
