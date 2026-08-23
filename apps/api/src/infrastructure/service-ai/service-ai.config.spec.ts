import {
  PROVIDER_BUDGET_MS,
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

  it("treats a blank value as unset rather than as an empty address", () => {
    expect(
      loadServiceAiConfig(reader({ ROADMAP_AI_BASE_URL: "   " })).baseUrl,
    ).toBeNull();
  });

  it("accepts a configured timeout at or above the budget", () => {
    const { timeouts } = loadServiceAiConfig(
      reader({
        ROADMAP_AI_CHAT_TURN_TIMEOUT_MS: `${PROVIDER_BUDGET_MS.chatTurn}`,
        ROADMAP_AI_GENERATE_TIMEOUT_MS: "90000",
      }),
    );

    expect(timeouts).toEqual({
      chatTurn: PROVIDER_BUDGET_MS.chatTurn,
      generate: 90000,
    });
  });

  it("rejects a chat-turn timeout below the provider's budget", () => {
    // A shorter timeout cancels a call the provider would have completed, so
    // this has to stop the boot rather than surface inside a request.
    expect(() =>
      loadServiceAiConfig(
        reader({
          ROADMAP_AI_CHAT_TURN_TIMEOUT_MS: `${PROVIDER_BUDGET_MS.chatTurn - 1}`,
        }),
      ),
    ).toThrow(/below the provider's 30000ms budget/);
  });

  it("rejects a generation timeout below the provider's budget", () => {
    expect(() =>
      loadServiceAiConfig(reader({ ROADMAP_AI_GENERATE_TIMEOUT_MS: "60000" })),
    ).toThrow(/below the provider's 70000ms budget/);
  });

  it.each(["0", "-1", "abc", "35000.5"])("rejects %s as a timeout", (value) => {
    expect(() =>
      loadServiceAiConfig(reader({ ROADMAP_AI_CHAT_TURN_TIMEOUT_MS: value })),
    ).toThrow(/positive whole number|below the provider/);
  });
});
