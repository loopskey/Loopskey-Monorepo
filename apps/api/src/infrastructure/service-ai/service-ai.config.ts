export const PROVIDER_BUDGET_MS = {
  chatTurn: 30_000,
  generate: 70_000,
} as const;

export const PROVIDER_CUTOFF_MS = {
  chatTurn: 30_000,
  generate: 142_000,
} as const;

const DEFAULT_TIMEOUT_MS = {
  chatTurn: 35_000,
  generate: 150_000,
} as const;

export const OUTBOX_LEASE_SAFETY_MARGIN_MS = 15_000;

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
  operation: keyof typeof PROVIDER_CUTOFF_MS,
): number => {
  const raw = config.get<string | number>(key);
  if (raw === undefined || raw === null || `${raw}`.trim() === "")
    return DEFAULT_TIMEOUT_MS[operation];

  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0)
    throw new Error(`${key} must be a positive whole number of milliseconds.`);

  const cutoff = PROVIDER_CUTOFF_MS[operation];
  if (value <= cutoff)
    throw new Error(
      `${key} is ${value}ms, which does not exceed the ${cutoff}ms the ` +
        `provider needs for ${operation}. A timeout at or under that point ` +
        `cancels a call the provider would have completed.`,
    );

  return value;
};

const readOptional = (config: ConfigReader, key: string): string | null => {
  const raw = config.get<string>(key)?.trim();
  return raw ? raw : null;
};

const readBaseUrl = (config: ConfigReader): string | null => {
  const raw = readOptional(config, "ROADMAP_AI_BASE_URL");
  if (!raw) return null;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("ROADMAP_AI_BASE_URL is not a valid URL.");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:")
    throw new Error("ROADMAP_AI_BASE_URL must use http or https.");
  if (parsed.username || parsed.password)
    throw new Error("ROADMAP_AI_BASE_URL must not carry credentials.");
  if (
    config.get<string>("NODE_ENV") === "production" &&
    parsed.protocol !== "https:"
  )
    throw new Error("ROADMAP_AI_BASE_URL must use https in production.");

  return raw.replace(/\/+$/, "");
};

export const loadServiceAiConfig = (config: ConfigReader): ServiceAiConfig => ({
  baseUrl: readBaseUrl(config),
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

export const leaseShorterThanGenerate = (
  leaseMs: number,
  generateTimeoutMs: number,
): boolean => leaseMs < generateTimeoutMs + OUTBOX_LEASE_SAFETY_MARGIN_MS;
