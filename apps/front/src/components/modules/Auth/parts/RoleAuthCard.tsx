"use client";

import { TRoleAuthCardProps } from "@/types/auth-module.types";
import { GlassCard } from "@elements/glass-card";
import { useState } from "react";

import SocialAuthButtons from "@modules/Auth/parts/SocialAuthBtns";
import RoleRegisterForm from "@modules/Auth/RoleRegisterForm";
import RoleLoginForm from "@modules/Auth/RoleLoginForm";
import AuthFlipCard from "@modules/Auth/parts/AuthFlipCard";
import AuthTabs from "@modules/Auth/parts/AuthTabs";

const RoleAuthCard = ({ loginRole, registerRole }: TRoleAuthCardProps) => {
  const [active, setActive] = useState<"register" | "login">("register");

  return (
    <GlassCard className="w-full max-w-md">
      <div className="relative z-10 space-y-6">
        <AuthTabs active={active} onChange={(value) => setActive(value)} />

        <AuthFlipCard
          flipped={active === "login"}
          front={
            <div className="space-y-5">
              <RoleRegisterForm
                role={registerRole}
                onVerified={() => setActive("login")}
              />

              <SocialAuthButtons role={loginRole} />
            </div>
          }
          back={<RoleLoginForm role={loginRole} />}
        />
      </div>
    </GlassCard>
  );
};

export default RoleAuthCard;
