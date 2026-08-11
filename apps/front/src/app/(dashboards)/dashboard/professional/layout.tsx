import { ProfessionalOnboardingGate } from "@guards/professional-onboarding-gate";
import { ProfessionalRouteGuard } from "@guards/dashboard-route-guards";
import { ReactNode } from "react";

const ProfessionalDashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ProfessionalRouteGuard>
      <ProfessionalOnboardingGate>{children}</ProfessionalOnboardingGate>
    </ProfessionalRouteGuard>
  );
};

export default ProfessionalDashboardLayout;
