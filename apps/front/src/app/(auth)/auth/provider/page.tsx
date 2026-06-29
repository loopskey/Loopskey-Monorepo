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
      <section className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center lg:justify-start">
          <RoleAuthCard
            loginRole={API.Role.Provider}
            registerRole={API.AuthRegisterRole.Provider}
          />
        </div>

        <div className="order-1 lg:order-1 flex flex-col">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="glass" radius="xl" className="flex-1">
              <Link href={siteLinks.login}>
                {t("authPages.provider.professionalLink")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

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
