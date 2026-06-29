"use client";

import { GlassCard } from "@elements/glass-card";
import { siteLinks } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import AuthPageShell from "@modules/Auth/parts/AuthPageSell";
import OrgAuthCard from "@modules/Auth/OrgAuthCard";
import Link from "next/link";

import * as L from "lucide-react";

const OrgAuthPage = () => {
  const { t } = useI18n();

  const authPageLink = [
    {
      icon: L.Building2,
      title: "Centralized CPD",
      text: "Manage professional development and compliance for your organization.",
    },
    {
      icon: L.UsersRound,
      title: "Member visibility",
      text: "Track members, progress, evidence, and activity history.",
    },
    {
      icon: L.ShieldCheck,
      title: "Admin approval",
      text: "Access is reviewed before credentials are generated.",
    },
  ];

  return (
    <AuthPageShell>
      <section className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
            LoopsKey for organizations
          </p>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-5xl lg:text-4xl">
            {t("authPages.organization.title")}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
            {t("authPages.organization.subtitle")}
          </p>

          <div className="mt-8 grid gap-4">
            {authPageLink.map((item) => {
              const Icon = item.icon;
              return (
                <GlassCard key={item.title} className="p-5" glow={false}>
                  <div className="relative z-10 flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
          <Button asChild variant="glass" radius="xl" className="mt-6">
            <Link href={siteLinks.login}>
              {t("authPages.organization.professionalLink")}
              <L.ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <OrgAuthCard />
      </section>
    </AuthPageShell>
  );
};

export default OrgAuthPage;
