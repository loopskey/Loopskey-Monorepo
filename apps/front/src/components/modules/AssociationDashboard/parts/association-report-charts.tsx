"use client";

import { AssociationComplianceBand } from "@/lib/graphql/base";
import { ASSOCIATION_BAND_COLORS } from "@utils/association-compliance-bands";
import { ASSOCIATION_BAND_ORDER } from "@utils/association-compliance-bands";
import { ShareBar, ShareLegend } from "@elements/charts/share-bar";
import { LazyTrendChart } from "@elements/charts/lazy-trend-chart";
import { CHART_COLOR } from "@/utils/chart.util";
import { isLightBand } from "@utils/association-compliance-bands";
import { ChartFrame } from "@elements/charts/chart-frame";
import { BarList } from "@elements/charts/bar-list";

import type { ShareSegment } from "@/types/chart.types";

import * as T from "@/types/association-dashboard.types";

const BAND_KEYS = {
  [AssociationComplianceBand.RenewalReady]: "renewalReady",
  [AssociationComplianceBand.OnTrack]: "onTrack",
  [AssociationComplianceBand.AtRisk]: "atRisk",
  [AssociationComplianceBand.NotStarted]: "notStarted",
} as const;

const BAND_SHARE_KEYS = {
  [AssociationComplianceBand.RenewalReady]: "renewalReadyShare",
  [AssociationComplianceBand.OnTrack]: "onTrackShare",
  [AssociationComplianceBand.AtRisk]: "atRiskShare",
  [AssociationComplianceBand.NotStarted]: "notStartedShare",
} as const;

type TBandCounts = Record<
  (typeof BAND_KEYS)[AssociationComplianceBand],
  number
>;

const formats = (locale: string) => ({
  count: (value: number) => value.toLocaleString(locale),
  percent: (value: number) =>
    `${value.toLocaleString(locale, { maximumFractionDigits: 0 })}%`,
  credits: (value: number) =>
    value.toLocaleString(locale, { maximumFractionDigits: 1 }),
});

const bandSegments = (
  counts: TBandCounts,
  label: T.TAssociationTrendChart["label"],
): ShareSegment[] =>
  ASSOCIATION_BAND_ORDER.map((band) => ({
    id: band,
    label: label(`bands.${band}`),
    value: counts[BAND_KEYS[band]],
    color: ASSOCIATION_BAND_COLORS[band],
    isLightFill: isLightBand(band),
  }));

const trendColor = (band: AssociationComplianceBand) =>
  isLightBand(band) ? CHART_COLOR.neutral : ASSOCIATION_BAND_COLORS[band];

const bandLegend = (label: T.TAssociationTrendChart["label"]) =>
  ASSOCIATION_BAND_ORDER.map((band) => ({
    id: band,
    label: label(`bands.${band}`),
    color: ASSOCIATION_BAND_COLORS[band],
  }));

export const GroupComplianceChart = ({
  rows,
  label,
  chrome,
  locale,
  threshold,
  onSelectGroup,
  ungroupedLabel,
}: T.TAssociationGroupComplianceChart) => {
  const format = formats(locale);
  const isBelow = (value: number) => threshold !== null && value < threshold;

  return (
    <ChartFrame
      {...chrome}
      legend={[
        {
          id: "above",
          label: label("charts.group.atOrAbove"),
          color: CHART_COLOR.series1,
        },
        ...(threshold !== null
          ? [
              {
                id: "below",
                label: label("charts.group.below"),
                color: CHART_COLOR.warning,
              },
              {
                id: "threshold",
                kind: "dash" as const,
                label: label("charts.group.threshold", {
                  percent: threshold.toLocaleString(locale),
                }),
              },
            ]
          : []),
      ]}
      table={{
        caption: label("charts.group.label"),
        columns: [
          label("chartTable.group"),
          label("chartTable.members"),
          label("chartTable.completion"),
        ],
        rows: rows.map((row) => ({
          id: row.groupId ?? "ungrouped",
          cells: [
            row.groupTitle ?? ungroupedLabel,
            format.count(row.memberCount),
            format.percent(row.averageCompletion),
          ],
        })),
      }}
    >
      <BarList
        max={100}
        labelWidth="lg"
        label={label("charts.group.label")}
        valueName={label("chartTable.completion")}
        formatValue={format.percent}
        threshold={
          threshold !== null
            ? {
                value: threshold,
                label: label("charts.group.threshold", {
                  percent: threshold.toLocaleString(locale),
                }),
              }
            : undefined
        }
        onSelect={(row) =>
          onSelectGroup(row.id === "ungrouped" ? null : row.id)
        }
        rows={rows.map((row) => ({
          id: row.groupId ?? "ungrouped",
          label: row.groupTitle ?? ungroupedLabel,
          description: label("charts.group.members", {
            count: format.count(row.memberCount),
          }),
          value: row.averageCompletion,
          color: isBelow(row.averageCompletion)
            ? CHART_COLOR.warning
            : CHART_COLOR.series1,
          tooltip: [
            {
              id: "members",
              label: label("chartTable.members"),
              value: format.count(row.memberCount),
            },
          ],
        }))}
      />
    </ChartFrame>
  );
};

