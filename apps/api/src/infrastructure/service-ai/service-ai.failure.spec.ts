import {
  parseRetryAfter,
  translateErrorEnvelope,
  translateTransportFailure,
} from "./service-ai.failure";
import { RoadmapAiMessageCode } from "./service-ai.port";

const envelope = (code: string, retryable: boolean) => ({
  code,
  retryable,
  message: "Provider says so.",
  correlation_id: null,
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

  it("makes an unknown retryable code retryable and unavailable", () => {
    expect(
      translateErrorEnvelope(envelope("QUOTA_REFRESHING", true), null),
    ).toEqual({
      ok: false,
      retryable: true,
      kind: "unavailable",
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
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
    });
  });
});

describe("the named outcomes", () => {
  it("surfaces a refusal as its own outcome, not an error", () => {
    expect(translateErrorEnvelope(envelope("OFF_TOPIC", false), null)).toEqual({
      ok: false,
      retryable: false,
      kind: "refused",
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_REFUSED,
    });
  });

  it("carries the advertised wait on a capacity outcome", () => {
    expect(translateErrorEnvelope(envelope("AT_CAPACITY", true), 30)).toEqual({
      ok: false,
      kind: "busy",
      retryable: true,
      retryAfterSeconds: 30,
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_BUSY,
    });
  });

  it("reports a capacity outcome with no advertised wait as such", () => {
    expect(
      translateErrorEnvelope(envelope("AT_CAPACITY", true), null),
    ).toMatchObject({ kind: "busy", retryAfterSeconds: null });
  });

  it("names reducing the candidate set as the recovery for truncation", () => {
    expect(
      translateErrorEnvelope(envelope("OUTPUT_TRUNCATED", false), null),
    ).toEqual({
      ok: false,
      retryable: false,
      kind: "truncated",
      recovery: "REDUCE_CANDIDATES",
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_FAILED,
    });
  });

  it("recognises a code however the provider punctuates it", () => {
    expect(
      translateErrorEnvelope(envelope("  at-capacity  ", true), null).kind,
    ).toBe("busy");
  });
});

describe("failures with no usable envelope", () => {
  it("treats a timeout or unreachable host as retryable", () => {
    expect(translateTransportFailure(null)).toEqual({
      ok: false,
      retryable: true,
      kind: "unavailable",
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
    });
  });

  it.each([500, 502, 503, 504])("treats %s as retryable", (status) => {
    expect(translateTransportFailure(status).retryable).toBe(true);
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

describe("the advertised wait", () => {
  const now = new Date("2026-08-22T12:00:00.000Z");

  it("reads whole seconds", () => {
    expect(parseRetryAfter("45", now)).toBe(45);
  });

  it("reads an HTTP date as the seconds until it", () => {
    expect(parseRetryAfter("Sat, 22 Aug 2026 12:00:30 GMT", now)).toBe(30);
  });

  it("ignores a wait that has already passed", () => {
    // A wait the caller cannot honour is worse than none at all.
    expect(parseRetryAfter("Sat, 22 Aug 2026 11:59:30 GMT", now)).toBeNull();
  });

  it.each([null, undefined, "", "soon", "-5"])("ignores %s", (value) => {
    expect(parseRetryAfter(value, now)).toBeNull();
  });
});
