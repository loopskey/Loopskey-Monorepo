import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import type * as P from "@prisma/client";

export type VitalDimensions = {
  metric: P.TelemetryMetric;
  device: P.TelemetryDevice;
  template: P.TelemetryRouteTemplate;
  locale: P.TelemetryLocale;
  bucket: number;
};

export type ConversionDimensions = {
  event: P.TelemetryConversionEvent;
  contentKind: P.TelemetryContentKind;
  role: P.TelemetryRegistrationRole;
  attribution: P.TelemetryAttribution;
  locale: P.TelemetryLocale;
};

export type DedupedEvent<TDimensions> = {
  dedupKey: string;
  dimensions: TDimensions;
};

export type RecordOutcome = {
  freshVitals: number;
  freshConversions: number;
  duplicateVitals: number;
  duplicateConversions: number;
};

type RecordInput = {
  day: Date;
  vitals: DedupedEvent<VitalDimensions>[];
  conversions: DedupedEvent<ConversionDimensions>[];
  countsIntake: boolean;
};

type Tally<TDimensions> = { dimensions: TDimensions; count: number };

const tallyOf = <TDimensions>(
  events: DedupedEvent<TDimensions>[],
  serialize: (dimensions: TDimensions) => string,
) => {
  const tallies = new Map<string, Tally<TDimensions>>();
  for (const { dimensions } of events) {
    const key = serialize(dimensions);
    const existing = tallies.get(key);
    if (existing) existing.count += 1;
    else tallies.set(key, { dimensions, count: 1 });
  }
  return [...tallies.entries()]
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([, tally]) => tally);
};

const vitalKey = (dimensions: VitalDimensions) =>
  [
    dimensions.metric,
    dimensions.device,
    dimensions.template,
    dimensions.locale,
    String(dimensions.bucket).padStart(4, "0"),
  ].join("|");

const conversionKey = (dimensions: ConversionDimensions) =>
  [
    dimensions.event,
    dimensions.contentKind,
    dimensions.role,
    dimensions.attribution,
    dimensions.locale,
  ].join("|");

const TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 15_000 };

