"use client";

import { siteLinks } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import AssociationAuthCard from "@modules/Auth/AssociationAuthCard";
import AuthFeaturePanel from "@modules/Auth/parts/AuthFeaturePanel";
import AuthPageShell from "@modules/Auth/parts/AuthPageSell";
import Link from "next/link";

import * as L from "lucide-react";

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
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" radius="xl" className="flex-1">
              <Link href={siteLinks.login}>
                {t("authPages.association.professionalLink")}
                <L.ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <AuthFeaturePanel
            features={features}
            eyebrow={t("authPages.association.eyebrow")}
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
