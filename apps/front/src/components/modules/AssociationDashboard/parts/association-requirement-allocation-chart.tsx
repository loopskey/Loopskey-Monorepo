"use client";

import { TAssociationAllocationChart } from "@/types/association-dashboard.types";
import { allocationChartRow } from "@utils/association-requirement";
import { semanticChartColor } from "@hooks/useChartPalette";

import * as R from "recharts";

const DESCRIPTION_ID = "association-category-allocation-description";

export const AssociationRequirementAllocationChart = ({
  palette,
  allocation,
  chartLabel,
  segmentHeader,
  creditsHeader,
  chartDescription,
}: TAssociationAllocationChart) => {
  const row = allocationChartRow(allocation);
  const remainderColor = semanticChartColor(palette, "notStarted");

  return (
    <div>
      <p id={DESCRIPTION_ID} className="sr-only">
        {chartDescription}
      </p>

      <div
        role="img"
        className="h-16"
        aria-label={chartLabel}
        aria-describedby={DESCRIPTION_ID}
      >
        <R.ResponsiveContainer width="100%" height="100%">
          <R.BarChart layout="vertical" data={[row]} margin={{ left: 0 }}>
            <R.XAxis type="number" hide domain={[0, "dataMax"]} />
            <R.YAxis type="category" hide />
            <R.Tooltip cursor={{ opacity: 0.1 }} />

            {allocation.segments.map((segment, index) => (
              <R.Bar
                key={segment.id}
                name={segment.name}
                dataKey={segment.id}
                stackId="allocation"
                isAnimationActive={false}
                fill={segment.isRemainder ? remainderColor : palette[index % 8]}
              />
            ))}
          </R.BarChart>
        </R.ResponsiveContainer>
      </div>

      <table className="sr-only">
        <thead>
          <tr>
            <th scope="col">{segmentHeader}</th>
            <th scope="col">{creditsHeader}</th>
          </tr>
        </thead>

        <tbody>
          {allocation.segments.map((segment) => (
            <tr key={segment.id}>
              <th scope="row">{segment.name}</th>
              <td>{segment.credits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssociationRequirementAllocationChart;
