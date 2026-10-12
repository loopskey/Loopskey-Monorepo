import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { REGISTRATION_COMPLETED_EVENT } from "@telemetry/public/telemetry-events";
import { TelemetryAggregateRepository } from "@telemetry/services/telemetry-aggregate.repository";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";
import { utcDay } from "@telemetry/utils/telemetry-day.util";

import { type OutboxEventContext } from "@infrastructure/outbox/outbox-handler.port";
import { type OutboxHandler } from "@infrastructure/outbox/outbox-handler.port";

import * as P from "@prisma/client";

type RegistrationPayload = { role?: unknown };

const COUNTED_ROLES: Record<string, P.TelemetryRegistrationRole> = {
  PROFESSIONAL: P.TelemetryRegistrationRole.PROFESSIONAL,
  PROVIDER: P.TelemetryRegistrationRole.PROVIDER,
};

@Injectable()
export class RegistrationCompletedHandler
  implements OutboxHandler, OnModuleInit
{
  private readonly logger = new Logger(RegistrationCompletedHandler.name);

  readonly eventName = REGISTRATION_COMPLETED_EVENT;
  readonly handlerName = "telemetry-registration-completed-v1";
  readonly lane = "bulk" as const;

  constructor(
    private readonly registry: OutboxHandlerRegistry,
    private readonly repository: TelemetryAggregateRepository,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(payload: unknown, event: OutboxEventContext) {
    if (this.config.get<string>("TELEMETRY_ENABLED") !== "true") return;
    const rawRole = (payload as RegistrationPayload | null)?.role;
    if (typeof rawRole !== "string") {
      this.logger.warn("Registration telemetry event had no role", {
        correlationId: event.correlationId,
      });
      return;
    }
    const role = COUNTED_ROLES[rawRole];
    if (!role) return;
    await this.repository.record({
      day: utcDay(new Date()),
      countsIntake: false,
      vitals: [],
      conversions: [
        {
          dedupKey: createHash("sha256")
            .update(`registration:${event.idempotencyKey}`)
            .digest("hex")
            .slice(0, 32),
          dimensions: {
            event: P.TelemetryConversionEvent.REGISTRATION_COMPLETED,
            contentKind: P.TelemetryContentKind.NONE,
            role,
            attribution: P.TelemetryAttribution.UNATTRIBUTED,
            locale: P.TelemetryLocale.UNKNOWN,
          },
        },
      ],
    });
  }
}
