import { Logger } from "@nestjs/common";

import { requestContext } from "@infrastructure/observability/request-context";

import {
  CHAT_TURN_PATH,
  GENERATE_PATH,
  ServiceAiClient,
} from "./service-ai.client";
import {
  RoadmapAiMessageCode,
  type ChatTurnInput,
  type GenerateInput,
} from "./service-ai.port";
import { SERVICE_AI_CONTRACT_VERSION } from "./generated/service-ai.types";
import { type ServiceAiConfig } from "./service-ai.config";

const BASE_URL = "https://ai.example.com";
const SERVICE_TOKEN = "a-service-token-that-must-never-be-logged";
const SECRET_GOAL = "Renew my licence before the audit";

const config: ServiceAiConfig = {
  baseUrl: BASE_URL,
  serviceToken: SERVICE_TOKEN,
  timeouts: { chatTurn: 35_000, generate: 80_000 },
};

const chatTurnInput: ChatTurnInput = {
  currentStep: "GOAL",
  today: new Date("2026-08-22T09:00:00.000Z"),
  draft: { goal: SECRET_GOAL },
  userMessage: SECRET_GOAL,
};

const generateInput: GenerateInput = {
  draft: { goal: SECRET_GOAL },
  today: new Date("2026-08-22T09:00:00.000Z"),
  candidates: [
    {
      isFree: true,
      title: "Ethics",
      contentId: "course-1",
      contentType: "COURSE",
    },
  ],
};

const chatTurnBody = {
  assistant_message: "Which certification?",
  extracted: { goal: SECRET_GOAL },
  widget: null,
  suggested_next_step: "PREFERENCES",
  is_complete: false,
  needs_clarification: true,
};

const generateBody = {
  title: "Renew your PMP",
  description: "A plan.",
  level: "ADVANCED",
  estimated_weeks: 10,
  phases: [
    {
      order: 1,
      title: "Foundations",
      description: "Start here.",
      estimated_weeks: 4,
      steps: [{ order: 1, title: "Ethics", description: "Two hours." }],
    },
  ],
};

type Answer = {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
};

const respondWith = ({ status = 200, body = {}, headers = {} }: Answer) =>
  jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    headers: new Headers({
      "x-contract-version": SERVICE_AI_CONTRACT_VERSION,
      ...headers,
    }),
  });

/** Everything the logger was handed, so a test can assert what is not in it. */
const captureLogs = () => {
  const entries: unknown[] = [];
  const record = (entry: unknown) => {
    entries.push(entry);
    return undefined as never;
  };
  jest.spyOn(Logger.prototype, "log").mockImplementation(record);
  jest.spyOn(Logger.prototype, "warn").mockImplementation(record);
  jest.spyOn(Logger.prototype, "error").mockImplementation(record);
  return entries;
};

