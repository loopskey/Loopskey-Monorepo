import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";

import dynamic from "next/dynamic";

const ProfessionalOnboardingWizard = dynamic(
  () => import("@modules/ProfessionalOnboarding/ProfessionalOnboardingWizard"),
  { loading: () => <DashboardContentSkeleton /> },
);

const ProfessionalOnboardingPage = () => {
  return <ProfessionalOnboardingWizard />;
};

export default ProfessionalOnboardingPage;
