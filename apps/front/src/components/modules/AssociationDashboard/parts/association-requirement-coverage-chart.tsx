"use client";

import { TAssociationCoverageChart } from "@/types/association-dashboard.types";
import { semanticChartColor } from "@hooks/useChartPalette";
import { useId } from "react";

import * as R from "recharts";

export const AssociationRequirementCoverageChart = ({
  size,
  total,
  covered,
  palette,
  chartLabel,
  coveredLabel,
  uncoveredLabel,
  chartDescription,
}: TAssociationCoverageChart) => {
  const descriptionId = useId();
  const uncovered = Math.max(0, total - covered);
  const slices = [
    { name: coveredLabel, value: covered },
    { name: uncoveredLabel, value: uncovered },
  ];
  const colors = [
    semanticChartColor(palette, "onTrack"),
    semanticChartColor(palette, "notStarted"),
  ];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <p id={descriptionId} className="sr-only">
        {chartDescription}
      </p>

      <div
        role="img"
        className="h-full w-full"
        aria-label={chartLabel}
        aria-describedby={descriptionId}
      >
        <R.ResponsiveContainer width="100%" height="100%">
          <R.PieChart>
            <R.Pie
              data={slices}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
              innerRadius={size * 0.34}
              outerRadius={size * 0.48}
            >
              {slices.map((slice, index) => (
                <R.Cell key={slice.name} fill={colors[index]} />
              ))}
            </R.Pie>
          </R.PieChart>
        </R.ResponsiveContainer>
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium tabular-nums"
      >
        {covered}
      </span>

      <table className="sr-only">
        <tbody>
          {slices.map((slice) => (
            <tr key={slice.name}>
              <th scope="row">{slice.name}</th>
              <td>{slice.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssociationRequirementCoverageChart;
