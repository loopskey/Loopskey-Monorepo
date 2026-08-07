"use client";

import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { TProviderDashboardTab } from "@/types/provider-dashboard.types";
import { useSearchParams } from "next/navigation";

import dynamic from "next/dynamic";

const ProviderPromotionRequestsTab = dynamic(
  () => import("@modules/ProviderDashboard/ProviderPromotionRequestsTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProviderCreateEventTab = dynamic(
  () => import("@modules/ProviderDashboard/ProviderCreateEventTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProviderAttendeesTab = dynamic(
  () => import("@modules/ProviderDashboard/ProviderAttendeesTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProviderAnalyticsTab = dynamic(
  () => import("@modules/ProviderDashboard/ProviderAnalyticsTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProviderSettingsTab = dynamic(
  () => import("@modules/ProviderDashboard/ProviderSettingsTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProviderOverviewTab = dynamic(
  () => import("@modules/ProviderDashboard/ProviderOverviewTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProviderMyEventsTab = dynamic(
  () => import("@modules/ProviderDashboard/ProviderMyEventsTab"),
  { loading: () => <DashboardContentSkeleton /> },
);

const validTabs: TProviderDashboardTab[] = [
  "overview",
  "my-goals",
  "settings",
  "analytics",
  "attendees",
  "my-events",
  "create-event",
  "promotion-requests",
];

export const ProviderDashboardShell = () => {
  const searchParams = useSearchParams();

  const tabParam = searchParams?.get("tab") as TProviderDashboardTab | null;

  const activeTab: TProviderDashboardTab =
    tabParam && validTabs.includes(tabParam) ? tabParam : "overview";

  if (activeTab === "promotion-requests")
    return <ProviderPromotionRequestsTab />;
  if (activeTab === "my-events") return <ProviderMyEventsTab />;
  if (activeTab === "attendees") return <ProviderAttendeesTab />;
  if (activeTab === "create-event") return <ProviderCreateEventTab />;
  if (activeTab === "analytics") return <ProviderAnalyticsTab />;
  if (activeTab === "settings") return <ProviderSettingsTab />;
  if (activeTab === "overview") return <ProviderOverviewTab />;

  return (
    <div className="rounded-[2rem] border border-glass-border bg-background/60 p-8 backdrop-blur-xl">
      Provider tab: {activeTab}
    </div>
  );
};
