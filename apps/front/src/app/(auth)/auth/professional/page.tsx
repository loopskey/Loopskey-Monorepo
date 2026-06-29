"use client";

import { ArrowRight } from "lucide-react";
import { siteLinks } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import AuthFeaturePanel from "@modules/Auth/parts/AuthFeaturePanel";
import AuthPageShell from "@modules/Auth/parts/AuthPageSell";
import RoleAuthCard from "@modules/Auth/parts/RoleAuthCard";
import Link from "next/link";

import * as API from "@/lib/graphql/generated";

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
      <section className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center lg:justify-start">
          <RoleAuthCard
            loginRole={API.Role.Professional}
            registerRole={API.AuthRegisterRole.Professional}
          />
        </div>

        <div className="order-1 lg:order-2">
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="glass" radius="xl" className="flex-1">
              <Link href={siteLinks.providerAuth}>
                {t("authPages.professional.providerLink")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
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
