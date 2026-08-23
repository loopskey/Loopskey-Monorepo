import { SERVICE_AI_CONFIG, type ServiceAiConfig } from "./service-ai.config";
import { type OnApplicationBootstrap } from "@nestjs/common";
import { Inject, Injectable, Logger } from "@nestjs/common";

export const READY_PATH = "/ready";

const READINESS_TIMEOUT_MS = 5_000;

@Injectable()
export class ServiceAiReadinessService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ServiceAiReadinessService.name);

  constructor(
    @Inject(SERVICE_AI_CONFIG) private readonly config: ServiceAiConfig,
  ) {}

  async onApplicationBootstrap() {
    await this.probe();
  }

  async probe(): Promise<boolean> {
    if (!this.config.baseUrl || !this.config.serviceToken) {
      this.logger.error({
        event: "roadmap-ai.not-configured",
        baseUrlSet: Boolean(this.config.baseUrl),
        serviceTokenSet: Boolean(this.config.serviceToken),
        message:
          "Roadmap AI Service is not configured. Set ROADMAP_AI_BASE_URL and " +
          "ROADMAP_AI_SERVICE_TOKEN; until then every roadmap AI call fails " +
          "as unavailable.",
      });
      return false;
    }

    const address = `${this.config.baseUrl}${READY_PATH}`;
    try {
      const response = await fetch(address, {
        method: "GET",
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(READINESS_TIMEOUT_MS),
      });

      if (!response.ok) {
        this.logger.error({
          address,
          status: response.status,
          event: "roadmap-ai.not-ready",
          message: "Roadmap AI Service reported it is not ready.",
        });
        return false;
      }

      this.logger.log({
        address,
        event: "roadmap-ai.ready",
        status: response.status,
      });
      return true;
    } catch {
      this.logger.error({
        address,
        event: "roadmap-ai.unreachable",
        message: "Roadmap AI Service did not answer its readiness endpoint.",
      });
      return false;
    }
  }
}
