import {
  notConfiguredFailure,
  parseRetryAfter,
  translateErrorEnvelope,
  translateTransportFailure,
} from "./service-ai.failure";
import { RoadmapAiMessageCode } from "./service-ai.port";

const envelope = (
  code: string,
  retryable: boolean,
  correlationId: string | null = null,
) => ({
  code,
  retryable,
  message: "Provider says so.",
  correlation_id: correlationId,
});

describe("the retryable flag decides retryability", () => {
  it.each(["AT_CAPACITY", "REFUSED", "TRUNCATED", "SOMETHING_NEW"])(
    "honours the flag for the %s code",
    (code) => {
      expect(translateErrorEnvelope(envelope(code, true), null).retryable).toBe(
        true,
      );
      expect(
        translateErrorEnvelope(envelope(code, false), null).retryable,
      ).toBe(false);
    },
  );

  it.each([
    "OVERLOADED",
    "AT_CAPACITY",
    "UPSTREAM_TIMEOUT",
    "OUTPUT_TRUNCATED",
    "MODEL_OUTPUT_TRUNCATED",
  ])(
    "never turns the known code %s into a retry when the provider said it is not retryable",
    (code) => {
      expect(translateErrorEnvelope(envelope(code, false), 30)).toMatchObject({
        retryable: false,
        kind: "failed",
      });
    },
  );

  it("makes an unknown retryable code retryable and unavailable", () => {
    expect(
      translateErrorEnvelope(envelope("QUOTA_REFRESHING", true), null),
    ).toEqual({
      ok: false,
      retryable: true,
      kind: "unavailable",
      retryAfterSeconds: null,
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
      providerCode: "QUOTA_REFRESHING",
      providerCorrelationId: null,
    });
  });

  it("makes an unknown non-retryable code the generic failure", () => {
    expect(
      translateErrorEnvelope(envelope("SOMETHING_ENTIRELY_NEW", false), null),
    ).toEqual({
      ok: false,
      retryable: false,
      kind: "failed",
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_FAILED,
      providerCode: "SOMETHING_ENTIRELY_NEW",
      providerCorrelationId: null,
    });
  });
});

describe("the provider's real error codes", () => {
  it.each([
    ["VALIDATION_ERROR", false, "failed"],
    ["AUTH_FAILED", false, "failed"],
    ["MODEL_OUTPUT_INVALID", false, "failed"],
    ["MODEL_OUTPUT_TRUNCATED", false, "failed"],
    ["UPSTREAM_REJECTED", false, "failed"],
    ["INTERNAL", false, "failed"],
    ["MODEL_REFUSED", false, "refused"],
    ["OVERLOADED", true, "busy"],
    ["UPSTREAM_ERROR", true, "unavailable"],
    ["UPSTREAM_TIMEOUT", true, "unavailable"],
    ["NOT_READY", true, "unavailable"],
  ])("maps %s with retryable=%s to %s", (code, retryable, kind) => {
    expect(translateErrorEnvelope(envelope(code, retryable), 10)).toMatchObject(
      { retryable, kind, providerCode: code },
    );
  });

  it("lets the provider's flag, not the code name, decide for a retryable truncation", () => {
    expect(
      translateErrorEnvelope(envelope("MODEL_OUTPUT_TRUNCATED", true), null),
    ).toMatchObject({ retryable: true, kind: "truncated" });
  });

  it("tolerates a code the platform has never seen", () => {
    expect(() =>
      translateErrorEnvelope(envelope("FUTURE_CODE_2027", false), null),
    ).not.toThrow();
    expect(
      translateErrorEnvelope(envelope("FUTURE_CODE_2027", true), null),
    ).toMatchObject({ retryable: true, kind: "unavailable" });
  });
});

