import { DEFAULT_LEASE_MS } from "@infrastructure/outbox/outbox-processor.service";
import {
  OUTBOX_LEASE_SAFETY_MARGIN_MS,
  PROVIDER_BUDGET_MS,
  PROVIDER_CUTOFF_MS,
  leaseShorterThanGenerate,
  loadServiceAiConfig,
  type ConfigReader,
} from "./service-ai.config";

const reader = (values: Record<string, string>): ConfigReader => ({
  get: <T>(key: string) => values[key] as T | undefined,
});

describe("Roadmap AI configuration", () => {
  it("boots without a base address or token", () => {
    // CI, E2E and a plain local API have no reason to reach the provider, and
    // must not be stopped from starting by its absence.
    const config = loadServiceAiConfig(reader({}));

    expect(config.baseUrl).toBeNull();
    expect(config.serviceToken).toBeNull();
  });

  it("defaults both timeouts above the provider's budgets", () => {
    const { timeouts } = loadServiceAiConfig(reader({}));

    expect(timeouts.chatTurn).toBeGreaterThan(PROVIDER_BUDGET_MS.chatTurn);
    expect(timeouts.generate).toBeGreaterThan(PROVIDER_BUDGET_MS.generate);
  });

  it("trims a trailing slash so paths do not double up", () => {
    expect(
      loadServiceAiConfig(
        reader({ ROADMAP_AI_BASE_URL: "https://ai.example.com/" }),
      ).baseUrl,
    ).toBe("https://ai.example.com");
  });

  it("keeps the explicit :8443 port of the provider address", () => {
    expect(
      loadServiceAiConfig(
        reader({ ROADMAP_AI_BASE_URL: "https://api.sindexx.lol:8443" }),
      ).baseUrl,
    ).toBe("https://api.sindexx.lol:8443");
  });

  it("keeps the port when the address ends in a slash", () => {
    expect(
      loadServiceAiConfig(
        reader({ ROADMAP_AI_BASE_URL: "https://api.sindexx.lol:8443/" }),
      ).baseUrl,
    ).toBe("https://api.sindexx.lol:8443");
  });

  it.each(["not a url", "api.sindexx.lol:8443", "ftp://ai.example.com"])(
    "rejects %s as the base address",
    (value) => {
      expect(() =>
        loadServiceAiConfig(reader({ ROADMAP_AI_BASE_URL: value })),
      ).toThrow(/ROADMAP_AI_BASE_URL/);
    },
  );

  it("rejects an address that embeds credentials", () => {
    expect(() =>
      loadServiceAiConfig(
        reader({ ROADMAP_AI_BASE_URL: "https://user:pass@ai.example.com" }),
      ),
    ).toThrow(/credentials/);
  });

  it("requires https in production", () => {
    expect(() =>
      loadServiceAiConfig(
        reader({
          NODE_ENV: "production",
          ROADMAP_AI_BASE_URL: "http://ai.example.com:8443",
        }),
      ),
    ).toThrow(/https in production/);
  });

  it("allows http outside production", () => {
    expect(
      loadServiceAiConfig(
        reader({ ROADMAP_AI_BASE_URL: "http://localhost:8000" }),
      ).baseUrl,
    ).toBe("http://localhost:8000");
  });

  it("never carries the service token anywhere but its own field", () => {
    const config = loadServiceAiConfig(
      reader({
        ROADMAP_AI_BASE_URL: "https://ai.example.com:8443",
        ROADMAP_AI_SERVICE_TOKEN: "secret-token",
      }),
    );

    expect(config.baseUrl).not.toContain("secret-token");
    expect(config.serviceToken).toBe("secret-token");
  });

  it("reports a lease that does not cover the generate timeout and a safety margin", () => {
    expect(leaseShorterThanGenerate(60_000, 150_000)).toBe(true);
    expect(leaseShorterThanGenerate(150_000, 150_000)).toBe(true);
    expect(
      leaseShorterThanGenerate(
        150_000 + OUTBOX_LEASE_SAFETY_MARGIN_MS,
        150_000,
      ),
    ).toBe(false);
    expect(leaseShorterThanGenerate(180_000, 150_000)).toBe(false);
  });

  it("keeps the default outbox lease above the default generate timeout", () => {
    const { timeouts } = loadServiceAiConfig(reader({}));

    expect(leaseShorterThanGenerate(DEFAULT_LEASE_MS, timeouts.generate)).toBe(
      false,
    );
    expect(Math.floor(DEFAULT_LEASE_MS / 3)).toBeLessThan(timeouts.generate);
  });

  it("accepts the 150 second generation timeout", () => {
    expect(
      loadServiceAiConfig(reader({ ROADMAP_AI_GENERATE_TIMEOUT_MS: "150000" }))
        .timeouts.generate,
    ).toBe(150_000);
  });

  it("allows for the provider's repair call in the generation cut-off", () => {
    expect(PROVIDER_CUTOFF_MS.generate).toBeGreaterThanOrEqual(
      2 * PROVIDER_BUDGET_MS.generate,
    );
  });

  it("treats a blank value as unset rather than as an empty address", () => {
    expect(
      loadServiceAiConfig(reader({ ROADMAP_AI_BASE_URL: "   " })).baseUrl,
    ).toBeNull();
  });

  it("accepts a configured timeout above the provider's cut-off", () => {
    const { timeouts } = loadServiceAiConfig(
      reader({
        ROADMAP_AI_CHAT_TURN_TIMEOUT_MS: `${PROVIDER_CUTOFF_MS.chatTurn + 1}`,
        ROADMAP_AI_GENERATE_TIMEOUT_MS: `${PROVIDER_CUTOFF_MS.generate + 1}`,
      }),
    );

    expect(timeouts).toEqual({
      chatTurn: PROVIDER_CUTOFF_MS.chatTurn + 1,
      generate: PROVIDER_CUTOFF_MS.generate + 1,
    });
  });

  it("keeps the default generate timeout above the provider's cut-off", () => {
    expect(loadServiceAiConfig(reader({})).timeouts.generate).toBeGreaterThan(
      PROVIDER_CUTOFF_MS.generate,
    );
  });

  it("rejects a chat-turn timeout at the provider's cut-off", () => {
    expect(() =>
      loadServiceAiConfig(
        reader({
          ROADMAP_AI_CHAT_TURN_TIMEOUT_MS: `${PROVIDER_CUTOFF_MS.chatTurn}`,
        }),
      ),
    ).toThrow(/does not exceed the 30000ms/);
  });

  it.each(["70000", "75000", "142000"])(
    "rejects a generation timeout of %sms",
    (value) => {
      expect(() =>
        loadServiceAiConfig(reader({ ROADMAP_AI_GENERATE_TIMEOUT_MS: value })),
      ).toThrow(/does not exceed the 142000ms/);
    },
  );

  it("keeps the provider's own budget below the cut-off the client enforces", () => {
    expect(PROVIDER_BUDGET_MS.generate).toBeLessThan(
      PROVIDER_CUTOFF_MS.generate,
    );
  });

  it.each(["0", "-1", "abc", "35000.5"])("rejects %s as a timeout", (value) => {
    expect(() =>
      loadServiceAiConfig(reader({ ROADMAP_AI_CHAT_TURN_TIMEOUT_MS: value })),
    ).toThrow(/positive whole number/);
  });
});