describe("ServiceAiClient", () => {
  let fetchMock: jest.Mock;
  let entries: unknown[];

  beforeEach(() => {
    // Captured for every test, not only the logging ones: an outbound adapter
    // that logs into the test output drowns the failure that matters.
    entries = captureLogs();
    fetchMock = respondWith({ body: chatTurnBody });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("a successful turn", () => {
    it("returns typed platform data with no HTTP detail in it", async () => {
      const result = await new ServiceAiClient(config).chatTurn(chatTurnInput);

      expect(result).toEqual({
        ok: true,
        data: {
          isComplete: false,
          needsClarification: true,
          assistantMessage: "Which certification?",
          widget: null,
          clearedFields: [],
          suggestedNextSection: "PREFERENCES",
          extracted: expect.objectContaining({ goal: SECRET_GOAL }),
        },
      });
      expect(JSON.stringify(result)).not.toContain("200");
    });

    it("posts JSON to the configured address with the service token", async () => {
      await new ServiceAiClient(config).chatTurn(chatTurnInput);

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE_URL}${CHAT_TURN_PATH}`);
      expect(init.method).toBe("POST");
      expect(init.headers["content-type"]).toBe("application/json");
      expect(init.headers.authorization).toBe(`Bearer ${SERVICE_TOKEN}`);
    });

    it("sends a correlation id the provider will accept", async () => {
      await new ServiceAiClient(config).chatTurn(chatTurnInput);

      expect(fetchMock.mock.calls[0][1].headers["x-correlation-id"]).toMatch(
        /^[\w.-]{1,128}$/,
      );
    });

    it("carries the request's own correlation id through", async () => {
      await requestContext.run("request-42", () =>
        new ServiceAiClient(config).chatTurn(chatTurnInput),
      );

      expect(fetchMock.mock.calls[0][1].headers["x-correlation-id"]).toBe(
        "request-42",
      );
    });

    it("replaces a correlation id the provider would have substituted", async () => {
      await requestContext.run("no spaces allowed here", () =>
        new ServiceAiClient(config).chatTurn(chatTurnInput),
      );

      const sent = fetchMock.mock.calls[0][1].headers["x-correlation-id"];
      expect(sent).not.toBe("no spaces allowed here");
      expect(sent).toMatch(/^[\w.-]{1,128}$/);
    });

    it("bounds each operation by its own configured timeout", async () => {
      const timeout = jest.spyOn(AbortSignal, "timeout");
      const client = new ServiceAiClient(config);

      await client.chatTurn(chatTurnInput);
      expect(timeout).toHaveBeenLastCalledWith(config.timeouts.chatTurn);

      global.fetch = respondWith({
        body: generateBody,
      }) as unknown as typeof fetch;
      await client.generate(generateInput);
      expect(timeout).toHaveBeenLastCalledWith(config.timeouts.generate);
    });
  });

  describe("a successful generation", () => {
    it("returns a roadmap in platform types from the generation path", async () => {
      const generateFetch = respondWith({ body: generateBody });
      global.fetch = generateFetch as unknown as typeof fetch;

      const result = await new ServiceAiClient(config).generate(generateInput);

      expect(generateFetch.mock.calls[0][0]).toBe(
        `${BASE_URL}${GENERATE_PATH}`,
      );
      expect(result).toMatchObject({
        ok: true,
        data: { level: "ADVANCED", estimatedWeeks: 10 },
      });
    });
  });

  describe("failures", () => {
    it("fails as unavailable when the call times out", async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValue(
          new DOMException("The operation was aborted.", "TimeoutError"),
        ) as unknown as typeof fetch;

      expect(await new ServiceAiClient(config).chatTurn(chatTurnInput)).toEqual(
        {
          ok: false,
          retryable: true,
          kind: "unavailable",
          messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
        },
      );
    });

    it("fails as unavailable when the host cannot be reached", async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValue(
          new TypeError("fetch failed"),
        ) as unknown as typeof fetch;

      expect(
        await new ServiceAiClient(config).chatTurn(chatTurnInput),
      ).toMatchObject({ kind: "unavailable", retryable: true });
    });

    it("surfaces a refusal so the caller can ask for a rephrase", async () => {
      global.fetch = respondWith({
        status: 422,
        body: { code: "OFF_TOPIC", message: "Unrelated.", retryable: false },
      }) as unknown as typeof fetch;

      expect(
        await new ServiceAiClient(config).chatTurn(chatTurnInput),
      ).toMatchObject({
        kind: "refused",
        retryable: false,
        messageCode: RoadmapAiMessageCode.ROADMAP_AI_REFUSED,
      });
    });

    it("does not retry a refusal", async () => {
      const refuse = respondWith({
        status: 422,
        body: { code: "OFF_TOPIC", message: "Unrelated.", retryable: false },
      });
      global.fetch = refuse as unknown as typeof fetch;

      await new ServiceAiClient(config).chatTurn(chatTurnInput);

      expect(refuse).toHaveBeenCalledTimes(1);
    });

    it("carries the advertised wait on a capacity failure", async () => {
      global.fetch = respondWith({
        status: 503,
        headers: { "retry-after": "20" },
        body: { code: "AT_CAPACITY", message: "Busy.", retryable: true },
      }) as unknown as typeof fetch;

      expect(
        await new ServiceAiClient(config).chatTurn(chatTurnInput),
      ).toMatchObject({
        kind: "busy",
        retryable: true,
        retryAfterSeconds: 20,
        messageCode: RoadmapAiMessageCode.ROADMAP_AI_BUSY,
      });
    });

    it("names reducing the candidate set when generation truncates", async () => {
      global.fetch = respondWith({
        status: 502,
        body: {
          code: "OUTPUT_TRUNCATED",
          message: "Too big.",
          retryable: false,
        },
      }) as unknown as typeof fetch;

      expect(
        await new ServiceAiClient(config).generate(generateInput),
      ).toMatchObject({ kind: "truncated", recovery: "REDUCE_CANDIDATES" });
    });

    it("honours the retryable flag for a code it has never seen", async () => {
      global.fetch = respondWith({
        status: 500,
        body: { code: "MODEL_RELOADING", message: "Wait.", retryable: true },
      }) as unknown as typeof fetch;

      expect(
        await new ServiceAiClient(config).chatTurn(chatTurnInput),
      ).toMatchObject({ kind: "unavailable", retryable: true });
    });

    it("makes an unknown non-retryable code the generic failure", async () => {
      global.fetch = respondWith({
        status: 422,
        body: { code: "SCHEMA_REJECTED", message: "No.", retryable: false },
      }) as unknown as typeof fetch;

      expect(
        await new ServiceAiClient(config).chatTurn(chatTurnInput),
      ).toMatchObject({
        kind: "failed",
        retryable: false,
        messageCode: RoadmapAiMessageCode.ROADMAP_AI_FAILED,
      });
    });

    it("rejects a success body that does not satisfy the contract types", async () => {
      global.fetch = respondWith({
        body: { ...chatTurnBody, extracted: { skill_level: "MASTER" } },
      }) as unknown as typeof fetch;

      expect(
        await new ServiceAiClient(config).chatTurn(chatTurnInput),
      ).toMatchObject({ ok: false, kind: "failed" });
    });

    it("rejects a body that is not JSON at all", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.reject(new SyntaxError("Unexpected token")),
      }) as unknown as typeof fetch;

      expect(
        await new ServiceAiClient(config).chatTurn(chatTurnInput),
      ).toMatchObject({ ok: false });
    });

    it("fails as unavailable, without calling out, when unconfigured", async () => {
      const client = new ServiceAiClient({ ...config, baseUrl: null });

      expect(await client.chatTurn(chatTurnInput)).toMatchObject({
        kind: "unavailable",
        retryable: true,
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("logging", () => {
    it("records the call without any request or response body", async () => {
      await new ServiceAiClient(config).chatTurn(chatTurnInput);

      const written = JSON.stringify(entries);
      expect(written).not.toContain(SECRET_GOAL);
      expect(written).not.toContain(SERVICE_TOKEN);
      expect(written).not.toContain("Which certification?");
    });

    it("records the method, path, status and duration", async () => {
      await new ServiceAiClient(config).chatTurn(chatTurnInput);

      expect(entries[0]).toMatchObject({
        status: 200,
        method: "POST",
        path: CHAT_TURN_PATH,
        durationMs: expect.any(Number),
        correlationId: expect.any(String),
        contractVersion: SERVICE_AI_CONTRACT_VERSION,
      });
    });

    it("records the token counts the provider reported", async () => {
      global.fetch = respondWith({
        body: generateBody,
        headers: {
          "x-model": "roadmap-planner-1",
          "x-prompt-tokens": "1200",
          "x-completion-tokens": "800",
          "x-total-tokens": "2000",
        },
      }) as unknown as typeof fetch;

      await new ServiceAiClient(config).generate(generateInput);

      expect(entries[0]).toMatchObject({
        totalTokens: 2000,
        promptTokens: 1200,
        model: "roadmap-planner-1",
        completionTokens: 800,
      });
    });

    it("still carries the token fields when the provider reports none", async () => {
      await new ServiceAiClient(config).chatTurn(chatTurnInput);

      expect(entries[0]).toMatchObject({
        model: null,
        totalTokens: null,
        promptTokens: null,
        completionTokens: null,
      });
    });

    it("records what translation had to drop", async () => {
      await new ServiceAiClient(config).chatTurn({
        ...chatTurnInput,
        draft: { preferredFormats: ["COURSE", "WORKSHOP"] },
      });

      expect(entries[0]).toMatchObject({
        drops: { formats: 1, historyMessages: 0 },
      });
    });

    it("records a failure's code but never its message", async () => {
      global.fetch = respondWith({
        status: 422,
        body: {
          code: "OFF_TOPIC",
          retryable: false,
          message: `You said: ${SECRET_GOAL}`,
        },
      }) as unknown as typeof fetch;

      await new ServiceAiClient(config).chatTurn(chatTurnInput);

      expect(entries[0]).toMatchObject({ providerCode: "OFF_TOPIC" });
      expect(JSON.stringify(entries)).not.toContain(SECRET_GOAL);
    });
  });

  describe("contract version", () => {
    const mismatched = () =>
      respondWith({
        body: chatTurnBody,
        headers: { "x-contract-version": "2.0.0" },
      }) as unknown as typeof fetch;

    it("reports a mismatch naming both versions", async () => {
      global.fetch = mismatched();

      await new ServiceAiClient(config).chatTurn(chatTurnInput);

      expect(entries).toContainEqual(
        expect.objectContaining({
          reported: "2.0.0",
          expected: SERVICE_AI_CONTRACT_VERSION,
          event: "roadmap-ai.contract-version-mismatch",
        }),
      );
    });

    it("reports a mismatch once per process, not once per request", async () => {
      global.fetch = mismatched();
      const client = new ServiceAiClient(config);

      await client.chatTurn(chatTurnInput);
      await client.chatTurn(chatTurnInput);
      await client.chatTurn(chatTurnInput);

      expect(
        entries.filter(
          (entry) =>
            (entry as { event?: string }).event ===
            "roadmap-ai.contract-version-mismatch",
        ),
      ).toHaveLength(1);
    });

    it("says nothing when the deployed contract is the expected one", async () => {
      await new ServiceAiClient(config).chatTurn(chatTurnInput);

      expect(entries).not.toContainEqual(
        expect.objectContaining({
          event: "roadmap-ai.contract-version-mismatch",
        }),
      );
    });
  });
});
