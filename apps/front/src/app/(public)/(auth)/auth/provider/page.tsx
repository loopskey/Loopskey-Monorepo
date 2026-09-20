"use client";

import { AuthRegisterRole, Role } from "@/lib/graphql/base";
import { useI18n } from "@/hooks/useI18n";

import AuthFeaturePanel from "@modules/Auth/parts/AuthFeaturePanel";
import AuthPageShell from "@modules/Auth/parts/AuthPageSell";
import RoleAuthCard from "@modules/Auth/parts/RoleAuthCard";

const ProviderAuthPage = () => {
  const { t } = useI18n();

  const features = [
    {
      title: t("authPages.provider.createTitle"),
      text: t("authPages.provider.createText"),
    },
    {
      title: t("authPages.provider.liveTitle"),
      text: t("authPages.provider.liveText"),
    },
    {
      title: t("authPages.provider.analyticsTitle"),
      text: t("authPages.provider.analyticsText"),
    },
    {
      title: t("authPages.provider.accreditationTitle"),
      text: t("authPages.provider.accreditationText"),
    },
  ];

  return (
    <AuthPageShell>
      <section className="mx-auto grid max-w-7xl items-center gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex justify-center lg:justify-start">
          <RoleAuthCard
            loginRole={Role.Provider}
            registerRole={AuthRegisterRole.Provider}
          />
        </div>

        <div className="order-1 flex flex-col lg:order-2">
          <AuthFeaturePanel
            features={features}
            eyebrow={t("authPages.provider.eyebrow")}
            joinedText={t("authPages.provider.joined")}
            titleBrand={t("authPages.provider.titleBrand")}
            titlePrefix={t("authPages.provider.titlePrefix")}
          />
        </div>
      </section>
    </AuthPageShell>
  );
};

export default ProviderAuthPage;