@Injectable()
export class TelemetryAggregateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordInput): Promise<RecordOutcome> {
    return this.prisma.$transaction(async (tx) => {
      const fresh = await this.claimFreshKeys(tx, [
        ...input.vitals.map((event) => event.dedupKey),
        ...input.conversions.map((event) => event.dedupKey),
      ]);
      const vitals = input.vitals.filter((event) => fresh.has(event.dedupKey));
      const conversions = input.conversions.filter((event) =>
        fresh.has(event.dedupKey),
      );
      await this.addVitals(tx, input.day, vitals);
      await this.addConversions(tx, input.day, conversions);
      const outcome = {
        freshVitals: vitals.length,
        freshConversions: conversions.length,
        duplicateVitals: input.vitals.length - vitals.length,
        duplicateConversions: input.conversions.length - conversions.length,
      };
      if (input.countsIntake) await this.addIntake(tx, input.day, outcome);
      return outcome;
    }, TRANSACTION_OPTIONS);
  }

  async countIntake(
    day: Date,
    kind: P.TelemetryIntakeKind,
    outcome: P.TelemetryIntakeOutcome,
    count: number,
  ) {
    if (count <= 0) return;
    await this.upsertIntake(this.prisma, day, [{ kind, outcome, count }]);
  }

  private async claimFreshKeys(tx: Prisma.TransactionClient, keys: string[]) {
    if (keys.length === 0) return new Set<string>();
    const ordered = [...new Set(keys)].sort();
    const rows = await tx.$queryRaw<{ key: string }[]>(Prisma.sql`
      INSERT INTO "TelemetryDedupKey" ("key", "seenAt")
      SELECT incoming, timezone('UTC', now())
      FROM unnest(${ordered}::text[]) AS incoming
      ORDER BY incoming
      ON CONFLICT ("key") DO NOTHING
      RETURNING "key"
    `);
    return new Set(rows.map((row) => row.key));
  }

  private async addVitals(
    tx: Prisma.TransactionClient,
    day: Date,
    events: DedupedEvent<VitalDimensions>[],
  ) {
    const tallies = tallyOf(events, vitalKey);
    if (tallies.length === 0) return;
    const values = tallies.map(
      ({ dimensions, count }) =>
        Prisma.sql`(${day}::date, ${dimensions.metric}::"TelemetryMetric", ${dimensions.device}::"TelemetryDevice", ${dimensions.template}::"TelemetryRouteTemplate", ${dimensions.locale}::"TelemetryLocale", ${dimensions.bucket}::smallint, ${count}::int)`,
    );
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "TelemetryVitalBucket"
        ("day", "metric", "device", "template", "locale", "bucket", "count")
      VALUES ${Prisma.join(values)}
      ON CONFLICT ("day", "metric", "device", "template", "locale", "bucket")
      DO UPDATE SET "count" = "TelemetryVitalBucket"."count" + EXCLUDED."count"
    `);
  }

  private async addConversions(
    tx: Prisma.TransactionClient,
    day: Date,
    events: DedupedEvent<ConversionDimensions>[],
  ) {
    const tallies = tallyOf(events, conversionKey);
    if (tallies.length === 0) return;
    const values = tallies.map(
      ({ dimensions, count }) =>
        Prisma.sql`(${day}::date, ${dimensions.event}::"TelemetryConversionEvent", ${dimensions.contentKind}::"TelemetryContentKind", ${dimensions.role}::"TelemetryRegistrationRole", ${dimensions.attribution}::"TelemetryAttribution", ${dimensions.locale}::"TelemetryLocale", ${count}::int)`,
    );
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "TelemetryConversionDaily"
        ("day", "event", "contentKind", "role", "attribution", "locale", "count")
      VALUES ${Prisma.join(values)}
      ON CONFLICT ("day", "event", "contentKind", "role", "attribution", "locale")
      DO UPDATE SET "count" = "TelemetryConversionDaily"."count" + EXCLUDED."count"
    `);
  }

  private addIntake(
    tx: Prisma.TransactionClient,
    day: Date,
    outcome: RecordOutcome,
  ) {
    return this.upsertIntake(tx, day, [
      {
        kind: "VITAL",
        outcome: "ACCEPTED",
        count: outcome.freshVitals,
      },
      {
        kind: "VITAL",
        outcome: "DUPLICATE",
        count: outcome.duplicateVitals,
      },
      {
        kind: "CONVERSION",
        outcome: "ACCEPTED",
        count: outcome.freshConversions,
      },
      {
        kind: "CONVERSION",
        outcome: "DUPLICATE",
        count: outcome.duplicateConversions,
      },
    ]);
  }

  private async upsertIntake(
    client: Prisma.TransactionClient | PrismaClient,
    day: Date,
    rows: {
      kind: P.TelemetryIntakeKind;
      outcome: P.TelemetryIntakeOutcome;
      count: number;
    }[],
  ) {
    const present = rows
      .filter((row) => row.count > 0)
      .sort((left, right) =>
        `${left.kind}${left.outcome}` < `${right.kind}${right.outcome}`
          ? -1
          : 1,
      );
    if (present.length === 0) return;
    const values = present.map(
      (row) =>
        Prisma.sql`(${day}::date, ${row.kind}::"TelemetryIntakeKind", ${row.outcome}::"TelemetryIntakeOutcome", ${row.count}::int)`,
    );
    await client.$executeRaw(Prisma.sql`
      INSERT INTO "TelemetryIntakeDaily" ("day", "kind", "outcome", "count")
      VALUES ${Prisma.join(values)}
      ON CONFLICT ("day", "kind", "outcome")
      DO UPDATE SET "count" = "TelemetryIntakeDaily"."count" + EXCLUDED."count"
    `);
  }
}
