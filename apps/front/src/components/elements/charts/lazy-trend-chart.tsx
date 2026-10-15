"use client";

import { Skeleton } from "@ui/skeleton";

import dynamic from "next/dynamic";

export const LazyTrendChart = dynamic(
  () => import("@elements/charts/trend-chart"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
  },
);
