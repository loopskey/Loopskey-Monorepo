import { RecordTelemetryDocument } from "@/lib/graphql/operations/telemetry";
import { TELEMETRY_LIMITS } from "@loopskey/api-contracts/validation";
import { documentToString } from "@/utils/function-helper";
import { hasOptedOut } from "@/lib/telemetry/privacy";

import type { TelemetryConversionInput } from "@/lib/graphql/base";
import type { TelemetryVitalInput } from "@/lib/graphql/base";

const FLUSH_DELAY_MS = 4000;
const RETRY_DELAY_MS = 5000;
const MAX_ATTEMPTS = 2;
const MAX_QUEUED = 24;
const MIN_ID_LENGTH = 12;
const FALLBACK_ID_RADIX = 36;

type Batch = {
  vitals: TelemetryVitalInput[];
  conversions: TelemetryConversionInput[];
  attempts: number;
};

let vitals: TelemetryVitalInput[] = [];
let conversions: TelemetryConversionInput[] = [];
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let isListening = false;

export const newEventId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(FALLBACK_ID_RADIX)}${Math.random()
        .toString(FALLBACK_ID_RADIX)
        .slice(2)}`.padEnd(MIN_ID_LENGTH, "0");

const endpoint = () => process.env.NEXT_PUBLIC_GRAPHQL_URL;

const isRetryable = (status: number) => status === 0 || status >= 500;

const post = async (batch: Batch): Promise<number> => {
  const target = endpoint();
  if (!target) return 400;
  try {
    const response = await fetch(target, {
      method: "POST",
      credentials: "omit",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: documentToString(RecordTelemetryDocument),
        variables: {
          input: { vitals: batch.vitals, conversions: batch.conversions },
        },
      }),
    });
    return response.status;
  } catch {
    return 0;
  }
};

const deliver = async (batch: Batch) => {
  if (hasOptedOut() || navigator.onLine === false) return;
  const status = await post(batch);
  if (!isRetryable(status) || batch.attempts + 1 >= MAX_ATTEMPTS) return;
  setTimeout(
    () => void deliver({ ...batch, attempts: batch.attempts + 1 }),
    RETRY_DELAY_MS,
  );
};

const takeBatches = () => {
  const taken: Batch[] = [];
  while (vitals.length > 0 || conversions.length > 0) {
    taken.push({
      vitals: vitals.slice(0, TELEMETRY_LIMITS.vitalsPerBatchMax),
      conversions: conversions.slice(
        0,
        TELEMETRY_LIMITS.conversionsPerBatchMax,
      ),
      attempts: 0,
    });
    vitals = vitals.slice(TELEMETRY_LIMITS.vitalsPerBatchMax);
    conversions = conversions.slice(TELEMETRY_LIMITS.conversionsPerBatchMax);
  }
  return taken;
};

export const flushTelemetry = () => {
  clearTimeout(flushTimer);
  flushTimer = undefined;
  for (const batch of takeBatches()) void deliver(batch);
};

const listenForPageHide = () => {
  if (isListening) return;
  isListening = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushTelemetry();
  });
  window.addEventListener("pagehide", flushTelemetry);
};

const schedule = () => {
  listenForPageHide();
  flushTimer ??= setTimeout(flushTelemetry, FLUSH_DELAY_MS);
};

const hasRoom = () => vitals.length + conversions.length < MAX_QUEUED;

export const enqueueVital = (vital: TelemetryVitalInput) => {
  if (hasOptedOut() || !hasRoom()) return;
  vitals.push(vital);
  schedule();
};

export const enqueueConversion = (conversion: TelemetryConversionInput) => {
  if (hasOptedOut() || !hasRoom()) return;
  conversions.push(conversion);
  schedule();
};
