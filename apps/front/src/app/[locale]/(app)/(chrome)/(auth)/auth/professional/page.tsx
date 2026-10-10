"use client";

import { AuthRegisterRole, Role } from "@/lib/graphql/base";
import { useI18n } from "@/hooks/useI18n";

import AuthFeaturePanel from "@modules/Auth/parts/AuthFeaturePanel";
import AuthPageShell from "@modules/Auth/parts/AuthPageSell";
import RoleAuthCard from "@modules/Auth/parts/RoleAuthCard";

const ProfessionalAuthPage = () => {
  const { t } = useI18n();

  const features = [
    {
      title: t("authPages.professional.secureTitle"),
      text: t("authPages.professional.secureText"),
    },
    {
      title: t("authPages.professional.onboardingTitle"),
      text: t("authPages.professional.onboardingText"),
    },
    {
      title: t("authPages.professional.cpdTitle"),
      text: t("authPages.professional.cpdText"),
    },
    {
      title: t("authPages.professional.teamsTitle"),
      text: t("authPages.professional.teamsText"),
    },
  ];

  return (
    <AuthPageShell>
      <section className="mx-auto grid max-w-7xl items-center gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex justify-center lg:justify-start">
          <RoleAuthCard
            loginRole={Role.Professional}
            registerRole={AuthRegisterRole.Professional}
          />
        </div>

        <div className="order-1 lg:order-2">
          <AuthFeaturePanel
            features={features}
            subtitle={t("authPages.professional.subtitle")}
            joinedText={t("authPages.professional.joined")}
            titleBrand={t("authPages.professional.titleBrand")}
            titlePrefix={t("authPages.professional.titlePrefix")}
          />
        </div>
      </section>
    </AuthPageShell>
  );
};

export default ProfessionalAuthPage;
