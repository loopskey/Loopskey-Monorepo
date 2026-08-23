import { SERVICE_AI_CONFIG, loadServiceAiConfig } from "./service-ai.config";
import { ServiceAiReadinessService } from "./service-ai-readiness.service";
import { ServiceAiClient } from "./service-ai.client";
import { SERVICE_AI_PORT } from "./service-ai.port";
import { ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";

@Module({
  providers: [
    {
      inject: [ConfigService],
      provide: SERVICE_AI_CONFIG,
      useFactory: (config: ConfigService) => loadServiceAiConfig(config),
    },
    ServiceAiReadinessService,
    { provide: SERVICE_AI_PORT, useClass: ServiceAiClient },
  ],
  exports: [SERVICE_AI_PORT],
})
export class ServiceAiModule {}
