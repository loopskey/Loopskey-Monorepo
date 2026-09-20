"use client";

import { GlassCard } from "@elements/glass-card";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Role } from "@/lib/graphql/base";

import AssociationAccessRequestForm from "@modules/Auth/AssociationAccessForm";
import RoleLoginForm from "@modules/Auth/RoleLoginForm";
import AuthFlipCard from "@modules/Auth/parts/AuthFlipCard";

const AssociationAuthCard = () => {
  const { t } = useI18n();
  const [active, setActive] = useState<"request" | "login">("request");

  return (
    <GlassCard className="w-full max-w-xl p-4 md:p-4">
      <div className="relative z-10 space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-md border border-border/70 bg-muted p-1">
          <Button
            radius="xl"
            type="button"
            onClick={() => setActive("request")}
            variant={active === "request" ? "default" : "ghost"}
          >
            {t("authPages.association.requestTab")}
          </Button>

          <Button
            radius="xl"
            type="button"
            onClick={() => setActive("login")}
            variant={active === "login" ? "default" : "ghost"}
          >
            {t("authPages.association.loginTab")}
          </Button>
        </div>

        <AuthFlipCard
          flipped={active === "login"}
          front={<AssociationAccessRequestForm />}
          back={<RoleLoginForm role={Role.Association} />}
        />
      </div>
    </GlassCard>
  );
};

export default AssociationAuthCard;
