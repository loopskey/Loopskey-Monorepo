"use client";

import { Skeleton } from "@ui/skeleton";

import dynamic from "next/dynamic";

export const chartSkeleton = () => (
  <Skeleton className="h-72 w-full rounded-md" />
);

export const GroupComplianceChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-report-charts"
    ).then((module) => module.GroupComplianceChart),
  { ssr: false, loading: chartSkeleton },
);

export const CategoryProgressChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-report-charts"
    ).then((module) => module.CategoryProgressChart),
  { ssr: false, loading: chartSkeleton },
);

export const MemberDistributionChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-report-charts"
    ).then((module) => module.MemberDistributionChart),
  { ssr: false, loading: chartSkeleton },
);

export const ComplianceTrendChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-report-charts"
    ).then((module) => module.ComplianceTrendChart),
  { ssr: false, loading: chartSkeleton },
);
