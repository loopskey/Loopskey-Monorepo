"use client";

import { DASHBOARD_MENU_BUTTON_ID } from "@utils/constant";
import { OVERLAY_LAYER_CLASS } from "@ui/overlay-layer";
import { useDashboardDrawer } from "@/providers/dashboard-drawer-provider";
import { LanguageToggleBtn } from "@elements/language-switcher";
import { UserMenu } from "@layouts/parts/user-menu";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Logo } from "@layouts/parts/logo";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

export const DashboardTopBar = () => {
  const { t } = useI18n();
  const { isOpen, open } = useDashboardDrawer();

  return (
    <header
      className={cn(
        "sticky top-0 h-16 w-full shrink-0 border-b bg-background",
        OVERLAY_LAYER_CLASS.applicationChrome,
      )}
    >
      <div className="flex h-full items-center justify-between gap-3 pl-2 pr-4 sm:pr-6 lg:pl-0 lg:pr-8">
        <div className="flex min-w-0 items-center gap-1 lg:w-64 lg:shrink-0 lg:pl-6">
          <Button
            size="icon"
            type="button"
            radius="full"
            onClick={open}
            variant="ghost"
            aria-expanded={isOpen}
            id={DASHBOARD_MENU_BUTTON_ID}
            className="shrink-0 lg:hidden"
            aria-label={t("dashboardShell.openMenu")}
          >
            <L.Menu aria-hidden />
          </Button>
          <Logo />
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggleBtn />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
