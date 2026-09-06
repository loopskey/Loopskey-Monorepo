"use client";

import { TAssociationCategoryChart } from "@/types/association-dashboard.types";
import { CHART_SEMANTIC_SLOTS } from "@hooks/useChartPalette";

import * as R from "recharts";

const DESCRIPTION_ID = "association-category-progress-description";

const ROW_HEIGHT = 44;

const MIN_HEIGHT = 220;

export const AssociationCategoryChart = ({
  rows,
  label,
  palette,
}: TAssociationCategoryChart) => {
  const height = Math.max(MIN_HEIGHT, rows.length * ROW_HEIGHT);

  return (
    <div>
      <p id={DESCRIPTION_ID} className="sr-only">
        {label("categoryChartDescription")}
      </p>

      <div
        role="img"
        style={{ height }}
        aria-describedby={DESCRIPTION_ID}
        aria-label={label("categoryChartLabel")}
      >
        <R.ResponsiveContainer width="100%" height="100%">
          <R.BarChart layout="vertical" data={rows} margin={{ right: 16 }}>
            <R.CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <R.XAxis type="number" fontSize={12} allowDecimals={false} />
            <R.YAxis width={150} type="category" dataKey="name" fontSize={12} />
            <R.Tooltip cursor={{ opacity: 0.1 }} />
            <R.Legend />

            <R.Bar
              radius={[0, 8, 8, 0]}
              dataKey="requiredCredits"
              name={label("categoryRequired")}
              fill={palette[CHART_SEMANTIC_SLOTS.notStarted]}
            />

            <R.Bar
              radius={[0, 8, 8, 0]}
              dataKey="completedCredits"
              name={label("categoryCompleted")}
              fill={palette[CHART_SEMANTIC_SLOTS.onTrack]}
            />
          </R.BarChart>
        </R.ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>{label("categoryChartLabel")}</caption>

        <thead>
          <tr>
            <th scope="col">{label("categoryName")}</th>
            <th scope="col">{label("categoryRequirement")}</th>
            <th scope="col">{label("categoryCompleted")}</th>
            <th scope="col">{label("categoryRequired")}</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">{row.name}</th>
              <td>{row.requirementName}</td>
              <td>{row.completedCredits}</td>
              <td>{row.requiredCredits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssociationCategoryChart;
