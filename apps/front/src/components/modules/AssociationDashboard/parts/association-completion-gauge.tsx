"use client";

import { TAssociationCompletionGauge } from "@/types/association-dashboard.types";

import * as R from "recharts";

const DESCRIPTION_ID = "association-completion-gauge-description";

const round = (value: number) => Math.round(value * 10) / 10;

export const AssociationCompletionGauge = ({
  color,
  label,
  percent,
  paceColor,
  pacePercent,
}: TAssociationCompletionGauge) => {
  const rows = [
    ...(pacePercent === null
      ? []
      : [{ name: "pace", value: Math.min(100, pacePercent), fill: paceColor }]),
    { name: "completion", value: Math.min(100, percent), fill: color },
  ];

  return (
    <div>
      <p id={DESCRIPTION_ID} className="sr-only">
        {label("gaugeDescription")}
      </p>

      <div
        role="img"
        className="relative h-52"
        aria-describedby={DESCRIPTION_ID}
        aria-label={label("gaugeLabel")}
      >
        <R.ResponsiveContainer width="100%" height="100%">
          <R.RadialBarChart
            data={rows}
            endAngle={-270}
            startAngle={90}
            innerRadius="55%"
            outerRadius="100%"
            barCategoryGap="20%"
          >
            <R.PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <R.RadialBar dataKey="value" background cornerRadius={12} />
          </R.RadialBarChart>
        </R.ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold">{round(percent)}%</span>
          <span className="text-xs text-muted-foreground">
            {label("gaugeCaption")}
          </span>
        </div>
      </div>

      <table className="sr-only">
        <caption>{label("gaugeCaption")}</caption>
        <tbody>
          <tr>
            <th scope="row">{label("gaugeCompletion")}</th>
            <td>{round(percent)}%</td>
          </tr>
          {pacePercent !== null && (
            <tr>
              <th scope="row">{label("gaugePace")}</th>
              <td>{round(pacePercent)}%</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssociationCompletionGauge;
