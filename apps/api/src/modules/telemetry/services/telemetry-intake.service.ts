import { TelemetryAggregateRepository } from "@telemetry/services/telemetry-aggregate.repository";
import { isWithinMetricRange } from "@telemetry/utils/telemetry-metric.util";
import { Injectable, Logger } from "@nestjs/common";
import { TELEMETRY_LIMITS } from "@loopskey/api-contracts/validation";
import { RateLimitService } from "@infrastructure/rate-limit/rate-limit.service";
import { TelemetryRating } from "@telemetry/enums/telemetry-register.enum";
import { requestContext } from "@infrastructure/observability/request-context";
import { bucketIndexOf } from "@telemetry/utils/telemetry-metric.util";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";
import { ratingOf } from "@telemetry/utils/telemetry-metric.util";
import { utcDay } from "@telemetry/utils/telemetry-day.util";

import type { ConversionDimensions } from "@telemetry/services/telemetry-aggregate.repository";
import type { TelemetryBatchInput } from "@telemetry/dtos/telemetry-batch.input";
import type { VitalDimensions } from "@telemetry/services/telemetry-aggregate.repository";
import type { DedupedEvent } from "@telemetry/services/telemetry-aggregate.repository";

import * as P from "@prisma/client";

export type TelemetryAcknowledgement = {
  accepted: number;
  dropped: number;
};

const UNKNOWN_CLIENT = "unknown";
const SLOW_SINK_MS = 750;

const IP_POLICY = {
  scope: "public.telemetry:ip",
  limit: TELEMETRY_LIMITS.ipLimitPerWindow,
  windowSeconds: TELEMETRY_LIMITS.ipWindowSeconds,
};

const GLOBAL_POLICY = {
  scope: "public.telemetry:global",
  limit: TELEMETRY_LIMITS.globalLimitPerWindow,
  windowSeconds: TELEMETRY_LIMITS.globalWindowSeconds,
};

const GLOBAL_SUBJECT = "all";

const dedupKeyOf = (kind: P.TelemetryIntakeKind, id: string) =>
  createHash("sha256").update(`${kind}:${id}`).digest("hex").slice(0, 32);

const clampRate = (value: number) =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 1;

const firstOccurrences = <TEvent extends { id: string }>(events: TEvent[]) => {
  const seen = new Set<string>();
  const unique: TEvent[] = [];
  for (const event of events) {
    if (seen.has(event.id)) continue;
    seen.add(event.id);
    unique.push(event);
  }
  return unique;
};

@Injectable()
export class TelemetryIntakeService {
  private readonly logger = new Logger(TelemetryIntakeService.name);

  constructor(
    private readonly repository: TelemetryAggregateRepository,
    private readonly rateLimits: RateLimitService,
    private readonly config: ConfigService,
  ) {}

  isEnabled() {
    return this.config.get<string>("TELEMETRY_ENABLED") === "true";
  }