export const CategoryProgressChart = ({
  rows,
  label,
  chrome,
  locale,
}: T.TAssociationCategoryReportChart) => {
  const format = formats(locale);

  return (
    <ChartFrame
      {...chrome}
      legend={[
        {
          id: "earned",
          label: label("charts.category.earned"),
          color: CHART_COLOR.series1,
        },
        {
          id: "required",
          kind: "marker",
          label: label("charts.category.required"),
        },
      ]}
      table={{
        caption: label("charts.category.label"),
        columns: [
          label("chartTable.category"),
          label("chartTable.requirement"),
          label("chartTable.required"),
          label("chartTable.earned"),
        ],
        rows: rows.map((row) => ({
          id: `${row.requirementId}:${row.categoryId}`,
          cells: [
            row.categoryName,
            row.requirementName,
            format.credits(row.requiredCredits),
            format.credits(row.averageCompletedCredits),
          ],
        })),
      }}
    >
      <BarList
        label={label("charts.category.label")}
        valueName={label("charts.category.earned")}
        targetName={label("charts.category.required")}
        formatValue={format.credits}
        rows={rows.map((row) => ({
          id: `${row.requirementId}:${row.categoryId}`,
          label: row.categoryName,
          description: row.requirementName,
          value: row.averageCompletedCredits,
          target: row.requiredCredits,
          valueLabel: (
            <>
              {format.credits(row.averageCompletedCredits)}
              <span className="text-xs text-muted-foreground">
                {" "}
                / {format.credits(row.requiredCredits)}
              </span>
            </>
          ),
        }))}
      />
    </ChartFrame>
  );
};

export const MemberDistributionChart = ({
  label,
  chrome,
  locale,
  distribution,
  onSelectBand,
}: T.TAssociationDistributionChart) => {
  const format = formats(locale);
  const segments = bandSegments(distribution, label);
  const select = (segment: ShareSegment) => {
    const band = ASSOCIATION_BAND_ORDER.find(
      (candidate) => candidate === segment.id,
    );
    if (band) onSelectBand(band);
  };

  return (
    <ChartFrame
      {...chrome}
      table={{
        caption: label("charts.distribution.label"),
        columns: [
          label("chartTable.band"),
          label("chartTable.members"),
          label("chartTable.share"),
        ],
        rows: ASSOCIATION_BAND_ORDER.map((band) => ({
          id: band,
          cells: [
            label(`bands.${band}`),
            format.count(distribution[BAND_KEYS[band]]),
            format.percent(distribution[BAND_SHARE_KEYS[band]]),
          ],
        })),
      }}
    >
      <div className="grid gap-4">
        <p className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold text-foreground">
            {format.count(distribution.totalMembers)}
          </span>
          <span className="text-sm text-muted-foreground">
            {label("charts.distribution.centre")}
          </span>
        </p>
        <ShareBar
          onSelect={select}
          segments={segments}
          formatValue={format.count}
          formatShare={format.percent}
          shareName={label("chartTable.share")}
          unitName={label("chartTable.members")}
          label={label("charts.distribution.label")}
        />
        <ShareLegend
          onSelect={select}
          segments={segments}
          formatValue={format.count}
          formatShare={format.percent}
        />
      </div>
    </ChartFrame>
  );
};

