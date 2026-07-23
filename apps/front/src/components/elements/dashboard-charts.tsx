"use client";

import * as T from "@/types/element.types";
import * as R from "recharts";

export const PduOverTimeChart = ({ data }: { data: T.TPduOverTimePoint[] }) => {
  return (
    <R.ResponsiveContainer width="100%" height="100%">
      <R.AreaChart data={data}>
        <defs>
          <linearGradient id="pduOverTimeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.04} />
          </linearGradient>
        </defs>

        <R.CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <R.XAxis dataKey="month" fontSize={12} />
        <R.YAxis fontSize={12} />
        <R.Tooltip />
        <R.Area
          dataKey="pdus"
          type="monotone"
          strokeWidth={3}
          stroke="#2563eb"
          fill="url(#pduOverTimeGradient)"
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
  return (
    <R.ResponsiveContainer width="100%" height="100%">
      <R.BarChart data={data}>
        <R.CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <R.XAxis dataKey="category" fontSize={11} />
        <R.YAxis fontSize={12} />
        <R.Tooltip />
        <R.Bar dataKey="pdus" radius={[12, 12, 0, 0]}>
          {data.map((entry) => (
            <R.Cell key={entry.category} fill={entry.fill} />
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