  async record(
    batch: TelemetryBatchInput,
    clientAddress?: string,
  ): Promise<TelemetryAcknowledgement> {
    const received = batch.vitals.length + batch.conversions.length;
    if (received === 0) return { accepted: 0, dropped: 0 };
    if (!this.isEnabled()) return { accepted: 0, dropped: received };

    const day = utcDay(new Date());

    const decision = await this.rateLimits.spendAll([
      { policy: IP_POLICY, subject: clientAddress ?? UNKNOWN_CLIENT },
      { policy: GLOBAL_POLICY, subject: GLOBAL_SUBJECT },
    ]);
    if (!decision.allowed) {
      await this.countDropped(
        day,
        batch,
        P.TelemetryIntakeOutcome.RATE_LIMITED,
      );
      return { accepted: 0, dropped: received };
    }

    const vitals = this.sampleVitals(batch.vitals);
    const sampledOut = batch.vitals.length - vitals.length;
    const validVitals = vitals.filter((vital) => this.isSane(vital));
    const invalidVitals = vitals.length - validVitals.length;
    const uniqueVitals = firstOccurrences(validVitals);
    const uniqueConversions = firstOccurrences(batch.conversions);
    const repeatedVitals = validVitals.length - uniqueVitals.length;
    const repeatedConversions =
      batch.conversions.length - uniqueConversions.length;

    const startedAt = performance.now();
    try {
      const outcome = await this.repository.record({
        day,
        countsIntake: true,
        vitals: uniqueVitals.map((vital) => this.vitalEvent(vital)),
        conversions: uniqueConversions.map((event) =>
          this.conversionEvent(event),
        ),
      });
      await this.countBestEffort(day, [
        [
          P.TelemetryIntakeKind.VITAL,
          P.TelemetryIntakeOutcome.SAMPLED_OUT,
          sampledOut,
        ],
        [
          P.TelemetryIntakeKind.VITAL,
          P.TelemetryIntakeOutcome.INVALID,
          invalidVitals,
        ],
        [
          P.TelemetryIntakeKind.VITAL,
          P.TelemetryIntakeOutcome.DUPLICATE,
          repeatedVitals,
        ],
        [
          P.TelemetryIntakeKind.CONVERSION,
          P.TelemetryIntakeOutcome.DUPLICATE,
          repeatedConversions,
        ],
      ]);
      this.warnWhenSlow(startedAt);
      const accepted = outcome.freshVitals + outcome.freshConversions;
      return { accepted, dropped: received - accepted };
    } catch (error) {
      this.logger.warn("Telemetry sink write failed", {
        correlationId: requestContext.correlationId(),
        errorName: error instanceof Error ? error.name : "UnknownError",
        events: received,
      });
      await this.countDropped(day, batch, P.TelemetryIntakeOutcome.SINK_FAILED);
      return { accepted: 0, dropped: received };
    }
  }

  private sampleVitals(vitals: TelemetryBatchInput["vitals"]) {
    if (vitals.length === 0) return vitals;
    const rate = clampRate(
      Number(this.config.get<string>("TELEMETRY_VITALS_SAMPLE_RATE", "1")),
    );
    return rate >= 1 || Math.random() < rate ? vitals : [];
  }

  private isSane(vital: TelemetryBatchInput["vitals"][number]) {
    return (
      isWithinMetricRange(vital.name, vital.value) &&
      ratingOf(vital.name, vital.value) === (vital.rating as TelemetryRating)
    );
  }

  private vitalEvent(
    vital: TelemetryBatchInput["vitals"][number],
  ): DedupedEvent<VitalDimensions> {
    return {
      dedupKey: dedupKeyOf(P.TelemetryIntakeKind.VITAL, vital.id),
      dimensions: {
        metric: vital.name,
        device: vital.device,
        template: vital.template,
        locale: vital.locale,
        bucket: bucketIndexOf(vital.name, vital.value),
      },
    };
  }

  private conversionEvent(
    event: TelemetryBatchInput["conversions"][number],
  ): DedupedEvent<ConversionDimensions> {
    return {
      dedupKey: dedupKeyOf(P.TelemetryIntakeKind.CONVERSION, event.id),
      dimensions: {
        event: event.event,
        contentKind: event.contentKind,
        role: event.role,
        attribution: event.attribution,
        locale: event.locale,
      },
    };
  }

  private async countDropped(
    day: Date,
    batch: TelemetryBatchInput,
    outcome: P.TelemetryIntakeOutcome,
  ) {
    await this.countBestEffort(day, [
      [P.TelemetryIntakeKind.VITAL, outcome, batch.vitals.length],
      [P.TelemetryIntakeKind.CONVERSION, outcome, batch.conversions.length],
    ]);
  }

  private async countBestEffort(
    day: Date,
    rows: [P.TelemetryIntakeKind, P.TelemetryIntakeOutcome, number][],
  ) {
    for (const [kind, outcome, count] of rows) {
      try {
        await this.repository.countIntake(day, kind, outcome, count);
      } catch (error) {
        this.logger.warn("Telemetry intake counter failed", {
          errorName: error instanceof Error ? error.name : "UnknownError",
        });
      }
    }
  }

  private warnWhenSlow(startedAt: number) {
    const elapsed = Math.round(performance.now() - startedAt);
    if (elapsed < SLOW_SINK_MS) return;
    this.logger.warn("Telemetry sink was slow", {
      correlationId: requestContext.correlationId(),
      elapsedMs: elapsed,
    });
  }
}