export const ComplianceTrendChart = ({
  rows,
  label,
  chrome,
  locale,
}: T.TAssociationTrendChart) => {
  const format = formats(locale);
  const month = (at: string) =>
    new Date(at).toLocaleDateString(locale, {
      month: "short",
      year: "2-digit",
    });
  const data = rows.map((row) => ({
    at: month(row.at),
    ...Object.fromEntries(
      ASSOCIATION_BAND_ORDER.map((band) => [band, row[BAND_SHARE_KEYS[band]]]),
    ),
  }));

  return (
    <ChartFrame
      {...chrome}
      legend={ASSOCIATION_BAND_ORDER.map((band) => ({
        id: band,
        label: label(`bands.${band}`),
        color: trendColor(band),
      }))}
      table={{
        caption: label("charts.trend.label"),
        columns: [
          label("chartTable.month"),
          ...ASSOCIATION_BAND_ORDER.map((band) => label(`bands.${band}`)),
        ],
        rows: rows.map((row) => ({
          id: row.at,
          cells: [
            month(row.at),
            ...ASSOCIATION_BAND_ORDER.map((band) =>
              format.percent(row[BAND_SHARE_KEYS[band]]),
            ),
          ],
        })),
      }}
    >
      <LazyTrendChart
        isStacked
        data={data}
        xKey="at"
        yDomain={[0, 100]}
        label={label("charts.trend.label")}
        formatValue={format.percent}
        series={ASSOCIATION_BAND_ORDER.map((band) => ({
          key: band,
          label: label(`bands.${band}`),
          color: trendColor(band),
          variant: "area" as const,
        }))}
      />
    </ChartFrame>
  );
};

export const GroupBandsChart = ({
  rows,
  label,
  chrome,
  locale,
  ungroupedLabel,
}: T.TAssociationGroupBandsChart) => {
  const format = formats(locale);

  return (
    <ChartFrame
      {...chrome}
      legend={bandLegend(label)}
      table={{
        caption: label("groupChart.label"),
        columns: [
          label("chartTable.group"),
          ...ASSOCIATION_BAND_ORDER.map((band) => label(`bands.${band}`)),
          label("chartTable.completion"),
        ],
        rows: rows.map((row) => ({
          id: row.groupId ?? "ungrouped",
          cells: [
            row.groupTitle ?? ungroupedLabel,
            ...ASSOCIATION_BAND_ORDER.map((band) =>
              format.count(row[BAND_KEYS[band]]),
            ),
            format.percent(row.averageCompletion),
          ],
        })),
      }}
    >
      <ul
        aria-label={label("groupChart.label")}
        className="@container grid gap-3"
      >
        {rows.map((row) => (
          <li
            key={row.groupId ?? "ungrouped"}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 @md:grid-cols-[10rem_minmax(0,1fr)_3.5rem]"
          >
            <span className="truncate text-sm text-foreground">
              {row.groupTitle ?? ungroupedLabel}
            </span>
            <ShareBar
              size="sm"
              formatValue={format.count}
              formatShare={format.percent}
              segments={bandSegments(row, label)}
              shareName={label("chartTable.share")}
              unitName={label("chartTable.members")}
              label={row.groupTitle ?? ungroupedLabel}
              className="col-span-2 row-start-2 @md:col-span-1 @md:col-start-2 @md:row-start-1"
            />
            <span className="col-start-2 row-start-1 text-right text-xs tabular-nums text-muted-foreground @md:col-start-3">
              {format.count(row.memberCount)}
            </span>
          </li>
        ))}
      </ul>
    </ChartFrame>
  );
};

