"use client";

import { TAssociationCumulativeChart } from "@/types/association-dashboard.types";
import { CHART_SEMANTIC_SLOTS } from "@hooks/useChartPalette";

import * as R from "recharts";

const DESCRIPTION_ID = "association-cumulative-credits-description";

const CHART_HEIGHT = 320;

export const AssociationCumulativeChart = ({
  rows,
  label,
  locale,
  palette,
}: TAssociationCumulativeChart) => {
  const shortDate = (value: string) =>
    new Date(value).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
    });

  const fullDate = (value: string) =>
    new Date(value).toLocaleDateString(locale);

  return (
    <div>
      <p id={DESCRIPTION_ID} className="sr-only">
        {label("cumulativeChartDescription")}
      </p>

      <div
        role="img"
        style={{ height: CHART_HEIGHT }}
        aria-describedby={DESCRIPTION_ID}
        aria-label={label("cumulativeChartLabel")}
      >
        <R.ResponsiveContainer width="100%" height="100%">
          <R.LineChart data={rows} margin={{ right: 16, top: 8 }}>
            <R.CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <R.XAxis dataKey="date" fontSize={12} tickFormatter={shortDate} />
            <R.YAxis fontSize={12} allowDecimals={false} />
            <R.Tooltip
              labelFormatter={(value) => fullDate(String(value))}
              cursor={{ opacity: 0.1 }}
            />
            <R.Legend />

            <R.Line
              dot={false}
              dataKey="pace"
              type="linear"
              strokeDasharray="6 4"
              name={label("cumulativePace")}
              stroke={palette[CHART_SEMANTIC_SLOTS.notStarted]}
            />

            <R.Line
              type="stepAfter"
              dataKey="credits"
              strokeWidth={2}
              connectNulls={false}
              name={label("cumulativeEarned")}
              stroke={palette[CHART_SEMANTIC_SLOTS.onTrack]}
            />
          </R.LineChart>
        </R.ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>{label("cumulativeChartLabel")}</caption>

        <thead>
          <tr>
            <th scope="col">{label("cumulativeDate")}</th>
            <th scope="col">{label("cumulativeEarned")}</th>
            <th scope="col">{label("cumulativePace")}</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.date}>
              <th scope="row">{fullDate(row.date)}</th>
              <td>{row.credits ?? "-"}</td>
              <td>{Math.round(row.pace * 10) / 10}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssociationCumulativeChart;
