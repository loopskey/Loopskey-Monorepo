import { leaseShorterThanGenerate } from "./service-ai.config";
import { ServiceAiReadinessService } from "./service-ai-readiness.service";
import { loadServiceAiConfig } from "./service-ai.config";
import { SERVICE_AI_CONFIG } from "./service-ai.config";
import { DEFAULT_LEASE_MS } from "@infrastructure/outbox/outbox-processor.service";
import { ServiceAiClient } from "./service-ai.client";
import { SERVICE_AI_PORT } from "./service-ai.port";
import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const logger = new Logger("ServiceAiModule");

const outboxLeaseMs = (config: ConfigService) => {
  const configured = Number(
    config.get("OUTBOX_LEASE_MS", String(DEFAULT_LEASE_MS)),
  );
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_LEASE_MS;
};

@Module({
  providers: [
    {
      inject: [ConfigService],
      provide: SERVICE_AI_CONFIG,
      useFactory: (config: ConfigService) => {
        const loaded = loadServiceAiConfig(config);
        const leaseMs = outboxLeaseMs(config);
        if (leaseShorterThanGenerate(leaseMs, loaded.timeouts.generate))
          logger.warn({
            leaseMs,
            event: "roadmap-ai.lease-shorter-than-generate",
            generateTimeoutMs: loaded.timeouts.generate,
            message:
              "OUTBOX_LEASE_MS is shorter than the generate timeout. The " +
              "heartbeat keeps the claim alive, but the initial lease should " +
              "cover a normal generation.",
          });
        return loaded;
      },
    },
    ServiceAiReadinessService,
    { provide: SERVICE_AI_PORT, useClass: ServiceAiClient },
  ],
  exports: [SERVICE_AI_PORT],
})
export class ServiceAiModule {}