export const CategoryCompletionChart = ({
  rows,
  label,
  chrome,
  locale,
}: T.TAssociationCategoryReportChart) => {
  const format = formats(locale);

  return (
    <ChartFrame
      {...chrome}
      table={{
        caption: label("categoryChart.label"),
        columns: [
          label("chartTable.category"),
          label("chartTable.requirement"),
          label("categoryChart.average"),
          label("categoryChart.belowHalf"),
        ],
        rows: rows.map((row) => ({
          id: `${row.requirementId}:${row.categoryId}`,
          cells: [
            row.categoryName,
            row.requirementName,
            format.percent(row.averagePercent),
            format.count(row.belowHalfCount),
          ],
        })),
      }}
    >
      <BarList
        max={100}
        labelWidth="lg"
        label={label("categoryChart.label")}
        valueName={label("categoryChart.average")}
        formatValue={format.percent}
        rows={rows.map((row) => ({
          id: `${row.requirementId}:${row.categoryId}`,
          label: row.categoryName,
          description: label("categoryChart.belowHalfLine", {
            count: format.count(row.belowHalfCount),
          }),
          value: row.averagePercent,
          tooltip: [
            {
              id: "below",
              label: label("categoryChart.belowHalf"),
              value: format.count(row.belowHalfCount),
            },
            {
              id: "requirement",
              label: label("chartTable.requirement"),
              value: row.requirementName,
            },
          ],
        }))}
      />
    </ChartFrame>
  );
};

export const RenewalReadinessChart = ({
  label,
  chrome,
  locale,
  segments,
}: T.TAssociationReadinessChart) => {
  const format = formats(locale);
  const shareSegments = segments.map((segment) => ({
    id: segment.id,
    label: segment.label,
    value: segment.count,
    color: segment.color,
    isLightFill: segment.isLightFill,
  }));

  return (
    <ChartFrame
      {...chrome}
      table={{
        caption: label("readiness.label"),
        columns: [
          label("chartTable.band"),
          label("chartTable.members"),
          label("chartTable.share"),
        ],
        rows: segments.map((segment) => ({
          id: segment.id,
          cells: [
            segment.label,
            format.count(segment.count),
            format.percent(segment.share),
          ],
        })),
      }}
    >
      <div className="grid gap-4">
        <ShareBar
          segments={shareSegments}
          label={label("readiness.label")}
          unitName={label("chartTable.members")}
          shareName={label("chartTable.share")}
          formatValue={format.count}
          formatShare={format.percent}
        />
        <ShareLegend
          segments={shareSegments}
          formatValue={format.count}
          formatShare={format.percent}
        />
      </div>
    </ChartFrame>
  );
};

export const MemberExtremesChart = ({
  label,
  chrome,
  locale,
  leaders,
  laggards,
}: T.TAssociationExtremesChart) => {
  const format = formats(locale);
  const nameOf = (row: T.TAssociationMemberProgressRow) =>
    row.fullName ?? row.email ?? row.memberNumber ?? row.memberId;
  const toRows = (rows: T.TAssociationMemberProgressRow[], color: string) =>
    rows.map((row) => ({
      id: row.memberId,
      label: nameOf(row),
      value: row.percent,
      color,
    }));

  return (
    <ChartFrame
      {...chrome}
      table={{
        caption: label("extremes.label"),
        columns: [label("chartTable.member"), label("table.completion")],
        rows: [...leaders, ...laggards].map((row) => ({
          id: row.memberId,
          cells: [nameOf(row), format.percent(row.percent)],
        })),
      }}
    >
      <div className="@container">
        <div className="grid gap-6 @2xl:grid-cols-2">
          {[
            {
              id: "leaders",
              heading: label("extremes.leaders"),
              rows: toRows(leaders, CHART_COLOR.series1),
            },
            {
              id: "laggards",
              heading: label("extremes.laggards"),
              rows: toRows(laggards, CHART_COLOR.neutral),
            },
          ].map((group) => (
            <div key={group.id} className="grid gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.heading}
              </h4>
              <BarList
                max={100}
                labelWidth="md"
                rows={group.rows}
                label={group.heading}
                valueName={label("table.completion")}
                formatValue={format.percent}
              />
            </div>
          ))}
        </div>
      </div>
    </ChartFrame>
  );
};
