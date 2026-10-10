"use client";

import { useI18n } from "@/hooks/useI18n";

import AssociationAuthCard from "@modules/Auth/AssociationAuthCard";
import AuthFeaturePanel from "@modules/Auth/parts/AuthFeaturePanel";
import AuthPageShell from "@modules/Auth/parts/AuthPageSell";

const AssociationAuthPage = () => {
  const { t } = useI18n();

  const features = [
    {
      title: t("authPages.association.complianceTitle"),
      text: t("authPages.association.complianceText"),
    },
    {
      title: t("authPages.association.membersTitle"),
      text: t("authPages.association.membersText"),
    },
    {
      title: t("authPages.association.requirementsTitle"),
      text: t("authPages.association.requirementsText"),
    },
    {
      title: t("authPages.association.reportsTitle"),
      text: t("authPages.association.reportsText"),
    },
  ];

  return (
    <AuthPageShell>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex justify-center lg:justify-start">
          <AssociationAuthCard />
        </div>

        <div className="order-1 lg:order-2">
          <AuthFeaturePanel
            features={features}
            subtitle={t("authPages.association.subtitle")}
            joinedText={t("authPages.association.joined")}
            titleBrand={t("authPages.association.titleBrand")}
            titlePrefix={t("authPages.association.titlePrefix")}
          />
        </div>
      </section>
    </AuthPageShell>
  );
};

export default AssociationAuthPage;
