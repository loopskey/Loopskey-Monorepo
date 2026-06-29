"use client";

import { TTimePoint, TTopEventPoint } from "@/types/provider-dashboard.types";
import { TBreakdownPoint } from "@/types/provider-dashboard.types";
import { CHART_COLORS } from "@/utils/constant";

import * as R from "recharts";

export const ProviderRegistrationsOverTimeChart = ({
  data,
}: {
  data: TTimePoint[];
}) => {
  return (
    <R.ResponsiveContainer width="100%" height="100%">
      <R.AreaChart data={data}>
        <defs>
          <linearGradient
            id="providerRegistrationsGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <R.CartesianGrid strokeDasharray="3 3" opacity={0.18} />
        <R.XAxis dataKey="date" fontSize={11} />
        <R.YAxis fontSize={11} />
        <R.Tooltip />
        <R.Legend />

        <R.Area
          type="monotone"
          strokeWidth={3}
          stroke="#2563eb"
          dataKey="registrations"
          fill="url(#providerRegistrationsGradient)"
        />

        <R.Line
          dot={false}
          type="monotone"
          strokeWidth={3}
          dataKey="revenue"
          stroke="#14b8a6"
        />
      </R.AreaChart>
    </R.ResponsiveContainer>
  );
};

export const ProviderBreakdownBarChart = ({
  data,
  dataKey = "count",
}: {
  data: TBreakdownPoint[];
  dataKey?: "count" | "value";
}) => {
  return (
    <R.ResponsiveContainer width="100%" height="100%">
      <R.BarChart data={data}>
        <R.CartesianGrid strokeDasharray="3 3" opacity={0.18} />
        <R.XAxis dataKey="label" fontSize={11} />
        <R.YAxis fontSize={11} />
        <R.Tooltip />

        <R.Bar dataKey={dataKey} radius={[12, 12, 0, 0]}>
          {data.map((_, index) => (
            <R.Cell
              key={index}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </R.Bar>
      </R.BarChart>
    </R.ResponsiveContainer>
  );
};

export const ProviderEventTypePieChart = ({
  data,
}: {
  data: TBreakdownPoint[];
}) => {
  return (
    <R.ResponsiveContainer width="100%" height="100%">
      <R.PieChart>
        <R.Tooltip />
        <R.Legend />

        <R.Pie
          data={data}
          dataKey="count"
          nameKey="label"
          innerRadius={58}
          outerRadius={90}
          paddingAngle={4}
        >
          {data.map((_, index) => (
            <R.Cell
              key={index}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </R.Pie>
      </R.PieChart>
    </R.ResponsiveContainer>
  );
};

export const ProviderTopPerformingChart = ({
  data,
}: {
  data: TTopEventPoint[];
}) => {
  return (
    <R.ResponsiveContainer width="100%" height="100%">
      <R.BarChart data={data} layout="vertical">
        <R.CartesianGrid strokeDasharray="3 3" opacity={0.18} />
        <R.XAxis type="number" fontSize={11} />
        <R.YAxis
          type="category"
          dataKey="title"
          width={130}
          fontSize={11}
          tickFormatter={(value) =>
            String(value).length > 18
              ? `${String(value).slice(0, 18)}...`
              : value
          }
        />
        <R.Tooltip />

        <R.Bar dataKey="registrations" radius={[0, 12, 12, 0]}>
          {data.map((_, index) => (
            <R.Cell
              key={index}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </R.Bar>
      </R.BarChart>
    </R.ResponsiveContainer>
  );
};