describe("the named outcomes", () => {
  it("surfaces a refusal as its own outcome, not an error", () => {
    expect(translateErrorEnvelope(envelope("OFF_TOPIC", false), null)).toEqual({
      ok: false,
      retryable: false,
      kind: "refused",
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_REFUSED,
      providerCode: "OFF_TOPIC",
      providerCorrelationId: null,
    });
  });

  it("carries the advertised wait on a capacity outcome", () => {
    expect(translateErrorEnvelope(envelope("AT_CAPACITY", true), 30)).toEqual({
      ok: false,
      kind: "busy",
      retryable: true,
      retryAfterSeconds: 30,
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_BUSY,
      providerCode: "AT_CAPACITY",
      providerCorrelationId: null,
    });
  });

  it("reports a capacity outcome with no advertised wait as such", () => {
    expect(
      translateErrorEnvelope(envelope("AT_CAPACITY", true), null),
    ).toMatchObject({ kind: "busy", retryAfterSeconds: null });
  });

  it("carries the advertised wait on any other retryable outcome", () => {
    expect(
      translateErrorEnvelope(envelope("UPSTREAM_TIMEOUT", true), 45),
    ).toMatchObject({ kind: "unavailable", retryAfterSeconds: 45 });
  });

  it("names reducing the candidate set as the recovery for truncation", () => {
    expect(
      translateErrorEnvelope(envelope("OUTPUT_TRUNCATED", true), null),
    ).toEqual({
      ok: false,
      retryable: true,
      kind: "truncated",
      recovery: "REDUCE_CANDIDATES",
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_FAILED,
      providerCode: "OUTPUT_TRUNCATED",
      providerCorrelationId: null,
    });
  });

  it("recognises a code however the provider punctuates it", () => {
    expect(
      translateErrorEnvelope(envelope("  at-capacity  ", true), null).kind,
    ).toBe("busy");
  });

  it("keeps the provider's own correlation identifier", () => {
    expect(
      translateErrorEnvelope(
        envelope("UPSTREAM_ERROR", true, "provider-turn-123"),
        null,
      ),
    ).toMatchObject({ providerCorrelationId: "provider-turn-123" });
  });

  it("never copies the provider's message into the failure", () => {
    expect(
      JSON.stringify(translateErrorEnvelope(envelope("INTERNAL", false), null)),
    ).not.toContain("Provider says so.");
  });
});

describe("failures with no usable envelope", () => {
  it("treats a timeout or unreachable host as retryable", () => {
    expect(translateTransportFailure(null)).toEqual({
      ok: false,
      retryable: true,
      kind: "unavailable",
      retryAfterSeconds: null,
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
    });
  });

  it.each([500, 502, 503, 504])("treats %s as retryable", (status) => {
    expect(translateTransportFailure(status).retryable).toBe(true);
  });

  it("carries the wait a bare 503 advertised", () => {
    expect(translateTransportFailure(503, 60)).toMatchObject({
      kind: "unavailable",
      retryAfterSeconds: 60,
    });
  });

  it.each([400, 401, 422])(
    "treats %s as this platform's own bug, not worth repeating",
    (status) => {
      expect(translateTransportFailure(status)).toMatchObject({
        kind: "failed",
        retryable: false,
      });
    },
  );
});

describe("an unconfigured service", () => {
  it("is a permanent failure, so no retry loop starts against a missing token", () => {
    expect(notConfiguredFailure()).toMatchObject({
      kind: "unavailable",
      retryable: false,
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
    });
  });
});

describe("the advertised wait", () => {
  const now = new Date("2026-08-22T12:00:00.000Z");

  it("reads whole seconds", () => {
    expect(parseRetryAfter("45", now)).toBe(45);
  });

  it("reads an HTTP date as the seconds until it", () => {
    expect(parseRetryAfter("Sat, 22 Aug 2026 12:00:30 GMT", now)).toBe(30);
  });

  it("ignores a wait that has already passed", () => {
    expect(parseRetryAfter("Sat, 22 Aug 2026 11:59:30 GMT", now)).toBeNull();
  });

  it("caps an absurd wait at an hour", () => {
    expect(parseRetryAfter("86400", now)).toBe(3_600);
  });

  it.each([null, undefined, "", "soon", "-5"])("ignores %s", (value) => {
    expect(parseRetryAfter(value, now)).toBeNull();
  });
});
