import { RoadmapAiMessageCode, type ServiceAiFailure } from "./service-ai.port";
import { type ProviderErrorResponse } from "./generated/service-ai.types";

const CAPACITY_CODES = new Set([
  "AT_CAPACITY",
  "CAPACITY",
  "OVERLOADED",
  "RATE_LIMITED",
  "TOO_MANY_REQUESTS",
]);

const REFUSAL_CODES = new Set([
  "REFUSED",
  "OFF_TOPIC",
  "UNRELATED_INPUT",
  "INPUT_UNRELATED",
]);

const TRUNCATION_CODES = new Set([
  "TRUNCATED",
  "OUTPUT_TRUNCATED",
  "RESPONSE_TRUNCATED",
  "MAX_TOKENS",
]);

const normalise = (code: string) =>
  code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_");

export const parseRetryAfter = (
  value: string | null | undefined,
  now: Date = new Date(),
): number | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  const at = Date.parse(trimmed);
  if (Number.isNaN(at)) return null;
  const seconds = Math.ceil((at - now.getTime()) / 1000);
  return seconds > 0 ? seconds : null;
};

export const translateErrorEnvelope = (
  envelope: ProviderErrorResponse,
  retryAfterSeconds: number | null,
): ServiceAiFailure => {
  const code = normalise(envelope.code);
  const retryable = envelope.retryable;

  if (CAPACITY_CODES.has(code))
    return {
      ok: false,
      retryable,
      kind: "busy",
      retryAfterSeconds,
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_BUSY,
    };

  if (REFUSAL_CODES.has(code))
    return {
      ok: false,
      retryable,
      kind: "refused",
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_REFUSED,
    };

  if (TRUNCATION_CODES.has(code))
    return {
      ok: false,
      retryable,
      kind: "truncated",
      recovery: "REDUCE_CANDIDATES",
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_FAILED,
    };

  return retryable
    ? {
        ok: false,
        retryable,
        kind: "unavailable",
        messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
      }
    : {
        ok: false,
        retryable,
        kind: "failed",
        messageCode: RoadmapAiMessageCode.ROADMAP_AI_FAILED,
      };
};

export const translateTransportFailure = (
  status: number | null,
): ServiceAiFailure =>
  status === null || status >= 500
    ? {
        ok: false,
        retryable: true,
        kind: "unavailable",
        messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
      }
    : {
        ok: false,
        retryable: false,
        kind: "failed",
        messageCode: RoadmapAiMessageCode.ROADMAP_AI_FAILED,
      };
