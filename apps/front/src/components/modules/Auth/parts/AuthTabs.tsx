"use client";

import { TAuthTabsProps } from "@/types/auth-module.types";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

const AuthTabs = ({ active, onChange }: TAuthTabsProps) => {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-2 gap-2 rounded-md border border-border/70 bg-muted p-1">
      <Button
        radius="xl"
        type="button"
        variant={active === "register" ? "brand" : "ghost"}
        className={cn(active !== "register" && "text-muted-foreground")}
        onClick={() => onChange("register")}
      >
        {t("authPages.common.register")}
      </Button>

      <Button
        radius="xl"
        type="button"
        variant={active === "login" ? "brand" : "ghost"}
        className={cn(active !== "login" && "text-muted-foreground")}
        onClick={() => onChange("login")}
      >
        {t("authPages.common.login")}
      </Button>
    </div>
  );
};

export default AuthTabs;
