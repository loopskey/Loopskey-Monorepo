"use client";

import { ASSOCIATION_BAND_SEMANTICS } from "@utils/association-compliance-bands";
import { AssociationComplianceBand } from "@/lib/graphql/base";
import { ASSOCIATION_BAND_ORDER } from "@utils/association-compliance-bands";
import { NEUTRAL_CHART_SLOT } from "@utils/association-compliance-bands";
import { semanticChartColor } from "@hooks/useChartPalette";
import { chartTone } from "@utils/association-reports";

import * as T from "@/types/association-dashboard.types";
import * as R from "recharts";

const ROW_HEIGHT = 42;

const MIN_HEIGHT = 240;

const heightFor = (count: number) =>
  Math.max(MIN_HEIGHT, count * ROW_HEIGHT + 48);

const monthLabel = (at: string, locale: string) =>
  new Date(at).toLocaleDateString(locale, { month: "short", year: "2-digit" });

const percentOf = (value: number, locale: string) =>
  `${value.toLocaleString(locale)}%`;

export const GroupComplianceChart = ({
  rows,
  label,
  locale,
  palette,
  threshold,
  onSelectGroup,
  ungroupedLabel,
}: T.TAssociationGroupComplianceChart) => {
  const descriptionId = "association-report-group-description";

  const data = rows.map((row) => ({
    ...row,
    name: row.groupTitle ?? ungroupedLabel,
  }));

  return (
    <div>
      <p id={descriptionId} className="sr-only">
        {label("charts.group.description")}
      </p>

      <div
        role="img"
        aria-describedby={descriptionId}
        aria-label={label("charts.group.label")}
        style={{ height: heightFor(data.length) }}
      >
        <R.ResponsiveContainer width="100%" height="100%">
          <R.BarChart layout="vertical" data={data} margin={{ right: 48 }}>
            <R.CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <R.XAxis type="number" domain={[0, 100]} fontSize={12} />
            <R.YAxis width={140} type="category" dataKey="name" fontSize={12} />
            <R.Tooltip
              cursor={{ opacity: 0.1 }}
              formatter={(value) => percentOf(Number(value ?? 0), locale)}
            />

            {threshold !== null && (
              <R.ReferenceLine
                x={threshold}
                strokeDasharray="4 4"
                stroke={semanticChartColor(palette, "onTrack")}
                label={{
                  fontSize: 11,
                  position: "top",
                  value: label("charts.group.threshold", {
                    percent: threshold.toLocaleString(locale),
                  }),
                }}
              />
            )}

            <R.Bar
              radius={[0, 8, 8, 0]}
              className="cursor-pointer"
              dataKey="averageCompletion"
              name={label("chartTable.completion")}
              fill={palette[NEUTRAL_CHART_SLOT]}
              onClick={(entry: unknown) =>
                onSelectGroup(
                  (entry as { payload?: { groupId: string | null } })?.payload
                    ?.groupId ?? null,
                )
              }
            >
              <R.LabelList
                fontSize={11}
                position="right"
                dataKey="memberCount"
                className="fill-muted-foreground"
                formatter={(value: unknown) =>
                  label("charts.group.members", {
                    count: Number(value ?? 0).toLocaleString(locale),
                  })
                }
              />
            </R.Bar>
          </R.BarChart>
        </R.ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>{label("charts.group.label")}</caption>

        <thead>
          <tr>
            <th scope="col">{label("chartTable.group")}</th>
            <th scope="col">{label("chartTable.members")}</th>
            <th scope="col">{label("chartTable.completion")}</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.groupId ?? "ungrouped"}>
              <th scope="row">{row.name}</th>
              <td>{row.memberCount}</td>
              <td>{percentOf(row.averageCompletion, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CategoryProgressChart = ({
  rows,
  label,
  locale,
  palette,
}: T.TAssociationCategoryReportChart) => {
  const descriptionId = "association-report-category-description";

  const data = rows.map((row) => ({
    ...row,
    name: row.categoryName,
    key: `${row.requirementId}:${row.categoryId}`,
  }));

  return (
    <div>
      <p id={descriptionId} className="sr-only">
        {label("charts.category.description")}
      </p>

      <div
        role="img"
        aria-describedby={descriptionId}
        aria-label={label("charts.category.label")}
        style={{ height: heightFor(data.length * 2) }}
      >
        <R.ResponsiveContainer width="100%" height="100%">
          <R.BarChart layout="vertical" data={data} margin={{ right: 16 }}>
            <R.CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <R.XAxis type="number" fontSize={12} />
            <R.YAxis width={150} type="category" dataKey="name" fontSize={12} />
            <R.Tooltip cursor={{ opacity: 0.1 }} />
            <R.Legend />

            <R.Bar
              radius={[0, 8, 8, 0]}
              dataKey="requiredCredits"
              name={label("charts.category.required")}
              fill={chartTone(semanticChartColor(palette, "notStarted"), 0.55)}
            />

            <R.Bar
              radius={[0, 8, 8, 0]}
              dataKey="averageCompletedCredits"
              name={label("charts.category.earned")}
              fill={semanticChartColor(palette, "onTrack")}
            />
          </R.BarChart>
        </R.ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>{label("charts.category.label")}</caption>

        <thead>
          <tr>
            <th scope="col">{label("chartTable.category")}</th>
            <th scope="col">{label("chartTable.requirement")}</th>
            <th scope="col">{label("chartTable.required")}</th>
            <th scope="col">{label("chartTable.earned")}</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.key}>
              <th scope="row">{row.categoryName}</th>
              <td>{row.requirementName}</td>
              <td>{row.requiredCredits.toLocaleString(locale)}</td>
              <td>{row.averageCompletedCredits.toLocaleString(locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const MemberDistributionChart = ({
  label,
  locale,
  palette,
  distribution,
  onSelectBand,
}: T.TAssociationDistributionChart) => {
  const descriptionId = "association-report-distribution-description";

  const counts: Record<AssociationComplianceBand, number> = {
    [AssociationComplianceBand.RenewalReady]: distribution.renewalReady,
    [AssociationComplianceBand.OnTrack]: distribution.onTrack,
    [AssociationComplianceBand.AtRisk]: distribution.atRisk,
    [AssociationComplianceBand.NotStarted]: distribution.notStarted,
  };

  const shares: Record<AssociationComplianceBand, number> = {
    [AssociationComplianceBand.RenewalReady]: distribution.renewalReadyShare,
    [AssociationComplianceBand.OnTrack]: distribution.onTrackShare,
    [AssociationComplianceBand.AtRisk]: distribution.atRiskShare,
    [AssociationComplianceBand.NotStarted]: distribution.notStartedShare,
  };

  const data = ASSOCIATION_BAND_ORDER.map((band) => ({
    band,
    value: counts[band],
    share: shares[band],
    name: label(`bands.${band}`),
    fill: semanticChartColor(palette, ASSOCIATION_BAND_SEMANTICS[band]),
  }));

  return (
    <div>
      <p id={descriptionId} className="sr-only">
        {label("charts.distribution.description")}
      </p>

      <div
        role="img"
        className="relative h-72"
        aria-describedby={descriptionId}
        aria-label={label("charts.distribution.label")}
      >
        <R.ResponsiveContainer width="100%" height="100%">
          <R.PieChart>
            <R.Pie
              cx="50%"
              cy="50%"
              data={data}
              nameKey="name"
              dataKey="value"
              stroke="none"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              className="cursor-pointer"
              label={(entry) =>
                percentOf(
                  Number((entry as { share?: number }).share ?? 0),
                  locale,
                )
              }
              onClick={(entry: unknown) => {
                const band = (entry as { payload?: { band?: string } })?.payload
                  ?.band;
                const match = ASSOCIATION_BAND_ORDER.find(
                  (candidate) => candidate === band,
                );
                if (match) onSelectBand(match);
              }}
            >
              {data.map((entry) => (
                <R.Cell key={entry.band} fill={entry.fill} />
              ))}
            </R.Pie>

            <R.Tooltip />
          </R.PieChart>
        </R.ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-medium tabular-nums">
            {distribution.totalMembers.toLocaleString(locale)}
          </p>

          <p className="text-xs uppercase text-muted-foreground">
            {label("charts.distribution.centre")}
          </p>
        </div>
      </div>

      <table className="sr-only">
        <caption>{label("charts.distribution.label")}</caption>

        <thead>
          <tr>
            <th scope="col">{label("chartTable.band")}</th>
            <th scope="col">{label("chartTable.members")}</th>
            <th scope="col">{label("chartTable.share")}</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.band}>
              <th scope="row">{row.name}</th>
              <td>{row.value.toLocaleString(locale)}</td>
              <td>{percentOf(row.share, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const ComplianceTrendChart = ({
  rows,
  label,
  locale,
  palette,
}: T.TAssociationTrendChart) => {
  const descriptionId = "association-report-trend-description";

  const data: (Record<AssociationComplianceBand, number> & {
    at: string;
    month: string;
  })[] = rows.map((row) => ({
    at: row.at,
    month: monthLabel(row.at, locale),
    [AssociationComplianceBand.RenewalReady]: row.renewalReadyShare,
    [AssociationComplianceBand.OnTrack]: row.onTrackShare,
    [AssociationComplianceBand.AtRisk]: row.atRiskShare,
    [AssociationComplianceBand.NotStarted]: row.notStartedShare,
  }));

  return (
    <div>
      <p id={descriptionId} className="sr-only">
        {label("charts.trend.description")}
      </p>

      <div
        role="img"
        className="h-72"
        aria-describedby={descriptionId}
        aria-label={label("charts.trend.label")}
      >
        <R.ResponsiveContainer width="100%" height="100%">
          <R.AreaChart data={data} margin={{ right: 16 }}>
            <R.CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <R.XAxis dataKey="month" fontSize={12} />
            <R.YAxis domain={[0, 100]} fontSize={12} />
            <R.Tooltip
              formatter={(value) => percentOf(Number(value ?? 0), locale)}
            />
            <R.Legend />

            {ASSOCIATION_BAND_ORDER.map((band) => (
              <R.Area
                key={band}
                dataKey={band}
                type="monotone"
                stackId="bands"
                strokeWidth={2}
                name={label(`bands.${band}`)}
                stroke={semanticChartColor(
                  palette,
                  ASSOCIATION_BAND_SEMANTICS[band],
                )}
                fill={chartTone(
                  semanticChartColor(palette, ASSOCIATION_BAND_SEMANTICS[band]),
                  0.4,
                )}
              />
            ))}
          </R.AreaChart>
        </R.ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>{label("charts.trend.label")}</caption>

        <thead>
          <tr>
            <th scope="col">{label("chartTable.month")}</th>
            {ASSOCIATION_BAND_ORDER.map((band) => (
              <th key={band} scope="col">
                {label(`bands.${band}`)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.at}>
              <th scope="row">{row.month}</th>
              {ASSOCIATION_BAND_ORDER.map((band) => (
                <td key={band}>{percentOf(row[band], locale)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
