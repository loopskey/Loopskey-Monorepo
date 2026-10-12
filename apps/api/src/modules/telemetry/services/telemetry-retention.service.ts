import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Injectable, Logger } from "@nestjs/common";
import { TELEMETRY_LIMITS } from "@loopskey/api-contracts/validation";
import { PrismaService } from "@prisma/prisma.service";
import { daysBefore } from "@telemetry/utils/telemetry-day.util";
import { Prisma } from "@prisma/client";

const SWEEP_INTERVAL_MS = 60 * 60 * 1000;
const DELETE_BATCH = 5000;
const MAX_BATCHES_PER_TABLE = 20;
const HOUR_MS = 60 * 60 * 1000;

const AGGREGATE_TABLES = [
  "TelemetryVitalBucket",
  "TelemetryConversionDaily",
  "TelemetryIntakeDaily",
] as const;

@Injectable()
export class TelemetryRetentionService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(TelemetryRetentionService.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.timer = setInterval(() => this.tick(), SWEEP_INTERVAL_MS);
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async sweep(now = new Date()) {
    const dedupCutoff = new Date(
      now.getTime() - TELEMETRY_LIMITS.dedupWindowHours * HOUR_MS,
    );
    const aggregateCutoff = daysBefore(
      now,
      TELEMETRY_LIMITS.aggregateRetentionDays,
    );

    const dedup = await this.deleteInBatches(
      Prisma.raw('"TelemetryDedupKey"'),
      Prisma.sql`"seenAt" < ${dedupCutoff}`,
    );
    let aggregates = 0;
    for (const table of AGGREGATE_TABLES)
      aggregates += await this.deleteInBatches(
        Prisma.raw(`"${table}"`),
        Prisma.sql`"day" < ${aggregateCutoff}::date`,
      );

    if (dedup + aggregates > 0)
      this.logger.log("Telemetry retention sweep finished", {
        dedupKeysRemoved: dedup,
        aggregateRowsRemoved: aggregates,
      });
    return { dedup, aggregates };
  }

  private async deleteInBatches(table: Prisma.Sql, predicate: Prisma.Sql) {
    let removed = 0;
    for (let batch = 0; batch < MAX_BATCHES_PER_TABLE; batch += 1) {
      const count = await this.prisma.$executeRaw(Prisma.sql`
        DELETE FROM ${table}
        WHERE ctid IN (
          SELECT ctid FROM ${table} WHERE ${predicate} LIMIT ${DELETE_BATCH}
        )
      `);
      removed += count;
      if (count < DELETE_BATCH) break;
    }
    return removed;
  }

  private tick() {
    if (this.running) return;
    this.running = true;
    void this.sweep()
      .catch((error: unknown) => {
        this.logger.error("Telemetry retention sweep failed", {
          message: error instanceof Error ? error.message : "Unknown error",
        });
      })
      .finally(() => {
        this.running = false;
      });
  }
}
