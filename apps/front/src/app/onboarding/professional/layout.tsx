import { ProfessionalOnboardingEntryGuard } from "@guards/professional-onboarding-entry-guard";
import { ProfessionalRouteGuard } from "@guards/dashboard-route-guards";
import { FocusedTopBar } from "@layouts/parts/FocusedTopBar";
import { ReactNode } from "react";

const ProfessionalOnboardingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ProfessionalRouteGuard>
      <FocusedTopBar />
      <div className="min-h-[calc(100dvh-4rem)] bg-background px-4 py-6 md:px-6">
        <ProfessionalOnboardingEntryGuard>{children}</ProfessionalOnboardingEntryGuard>
      </div>
    </ProfessionalRouteGuard>
  );
};

export default ProfessionalOnboardingLayout;
