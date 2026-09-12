"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { legacyAssociationTabAlias } from "@utils/association-dashboard-tabs";
import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { resolveAssociationTab } from "@utils/association-dashboard-tabs";
import { useEffect } from "react";

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
const AssociationMemberDetailView = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-member-detail-view"
    ),
  { loading: () => <DashboardContentSkeleton /> },
);

export const AssociationDashboardShell = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams?.get("tab") ?? null;
  const activeTab = resolveAssociationTab(rawTab);
  const memberId = searchParams?.get("memberId");

  useEffect(() => {
    if (!legacyAssociationTabAlias(rawTab)) return;

    const next = new URLSearchParams(searchParams?.toString());
    next.set("tab", activeTab);
    router.replace(`${pathname}?${next.toString()}`);
  }, [rawTab, activeTab, pathname, router, searchParams]);

  if (activeTab === "members")
    return memberId ? (
      <AssociationMemberDetailView memberId={memberId} />
    ) : (
      <AssociationMembersTab />
    );
  if (activeTab === "requirements") return <AssociationRequirementsTab />;
  if (activeTab === "learning-content")
    return <AssociationLearningContentTab />;
  if (activeTab === "reports") return <AssociationReportsTab />;
  if (activeTab === "notifications") return <AssociationMessagesTab />;
  if (activeTab === "settings") return <AssociationSettingsTab />;
  return <AssociationOverviewTab />;
};
