"use client";

import { ASSOCIATION_BAND_SEMANTICS } from "@utils/association-compliance-bands";
import { AssociationComplianceBand } from "@/lib/graphql/base";
import { ASSOCIATION_BAND_ORDER } from "@utils/association-compliance-bands";
import { NEUTRAL_CHART_SLOT } from "@utils/association-compliance-bands";
import { semanticChartColor } from "@hooks/useChartPalette";
import { chartTone } from "@utils/association-reports";

import * as T from "@/types/association-dashboard.types";
import * as R from "recharts";

const ROW_HEIGHT = 46;

const MIN_HEIGHT = 260;

const heightFor = (count: number) =>
  Math.max(MIN_HEIGHT, count * ROW_HEIGHT + 56);

const percentOf = (value: number, locale: string) =>
  `${value.toLocaleString(locale)}%`;

const BAND_KEYS = {
  [AssociationComplianceBand.RenewalReady]: "renewalReady",
  [AssociationComplianceBand.OnTrack]: "onTrack",
  [AssociationComplianceBand.AtRisk]: "atRisk",
  [AssociationComplianceBand.NotStarted]: "notStarted",
} as const;

export const GroupBandsChart = ({
  rows,
  label,
  locale,
  palette,
  ungroupedLabel,
}: T.TAssociationGroupBandsChart) => {
  const descriptionId = "association-report-group-bands-description";

  const data = rows.map((row) => ({
    ...row,
    name: row.groupTitle ?? ungroupedLabel,
  }));

  return (
    <div>
      <p id={descriptionId} className="sr-only">
        {label("groupChart.description")}
      </p>

      <div
        role="img"
        aria-describedby={descriptionId}
        aria-label={label("groupChart.label")}
        style={{ height: heightFor(data.length) }}
      >
        <R.ResponsiveContainer width="100%" height="100%">
          <R.BarChart layout="vertical" data={data} margin={{ right: 16 }}>
            <R.CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <R.XAxis type="number" allowDecimals={false} fontSize={12} />
            <R.YAxis width={140} type="category" dataKey="name" fontSize={12} />
            <R.Tooltip cursor={{ opacity: 0.1 }} />
            <R.Legend />

            {ASSOCIATION_BAND_ORDER.map((band) => (
              <R.Bar
                key={band}
                dataKey={BAND_KEYS[band]}
                stackId="bands"
                radius={[0, 8, 8, 0]}
                name={label(`bands.${band}`)}
                fill={semanticChartColor(
                  palette,
                  ASSOCIATION_BAND_SEMANTICS[band],
                )}
              />
            ))}
          </R.BarChart>
        </R.ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>{label("groupChart.label")}</caption>

        <thead>
          <tr>
            <th scope="col">{label("chartTable.group")}</th>
            {ASSOCIATION_BAND_ORDER.map((band) => (
              <th key={band} scope="col">
                {label(`bands.${band}`)}
              </th>
            ))}
            <th scope="col">{label("chartTable.completion")}</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.groupId ?? "ungrouped"}>
              <th scope="row">{row.name}</th>
              {ASSOCIATION_BAND_ORDER.map((band) => (
                <td key={band}>
                  {row[BAND_KEYS[band]].toLocaleString(locale)}
                </td>
              ))}
              <td>{percentOf(row.averageCompletion, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CategoryCompletionChart = ({
  rows,
  label,
  locale,
  palette,
}: T.TAssociationCategoryReportChart) => {
  const descriptionId = "association-report-category-completion-description";

  const data = rows.map((row) => ({
    ...row,
    name: row.categoryName,
    key: `${row.requirementId}:${row.categoryId}`,
  }));

  return (
    <div>
      <p id={descriptionId} className="sr-only">
        {label("categoryChart.description")}
      </p>

      <div
        role="img"
        aria-describedby={descriptionId}
        aria-label={label("categoryChart.label")}
        style={{ height: heightFor(data.length) }}
      >
        <R.ResponsiveContainer width="100%" height="100%">
          <R.BarChart layout="vertical" data={data} margin={{ right: 16 }}>
            <R.CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <R.XAxis
              type="number"
              fontSize={12}
              xAxisId="percent"
              domain={[0, 100]}
            />
            <R.XAxis type="number" hide xAxisId="count" />
            <R.YAxis width={150} type="category" dataKey="name" fontSize={12} />
            <R.Tooltip cursor={{ opacity: 0.1 }} />
            <R.Legend />

            <R.Bar
              xAxisId="percent"
              radius={[0, 8, 8, 0]}
              dataKey="averagePercent"
              name={label("categoryChart.average")}
              fill={palette[NEUTRAL_CHART_SLOT]}
            />

            <R.Bar
              xAxisId="count"
              radius={[0, 8, 8, 0]}
              dataKey="belowHalfCount"
              name={label("categoryChart.belowHalf")}
              fill={chartTone(semanticChartColor(palette, "atRisk"), 0.55)}
            />
          </R.BarChart>
        </R.ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>{label("categoryChart.label")}</caption>

        <thead>
          <tr>
            <th scope="col">{label("chartTable.category")}</th>
            <th scope="col">{label("categoryChart.average")}</th>
            <th scope="col">{label("categoryChart.belowHalf")}</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.key}>
              <th scope="row">{row.categoryName}</th>
              <td>{percentOf(row.averagePercent, locale)}</td>
              <td>{row.belowHalfCount.toLocaleString(locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const RenewalReadinessChart = ({
  label,
  locale,
  segments,
}: T.TAssociationReadinessChart) => {
  const descriptionId = "association-report-readiness-description";

  const counts = segments.reduce<Record<string, number>>(
    (accumulator, segment) => ({
      ...accumulator,
      [segment.id]: segment.count,
    }),
    {},
  );

  return (
    <div>
      <p id={descriptionId} className="sr-only">
        {label("readiness.description")}
      </p>

      <div
        role="img"
        className="h-40"
        aria-describedby={descriptionId}
        aria-label={label("readiness.label")}
      >
        <R.ResponsiveContainer width="100%" height="100%">
          <R.BarChart
            layout="vertical"
            margin={{ right: 16 }}
            data={[{ ...counts, name: label("readiness.title") }]}
          >
            <R.XAxis type="number" hide />
            <R.YAxis type="category" dataKey="name" hide />
            <R.Tooltip cursor={{ opacity: 0.1 }} />
            <R.Legend />

            {segments.map((segment, index) => (
              <R.Bar
                key={segment.id}
                name={segment.label}
                dataKey={segment.id}
                fill={segment.color}
                stackId="readiness"
                radius={
                  index === segments.length - 1 ? [0, 12, 12, 0] : undefined
                }
              >
                <R.LabelList
                  fontSize={11}
                  position="center"
                  dataKey={segment.id}
                  formatter={(value: unknown) =>
                    Number(value ?? 0).toLocaleString(locale)
                  }
                />
              </R.Bar>
            ))}
          </R.BarChart>
        </R.ResponsiveContainer>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {segments.map((segment) => (
          <li key={segment.id} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />

            <span>{segment.label}</span>

            <span className="tabular-nums text-muted-foreground">
              {segment.count.toLocaleString(locale)} ·{" "}
              {percentOf(segment.share, locale)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const MemberExtremesChart = ({
  label,
  locale,
  leaders,
  palette,
  laggards,
}: T.TAssociationExtremesChart) => {
  const descriptionId = "association-report-extremes-description";

  const toData = (rows: T.TAssociationExtremesChart["leaders"]) =>
    rows.map((row) => ({
      percent: row.percent,
      key: row.memberId,
      name: row.fullName ?? row.email ?? row.memberNumber ?? row.memberId,
    }));

  const leaderRows = toData(leaders);
  const laggardRows = toData(laggards);

  const strip = (heading: string, rows: typeof leaderRows, color: string) => (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {heading}
      </p>

      <div style={{ height: heightFor(rows.length) }} className="mt-2">
        <R.ResponsiveContainer width="100%" height="100%">
          <R.BarChart layout="vertical" data={rows} margin={{ right: 24 }}>
            <R.CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <R.XAxis type="number" domain={[0, 100]} fontSize={12} />
            <R.YAxis width={130} type="category" dataKey="name" fontSize={11} />
            <R.Tooltip
              cursor={{ opacity: 0.1 }}
              formatter={(value) => percentOf(Number(value ?? 0), locale)}
            />

            <R.Bar
              fill={color}
              dataKey="percent"
              radius={[0, 8, 8, 0]}
              name={label("table.completion")}
            />
          </R.BarChart>
        </R.ResponsiveContainer>
      </div>
    </div>
  );

  const equivalentTable = (heading: string, rows: typeof leaderRows) => (
    <table className="sr-only">
      <caption>{heading}</caption>

      <thead>
        <tr>
          <th scope="col">{label("table.member")}</th>
          <th scope="col">{label("table.completion")}</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            <th scope="row">{row.name}</th>
            <td>{percentOf(row.percent, locale)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div>
      <p id={descriptionId} className="sr-only">
        {label("extremes.description")}
      </p>

      <div
        role="img"
        aria-describedby={descriptionId}
        aria-label={label("extremes.label")}
        className="grid gap-6 lg:grid-cols-2"
      >
        {strip(
          label("extremes.leaders"),
          leaderRows,
          semanticChartColor(palette, "renewalReady"),
        )}

        {strip(
          label("extremes.laggards"),
          laggardRows,
          semanticChartColor(palette, "atRisk"),
        )}
      </div>

      {equivalentTable(label("extremes.leaders"), leaderRows)}
      {equivalentTable(label("extremes.laggards"), laggardRows)}
    </div>
  );
};
