"use client";

import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { resolveAssociationTab } from "@utils/association-dashboard-tabs";
import { useSearchParams } from "next/navigation";

import dynamic from "next/dynamic";

const AssociationLearningContentTab = dynamic(
  () => import("@modules/AssociationDashboard/AssociationLearningContentTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const AssociationRequirementsTab = dynamic(
  () => import("@modules/AssociationDashboard/AssociationRequirementsTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const AssociationOverviewTab = dynamic(
  () => import("@modules/AssociationDashboard/AssociationOverviewTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const AssociationSettingsTab = dynamic(
  () => import("@modules/AssociationDashboard/AssociationSettingsTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const AssociationMessagesTab = dynamic(
  () => import("@modules/AssociationDashboard/AssociationMessagesTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const AssociationMembersTab = dynamic(
  () => import("@modules/AssociationDashboard/AssociationMembersTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const AssociationReportsTab = dynamic(
  () => import("@modules/AssociationDashboard/AssociationReportsTab"),
  { loading: () => <DashboardContentSkeleton /> },
);

export const AssociationDashboardShell = () => {
  const searchParams = useSearchParams();
  const activeTab = resolveAssociationTab(searchParams?.get("tab"));

  if (activeTab === "members") return <AssociationMembersTab />;
  if (activeTab === "requirements") return <AssociationRequirementsTab />;
  if (activeTab === "learning-content")
    return <AssociationLearningContentTab />;
  if (activeTab === "reports") return <AssociationReportsTab />;
  if (activeTab === "messages") return <AssociationMessagesTab />;
  if (activeTab === "settings") return <AssociationSettingsTab />;
  return <AssociationOverviewTab />;
};
