import { SearchHealthNotice } from "@telemetry/enums/telemetry-register.enum";

export type NoticeFacts = {
  days: number;
  sampleRate: number;
  daysWithData: number;
  failedEvents: number;
  isCollecting: boolean;
  minimumSamples: number;
  conversionEvents: number;
  rateLimitedEvents: number;
  vitalSegmentSamples: number[];
};

export const noticesOf = (facts: NoticeFacts): SearchHealthNotice[] => {
  const hasVitals = facts.vitalSegmentSamples.length > 0;
  const hasAggregates = hasVitals || facts.conversionEvents > 0;
  const reachesFloor = facts.vitalSegmentSamples.some(
    (samples) => samples >= facts.minimumSamples,
  );
  const notices: SearchHealthNotice[] = [];

  if (!facts.isCollecting) notices.push(SearchHealthNotice.COLLECTION_DISABLED);
  if (facts.isCollecting && facts.sampleRate < 1)
    notices.push(SearchHealthNotice.SAMPLED);
  if (facts.isCollecting && !hasAggregates)
    notices.push(SearchHealthNotice.NO_DATA);
  if (facts.isCollecting && hasAggregates && facts.daysWithData < facts.days)
    notices.push(SearchHealthNotice.PARTIAL_COVERAGE);
  if (hasVitals && !reachesFloor)
    notices.push(SearchHealthNotice.INSUFFICIENT_SAMPLES);
  if (facts.failedEvents > 0)
    notices.push(SearchHealthNotice.DELIVERY_FAILURES);
  if (facts.rateLimitedEvents > 0)
    notices.push(SearchHealthNotice.RATE_LIMITED);
  if (hasAggregates) notices.push(SearchHealthNotice.AGGREGATES_AVAILABLE);

  return notices;
};
