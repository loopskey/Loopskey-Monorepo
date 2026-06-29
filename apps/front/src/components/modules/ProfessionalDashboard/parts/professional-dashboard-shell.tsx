"use client";

import { TProfessionalDashboardTab } from "@/types/professional-dashboard.types";
import { useSearchParams } from "next/navigation";

import ProfessionalExternalLearningTab from "@modules/ProfessionalDashboard/ProfessionalExternalLearningTab";
import ProfessionalCertificatesTab from "@modules/ProfessionalDashboard/ProfessionalCertificatesTab";
import ProfessionalPduReportTab from "@modules/ProfessionalDashboard/ProfessionalPduTab";
import ProfessionalOverviewTab from "@modules/ProfessionalDashboard/ProfessionalOverviewTab";
import ProfessionalCalendarTab from "@modules/ProfessionalDashboard/ProfessionalCalendarTab";
import ProfessionalWishlistTab from "@modules/ProfessionalDashboard/ProfessionalWishlistTab";
import ProfessionalSettingsTab from "@modules/ProfessionalDashboard/ProfessionalSettingsTab";
import ProfessionalPaymentsTab from "@modules/ProfessionalDashboard/ProfessionalPaymentsTab";
import ProfessionalCoursesTab from "@modules/ProfessionalDashboard/ProfessionalCoursesTab";
import ProfessionalRoadmapTab from "@modules/ProfessionalDashboard/ProfessionalRoadmapTab";

const validTabs: TProfessionalDashboardTab[] = [
  "courses",
  "roadmap",
  "payments",
  "overview",
  "calendar",
  "settings",
  "wishlist",
  "pdu-report",
  "certificates",
  "external-learning",
];

export const ProfessionalDashboardShell = () => {
  const searchParams = useSearchParams();

  const tabParam = searchParams?.get("tab") as TProfessionalDashboardTab | null;
  const activeTab =
    tabParam && validTabs.includes(tabParam) ? tabParam : "overview";

  if (activeTab === "calendar") return <ProfessionalCalendarTab />;
  if (activeTab === "courses") return <ProfessionalCoursesTab />;
  if (activeTab === "roadmap") return <ProfessionalRoadmapTab />;
  if (activeTab === "external-learning")
    return <ProfessionalExternalLearningTab />;
  if (activeTab === "certificates") return <ProfessionalCertificatesTab />;
  if (activeTab === "payments") return <ProfessionalPaymentsTab />;
  if (activeTab === "pdu-report") return <ProfessionalPduReportTab />;
  if (activeTab === "wishlist") return <ProfessionalWishlistTab />;
  if (activeTab === "settings") return <ProfessionalSettingsTab />;

  return <ProfessionalOverviewTab />;
};
