export const PROVIDER_BUDGET_MS = {
  chatTurn: 30_000,
  generate: 70_000,
} as const;

const DEFAULT_TIMEOUT_MS = {
  chatTurn: 35_000,
  generate: 80_000,
} as const;

export type ServiceAiConfig = {
  baseUrl: string | null;
  serviceToken: string | null;
  timeouts: { chatTurn: number; generate: number };
};

export type ConfigReader = { get<T>(key: string): T | undefined };

export const SERVICE_AI_CONFIG = Symbol("SERVICE_AI_CONFIG");

const readTimeout = (
  config: ConfigReader,
  key: string,
  operation: keyof typeof PROVIDER_BUDGET_MS,
): number => {
  const raw = config.get<string | number>(key);
  if (raw === undefined || raw === null || `${raw}`.trim() === "")
    return DEFAULT_TIMEOUT_MS[operation];

  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0)
    throw new Error(`${key} must be a positive whole number of milliseconds.`);

  const budget = PROVIDER_BUDGET_MS[operation];
  if (value < budget)
    throw new Error(
      `${key} is ${value}ms, below the provider's ${budget}ms budget for ` +
        `${operation}. A timeout under the budget cancels a call the provider ` +
        `would have completed.`,
    );

  return value;
};

const readOptional = (config: ConfigReader, key: string): string | null => {
  const raw = config.get<string>(key)?.trim();
  return raw ? raw : null;
};
export const loadServiceAiConfig = (config: ConfigReader): ServiceAiConfig => ({
  baseUrl:
    readOptional(config, "ROADMAP_AI_BASE_URL")?.replace(/\/+$/, "") ?? null,
  serviceToken: readOptional(config, "ROADMAP_AI_SERVICE_TOKEN"),
  timeouts: {
    chatTurn: readTimeout(
      config,
      "ROADMAP_AI_CHAT_TURN_TIMEOUT_MS",
      "chatTurn",
    ),
    generate: readTimeout(config, "ROADMAP_AI_GENERATE_TIMEOUT_MS", "generate"),
  },
});
