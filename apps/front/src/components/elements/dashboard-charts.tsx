"use client";

import { useChartPalette } from "@hooks/useChartPalette";

import * as T from "@/types/element.types";
import * as R from "recharts";

const AXIS_TICK = { fontSize: 12, fill: "var(--chart-axis)" } as const;

const TOOLTIP_STYLE = {
  border: "1px solid var(--border)",
  borderRadius: "8px",
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  boxShadow: "0 6px 18px -8px rgb(13 25 61 / 12%)",
} as const;

export const PduOverTimeChart = ({ data }: { data: T.TPduOverTimePoint[] }) => {
  const palette = useChartPalette();

  return (
    <R.ResponsiveContainer width="100%" height="100%">
      <R.AreaChart data={data}>
        <R.CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--chart-grid)"
          vertical={false}
        />
        <R.XAxis dataKey="month" tick={AXIS_TICK} stroke="var(--chart-grid)" />
        <R.YAxis tick={AXIS_TICK} stroke="var(--chart-grid)" />
        <R.Tooltip contentStyle={TOOLTIP_STYLE} />
        <R.Area
          dataKey="pdus"
          type="monotone"
          strokeWidth={2.5}
          stroke={palette[0]}
          fill={palette[0]}
          fillOpacity={0.1}
        />
      </R.AreaChart>
    </R.ResponsiveContainer>
  );
};

export const PduByCategoryChart = ({
  data,
}: {
  data: T.TPduCategoryPoint[];
}) => {
  const palette = useChartPalette();

  return (
    <R.ResponsiveContainer width="100%" height="100%">
      <R.BarChart data={data}>
        <R.CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--chart-grid)"
          vertical={false}
        />
        <R.XAxis
          dataKey="category"
          tick={{ ...AXIS_TICK, fontSize: 11 }}
          stroke="var(--chart-grid)"
        />
        <R.YAxis tick={AXIS_TICK} stroke="var(--chart-grid)" />
        <R.Tooltip contentStyle={TOOLTIP_STYLE} />
        <R.Bar dataKey="pdus" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <R.Cell
              key={entry.category}
              fill={entry.fill ?? palette[index % palette.length]}
            />
          ))}
        </R.Bar>
      </R.BarChart>
    </R.ResponsiveContainer>
  );
};

export const ProgressDonutChart = ({
  data,
  ariaLabel,
  centerLabel,
  valueSuffix,
}: T.TProgressDonutChart) => {
  const suffix = valueSuffix ? ` ${valueSuffix}` : "";
  return (
    <div role="img" aria-label={ariaLabel} className="relative h-52">
      <R.ResponsiveContainer width="100%" height="100%">
        <R.PieChart>
          <R.Pie
            cx="50%"
            cy="50%"
            data={data}
            dataKey="value"
            nameKey="label"
            stroke="none"
            innerRadius={62}
            outerRadius={90}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <R.Cell key={entry.name} fill={entry.fill} />
            ))}
          </R.Pie>
          <R.Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, name) => [`${value ?? 0}${suffix}`, name]}
          />
        </R.PieChart>
      </R.ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {centerLabel}
      </div>
    </div>
  );
};

export const GoalHalfPieChart = ({ data, progress }: T.TGoalHaphPie) => {
  return (
    <div className="relative h-56">
      <R.ResponsiveContainer width="100%" height="100%">
        <R.PieChart>
          <R.Pie
            cx="50%"
            cy="82%"
            data={data}
            endAngle={0}
            dataKey="value"
            startAngle={180}
            innerRadius={70}
            outerRadius={98}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <R.Cell key={entry.name} fill={entry.fill} />
            ))}
          </R.Pie>
        </R.PieChart>
      </R.ResponsiveContainer>
      <div className="absolute inset-x-0 bottom-2 text-center">
        <p className="text-4xl font-medium text-primary">{progress}%</p>
      </div>
    </div>
  );
};
