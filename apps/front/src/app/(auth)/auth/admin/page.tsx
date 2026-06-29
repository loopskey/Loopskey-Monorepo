"use client";

import { ShieldCheck } from "lucide-react";
import { GlassCard } from "@elements/glass-card";
import { siteLinks } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import AuthFeaturePanel from "@modules/Auth/parts/AuthFeaturePanel";
import RoleLoginForm from "@modules/Auth/RoleLoginForm";
import AuthPageShell from "@modules/Auth/parts/AuthPageSell";
import Link from "next/link";

import * as API from "@/lib/graphql/generated";
import * as L from "lucide-react";

const AdminAuthPage = () => {
  const { t } = useI18n();

  const features = [
    {
      title: t("authPages.admin.secureTitle"),
      text: t("authPages.admin.secureText"),
    },
    {
      title: t("authPages.admin.usersTitle"),
      text: t("authPages.admin.usersText"),
    },
    {
      title: t("authPages.admin.requestsTitle"),
      text: t("authPages.admin.requestsText"),
    },
    {
      title: t("authPages.admin.settingsTitle"),
      text: t("authPages.admin.settingsText"),
    },
  ];

  return (
    <AuthPageShell>
      <section className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center lg:justify-start">
          <GlassCard className="h-fit w-full max-w-md self-start">
            <div className="relative z-10 space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-7 w-7" />
                </div>

                <h1 className="mt-4 text-2xl font-black tracking-tight">
                  {t("authPages.admin.loginTitle")}
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                  {t("authPages.admin.loginDescription")}
                </p>
              </div>

              <RoleLoginForm role={API.Role.Admin} />
            </div>
          </GlassCard>
        </div>

        <div className="order-1 lg:order-2">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="glass" radius="xl" className="flex-1">
              <Link href={siteLinks.login}>
                {t("authPages.admin.professionalLink")}
                <L.ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <AuthFeaturePanel
            features={features}
            eyebrow={t("authPages.admin.eyebrow")}
            subtitle={t("authPages.admin.subtitle")}
            joinedText={t("authPages.admin.joined")}
            titleBrand={t("authPages.admin.titleBrand")}
            titlePrefix={t("authPages.admin.titlePrefix")}
          />
        </div>
      </section>
    </AuthPageShell>
  );
};

export default AdminAuthPage;
