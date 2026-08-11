"use client";

import { TProfessionalDashboardTab } from "@/types/professional-dashboard.types";
import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { useSearchParams } from "next/navigation";

import dynamic from "next/dynamic";

const ProfessionalActivityDetailTab = dynamic(
  () => import("@modules/ProfessionalDashboard/ProfessionalActivityDetailTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProfessionalExternalLearningTab = dynamic(
  () =>
    import("@modules/ProfessionalDashboard/ProfessionalExternalLearningTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProfessionalCpdPduProgressTab = dynamic(
  () => import("@modules/ProfessionalDashboard/ProfessionalCpdPduProgressTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProfessionalCpdPduTrackerTab = dynamic(
  () => import("@modules/ProfessionalDashboard/ProfessionalCpdPduTrackerTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProfessionalCertificateFormTab = dynamic(
  () => import("@modules/ProfessionalDashboard/ProfessionalCertificateFormTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProfessionalCertificatesTab = dynamic(
  () => import("@modules/ProfessionalDashboard/ProfessionalCertificatesTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProfessionalAddActivityTab = dynamic(
  () => import("@modules/ProfessionalDashboard/ProfessionalAddActivityTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProfessionalOverviewTab = dynamic(
  () => import("@modules/ProfessionalDashboard/ProfessionalOverviewTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProfessionalCalendarTab = dynamic(
  () => import("@modules/ProfessionalDashboard/ProfessionalCalendarTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProfessionalWishlistTab = dynamic(
  () => import("@modules/ProfessionalDashboard/ProfessionalWishlistTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProfessionalSettingsTab = dynamic(
  () => import("@modules/ProfessionalDashboard/ProfessionalSettingsTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProfessionalPaymentsTab = dynamic(
  () => import("@modules/ProfessionalDashboard/ProfessionalPaymentsTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProfessionalCoursesTab = dynamic(
  () => import("@modules/ProfessionalDashboard/ProfessionalCoursesTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProfessionalRoadmapTab = dynamic(
  () => import("@modules/ProfessionalDashboard/ProfessionalRoadmapTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const ProfessionalProfileTab = dynamic(
  () => import("@modules/ProfessionalDashboard/ProfessionalProfileTab"),
  { loading: () => <DashboardContentSkeleton /> },
);

const validTabs: TProfessionalDashboardTab[] = [
  "profile",
  "courses",
  "roadmap",
  "overview",
  "calendar",
  "wishlist",
  "settings",
  "payments",
  "pdu-report",
  "add-activity",
  "certificates",
  "certificate-form",
  "cpd-pdu-tracker",
  "cpd-pdu-progress",
  "activity-detail",
  "external-learning",
];

export const ProfessionalDashboardShell = () => {
  const searchParams = useSearchParams();

  const tabParam = searchParams?.get("tab") as TProfessionalDashboardTab | null;

  const activeTab =
    tabParam && validTabs.includes(tabParam) ? tabParam : "overview";

  if (activeTab === "profile") return <ProfessionalProfileTab />;
  if (activeTab === "calendar") return <ProfessionalCalendarTab />;
  if (activeTab === "courses") return <ProfessionalCoursesTab />;
  if (activeTab === "roadmap") return <ProfessionalRoadmapTab />;
  if (activeTab === "external-learning")
    return <ProfessionalExternalLearningTab />;
  if (activeTab === "certificates") return <ProfessionalCertificatesTab />;
  if (activeTab === "certificate-form")
    return <ProfessionalCertificateFormTab />;
  if (activeTab === "payments") return <ProfessionalPaymentsTab />;
  if (activeTab === "cpd-pdu-tracker" || activeTab === "pdu-report")
    return <ProfessionalCpdPduTrackerTab />;
  if (activeTab === "cpd-pdu-progress")
    return <ProfessionalCpdPduProgressTab />;
  if (activeTab === "activity-detail") return <ProfessionalActivityDetailTab />;
  if (activeTab === "add-activity") return <ProfessionalAddActivityTab />;
  if (activeTab === "wishlist") return <ProfessionalWishlistTab />;
  if (activeTab === "settings") return <ProfessionalSettingsTab />;

  return <ProfessionalOverviewTab />;
};
