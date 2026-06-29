"use client";

import { TProviderDashboardTab } from "@/types/provider-dashboard.types";
import { useSearchParams } from "next/navigation";

import ProviderPromotionRequestsTab from "@modules/ProviderDashboard/ProviderPromotionRequestsTab";
import ProviderCreateEventTab from "@modules/ProviderDashboard/ProviderCreateEventTab";
import ProviderAttendeesTab from "@modules/ProviderDashboard/ProviderAttendeesTab";
import ProviderAnalyticsTab from "@modules/ProviderDashboard/ProviderAnalyticsTab";
import ProviderSettingsTab from "@modules/ProviderDashboard/ProviderSettingsTab";
import ProviderOverviewTab from "@modules/ProviderDashboard/ProviderOverviewTab";
import ProviderMyEventsTab from "@modules/ProviderDashboard/ProviderMyEventsTab";

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
