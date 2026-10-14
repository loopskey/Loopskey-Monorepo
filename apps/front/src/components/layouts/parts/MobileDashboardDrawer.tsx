"use client";

import { DASHBOARD_MENU_BUTTON_ID, siteLinks } from "@utils/constant";
import { useDashboardDrawer } from "@/providers/dashboard-drawer-provider";
import { useEffect, useRef } from "react";
import { DashboardNavList } from "@layouts/parts/DashboardNavList";
import { useDashboardNav } from "@/hooks/useDashboardNav";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Logo } from "@layouts/parts/logo";
import { cn } from "@/lib/utils";

import Link from "next/link";

import * as L from "lucide-react";

export const MobileDashboardDrawer = () => {
  const { t } = useI18n();
  const { role, tabs, activeTab, isReady } = useDashboardNav();
  const { isOpen, close } = useDashboardDrawer();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      const timer = window.setTimeout(() => closeButtonRef.current?.focus());
      return () => window.clearTimeout(timer);
    }
    if (wasOpenRef.current)
      document.getElementById(DASHBOARD_MENU_BUTTON_ID)?.focus();
    wasOpenRef.current = false;
  }, [isOpen]);

  if (!isReady || !role) return null;

  return (
    <aside
      inert={!isOpen}
      aria-hidden={!isOpen}
      aria-label={t("dashboardShell.navLabel")}
      className={cn(
        "fixed inset-y-0 left-0 flex w-[280px] flex-col bg-primary text-primary-foreground transition-transform duration-300 ease-out motion-reduce:transition-none lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-6",
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-primary-foreground/15 pl-4 pr-2">
        <Logo variant="onPrimary" />
        <Button
          size="icon"
          type="button"
          radius="full"
          variant="ghost"
          onClick={close}
          ref={closeButtonRef}
          aria-label={t("dashboardShell.closeMenu")}
          className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <L.X aria-hidden />
        </Button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-3 pl-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <DashboardNavList
          tabs={tabs}
          onNavigate={close}
          activeTab={activeTab}
        />
      </nav>

      <div className="shrink-0 border-t border-primary-foreground/15 p-3">
        <Link
          onClick={close}
          href={siteLinks.faq}
          className="flex h-11 items-center rounded-lg text-sm font-semibold text-primary-foreground/80 outline-none transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <span className="flex w-[52px] shrink-0 justify-center">
            <L.HelpCircle aria-hidden className="size-[18px]" />
          </span>
          {t("dashboardShell.helpSupport")}
        </Link>
      </div>
    </aside>
  );
};
