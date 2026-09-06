"use client";

import { GlassCard } from "@elements/glass-card";
import { siteLinks } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Role } from "@/lib/graphql/base";

import AuthFeaturePanel from "@modules/Auth/parts/AuthFeaturePanel";
import AuthPageShell from "@modules/Auth/parts/AuthPageSell";
import RoleLoginForm from "@modules/Auth/RoleLoginForm";
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
          <GlassCard className="h-fit w-full max-w-md self-start">
            <div className="relative z-10 space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <L.Users className="h-7 w-7" />
                </div>

                <h1 className="mt-4 text-2xl font-black tracking-tight">
                  {t("authPages.association.loginTitle")}
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                  {t("authPages.association.loginDescription")}
                </p>
              </div>

              <RoleLoginForm role={Role.Association} />

              <p className="text-center text-sm text-muted-foreground">
                {t("authPages.association.partnerPrompt")}{" "}
                <Link
                  href={siteLinks.contact}
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {t("authPages.association.partnerLink")}
                </Link>
              </p>
            </div>
          </GlassCard>
        </div>

        <div className="order-1 lg:order-2">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="glass" radius="xl" className="flex-1">
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
