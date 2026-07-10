"use client";

import { TProfessionalDashboardTab } from "@/types/professional-dashboard.types";
import { useSearchParams } from "next/navigation";

import ProfessionalExternalLearningTab from "@modules/ProfessionalDashboard/ProfessionalExternalLearningTab";
import ProfessionalCpdPduTrackerTab from "@modules/ProfessionalDashboard/ProfessionalCpdPduTrackerTab";
import ProfessionalCertificatesTab from "@modules/ProfessionalDashboard/ProfessionalCertificatesTab";
import ProfessionalAddActivityTab from "@modules/ProfessionalDashboard/ProfessionalAddActivityTab";
import ProfessionalOverviewTab from "@modules/ProfessionalDashboard/ProfessionalOverviewTab";
import ProfessionalCalendarTab from "@modules/ProfessionalDashboard/ProfessionalCalendarTab";
import ProfessionalWishlistTab from "@modules/ProfessionalDashboard/ProfessionalWishlistTab";
import ProfessionalSettingsTab from "@modules/ProfessionalDashboard/ProfessionalSettingsTab";
import ProfessionalPaymentsTab from "@modules/ProfessionalDashboard/ProfessionalPaymentsTab";
import ProfessionalCoursesTab from "@modules/ProfessionalDashboard/ProfessionalCoursesTab";
import ProfessionalRoadmapTab from "@modules/ProfessionalDashboard/ProfessionalRoadmapTab";
import ProfessionalProfileTab from "@modules/ProfessionalDashboard/ProfessionalProfileTab";

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
  "cpd-pdu-tracker",
  "add-activity",
  "certificates",
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
  if (activeTab === "payments") return <ProfessionalPaymentsTab />;
  // "pdu-report" is the legacy slug kept so existing bookmarks keep working.
  if (activeTab === "cpd-pdu-tracker" || activeTab === "pdu-report")
    return <ProfessionalCpdPduTrackerTab />;
  if (activeTab === "add-activity") return <ProfessionalAddActivityTab />;
  if (activeTab === "wishlist") return <ProfessionalWishlistTab />;
  if (activeTab === "settings") return <ProfessionalSettingsTab />;

  return <ProfessionalOverviewTab />;
};
