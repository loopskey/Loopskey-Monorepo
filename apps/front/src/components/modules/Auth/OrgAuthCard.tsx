"use client";

import { GlassCard } from "@elements/glass-card";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Role } from "@/lib/graphql/generated";

import OrgAccessRequestForm from "@modules/Auth/OrgAccessForm";
import RoleLoginForm from "@modules/Auth/RoleLoginForm";
import AuthFlipCard from "@modules/Auth/parts/AuthFlipCard";

const OrgAuthCard = () => {
  const { t } = useI18n();
  const [active, setActive] = useState<"request" | "login">("request");

  return (
    <GlassCard className="w-full max-w-xl">
      <div className="relative z-10 space-y-6">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border/70 bg-background/45 p-1 backdrop-blur-xl">
          <Button
            radius="xl"
            type="button"
            onClick={() => setActive("request")}
            variant={active === "request" ? "brand" : "ghost"}
          >
            {t("authPages.organization.requestTab")}
          </Button>

          <Button
            radius="xl"
            type="button"
            onClick={() => setActive("login")}
            variant={active === "login" ? "brand" : "ghost"}
          >
            {t("authPages.organization.loginTab")}
          </Button>
        </div>

        <AuthFlipCard
          flipped={active === "login"}
          front={<OrgAccessRequestForm />}
          back={<RoleLoginForm role={Role.Organization} />}
        />
      </div>
    </GlassCard>
  );
};

export default OrgAuthCard;
