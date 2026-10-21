import { daysBefore, utcDay } from "@telemetry/utils/telemetry-day.util";
import { TELEMETRY_LIMITS } from "@loopskey/api-contracts/validation";
import { p75Of, statusOf } from "@telemetry/utils/telemetry-metric.util";
import { sampleRateOf } from "@telemetry/utils/telemetry-sampling.util";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { noticesOf } from "@telemetry/utils/telemetry-notice.util";

import type { SearchHealthReportEntity } from "@telemetry/entities/search-health-report.entity";

const segmentKey = (row: {
  metric: string;
  device: string;
  template: string;
  locale: string;
}) => [row.metric, row.device, row.template, row.locale].join("|");

@Injectable()
export class TelemetryReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async report(
    days: number,
    now = new Date(),
  ): Promise<SearchHealthReportEntity> {
    const to = utcDay(now);
    const from = daysBefore(now, days - 1);
    const window = { day: { gte: from, lte: to } };

    const [buckets, conversions, intake, dataDays] = await Promise.all([
      this.prisma.telemetryVitalBucket.groupBy({
        by: ["metric", "device", "template", "locale", "bucket"],
        where: window,
        _sum: { count: true },
      }),
      this.prisma.telemetryConversionDaily.groupBy({
        by: ["event", "contentKind", "role", "attribution", "locale"],
        where: window,
        _sum: { count: true },
      }),
      this.prisma.telemetryIntakeDaily.groupBy({
        by: ["kind", "outcome"],
        where: window,
        _sum: { count: true },
      }),
      this.prisma.telemetryVitalBucket.findMany({
        where: window,
        distinct: ["day"],
        select: { day: true },
      }),
    ]);

    const segments = new Map<
      string,
      {
        head: (typeof buckets)[number];
        rows: { bucket: number; count: number }[];
      }
    >();
    for (const row of buckets) {
      const key = segmentKey(row);
      const entry = segments.get(key) ?? { head: row, rows: [] };
      entry.rows.push({ bucket: row.bucket, count: row._sum.count ?? 0 });
      segments.set(key, entry);
    }

    const vitals = [...segments.values()]
      .map(({ head, rows }) => {
        const samples = rows.reduce((sum, row) => sum + row.count, 0);
        const p75 = p75Of(head.metric, rows);
        return {
          metric: head.metric,
          device: head.device,
          template: head.template,
          locale: head.locale,
          samples,
          p75: Math.round(p75 * 1000) / 1000,
          status: statusOf(head.metric, p75, samples),
        };
      })
      .sort((left, right) => (segmentKey(left) < segmentKey(right) ? -1 : 1));

    const conversionRows = conversions.map((row) => ({
      event: row.event,
      contentKind: row.contentKind,
      role: row.role,
      attribution: row.attribution,
      locale: row.locale,
      count: row._sum.count ?? 0,
    }));
    const isCollecting =
      this.config.get<string>("TELEMETRY_ENABLED") === "true";
    const sampleRate = sampleRateOf(
      this.config.get<string>("TELEMETRY_VITALS_SAMPLE_RATE"),
    );
    const intakeTotal = (outcome: string) =>
      intake
        .filter((row) => row.outcome === outcome)
        .reduce((sum, row) => sum + (row._sum.count ?? 0), 0);

    return {
      from,
      to,
      days,
      daysWithData: dataDays.length,
      minimumSamples: TELEMETRY_LIMITS.minimumSamples,
      isCollecting,
      collection: {
        apiEnabled: isCollecting,
        vitalsSampleRate: sampleRate,
        retentionDays: TELEMETRY_LIMITS.aggregateRetentionDays,
        dedupWindowHours: TELEMETRY_LIMITS.dedupWindowHours,
        notices: noticesOf({
          days,
          isCollecting,
          sampleRate,
          daysWithData: dataDays.length,
          minimumSamples: TELEMETRY_LIMITS.minimumSamples,
          failedEvents: intakeTotal("SINK_FAILED"),
          rateLimitedEvents: intakeTotal("RATE_LIMITED"),
          vitalSegmentSamples: vitals.map((segment) => segment.samples),
          conversionEvents: conversionRows.reduce(
            (sum, row) => sum + row.count,
            0,
          ),
        }),
      },
      vitals,
      conversions: conversionRows,
      intake: intake.map((row) => ({
        kind: row.kind,
        outcome: row.outcome,
        count: row._sum.count ?? 0,
      })),
    };
  }
}
