import { Logger } from "@nestjs/common";

import {
  READY_PATH,
  ServiceAiReadinessService,
} from "./service-ai-readiness.service";
import { type ServiceAiConfig } from "./service-ai.config";

const BASE_URL = "https://ai.example.com";
const SERVICE_TOKEN = "a-service-token-that-must-never-be-logged";

const config: ServiceAiConfig = {
  baseUrl: BASE_URL,
  serviceToken: SERVICE_TOKEN,
  timeouts: { chatTurn: 35_000, generate: 80_000 },
};

describe("ServiceAiReadinessService", () => {
  let entries: unknown[];

  beforeEach(() => {
    entries = [];
    const record = (entry: unknown) => {
      entries.push(entry);
      return undefined as never;
    };
    jest.spyOn(Logger.prototype, "log").mockImplementation(record);
    jest.spyOn(Logger.prototype, "error").mockImplementation(record);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("asks the provider's readiness endpoint at the configured address", async () => {
    const probe = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = probe as unknown as typeof fetch;

    await expect(new ServiceAiReadinessService(config).probe()).resolves.toBe(
      true,
    );
    expect(probe.mock.calls[0][0]).toBe(`${BASE_URL}${READY_PATH}`);
    expect(probe.mock.calls[0][1].method).toBe("GET");
  });

  it("sends no credential, because the endpoint needs none", async () => {
    const probe = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = probe as unknown as typeof fetch;

    await new ServiceAiReadinessService(config).probe();

    expect(probe.mock.calls[0][1].headers.authorization).toBeUndefined();
    expect(JSON.stringify(entries)).not.toContain(SERVICE_TOKEN);
  });

  it("logs an error naming the address when the provider is not ready", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 503 }) as unknown as typeof fetch;

    await expect(new ServiceAiReadinessService(config).probe()).resolves.toBe(
      false,
    );
    expect(entries).toContainEqual(
      expect.objectContaining({
        status: 503,
        event: "roadmap-ai.not-ready",
        address: `${BASE_URL}${READY_PATH}`,
      }),
    );
  });

  it("logs an error naming the address when the provider is unreachable", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(
        new TypeError("fetch failed"),
      ) as unknown as typeof fetch;

    await expect(new ServiceAiReadinessService(config).probe()).resolves.toBe(
      false,
    );
    expect(entries).toContainEqual(
      expect.objectContaining({
        event: "roadmap-ai.unreachable",
        address: `${BASE_URL}${READY_PATH}`,
      }),
    );
  });

  it("reports missing configuration rather than calling an empty address", async () => {
    const probe = jest.fn();
    global.fetch = probe as unknown as typeof fetch;

    await expect(
      new ServiceAiReadinessService({ ...config, baseUrl: null }).probe(),
    ).resolves.toBe(false);
    expect(probe).not.toHaveBeenCalled();
    expect(entries).toContainEqual(
      expect.objectContaining({
        baseUrlSet: false,
        serviceTokenSet: true,
        event: "roadmap-ai.not-configured",
      }),
    );
  });

  it("never lets a provider outage stop the application booting", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(
        new Error("connection refused"),
      ) as unknown as typeof fetch;

    await expect(
      new ServiceAiReadinessService(config).onApplicationBootstrap(),
    ).resolves.toBeUndefined();
  });
});
