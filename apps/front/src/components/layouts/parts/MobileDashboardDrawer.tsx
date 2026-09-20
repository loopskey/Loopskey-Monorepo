"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { isDashboardTabActive } from "@/utils/dashboard-nav.config";
import { useEffect, useRef, useState } from "react";
import { useDashboardNav } from "@/hooks/useDashboardNav";
import { siteLinks } from "@utils/constant";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";
import * as L from "lucide-react";

const HINT_STORAGE_KEY = "loopskey:dashboard-nav-hint-seen";
const HINT_AUTO_DISMISS_MS = 6000;
const ACTIVE_TAB_PEEK_MS = 2000;

export const MobileDashboardDrawer = () => {
  const { t } = useI18n();
  const { role, tabs, activeTab, isReady } = useDashboardNav();
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [peekedTab, setPeekedTab] = useState<string | null>(null);
  const peekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeTabLabel =
    tabs.find((tab) => isDashboardTabActive(tab.value, activeTab))?.labelKey ??
    "dashboardShell.menu";

  useEffect(() => {
    try {
      if (!localStorage.getItem(HINT_STORAGE_KEY)) setShowHint(true);
    } catch {
      // Storage can be unavailable (private browsing, blocked cookies); the
      // hint simply won't persist across visits in that case.
    }
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    try {
      localStorage.setItem(HINT_STORAGE_KEY, "1");
    } catch {
      // See above: persistence is best-effort only.
    }
  };

  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(dismissHint, HINT_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [showHint]);

  const openDrawer = () => {
    setIsOpen(true);
    if (showHint) dismissHint();
  };
  const closeDrawer = () => setIsOpen(false);

  useEffect(() => {
    closeDrawer();
  }, [activeTab]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    setPeekedTab(activeTab);
    if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
    peekTimeoutRef.current = setTimeout(
      () => setPeekedTab(null),
      ACTIVE_TAB_PEEK_MS,
    );
    return () => {
      if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
    };
  }, [activeTab]);

  if (!isReady || !role) return null;

  return (
    <div className="lg:hidden">
      <div
        aria-hidden
        onClick={closeDrawer}
        className={cn(
          "fixed inset-0 z-[45] bg-foreground/40 transition-opacity duration-300 motion-reduce:transition-none",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div className="relative flex h-11 items-center justify-center rounded-lg border bg-card px-12 shadow-sm">
        <Tooltip open={showHint || undefined}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              radius="full"
              variant="outline"
              onClick={openDrawer}
              aria-label={t("dashboardShell.openMenu")}
              aria-expanded={isOpen}
              className="absolute left-1 size-9"
            >
              <L.Menu aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {t("dashboardShell.tapToOpenMenu")}
          </TooltipContent>
        </Tooltip>

        <p className="truncate text-center text-sm font-semibold">
          {t(activeTabLabel)}
        </p>
      </div>

      <aside
        aria-label={t("dashboardShell.navLabel")}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[72px] flex-col bg-primary text-primary-foreground shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-primary-foreground/15">
          <Button
            type="button"
            size="icon"
            radius="full"
            variant="ghost"
            onClick={closeDrawer}
            aria-label={t("dashboardShell.closeMenu")}
            className="size-10 text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground"
          >
            <L.X aria-hidden />
          </Button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto py-3 pl-3">
          <ul>
            {tabs.map((item) => {
              const Icon = item.icon;
              const isActive = isDashboardTabActive(item.value, activeTab);
              const label = t(item.labelKey);

              return (
                <li
                  key={item.value}
                  className="sidebar-item"
                  data-active={isActive}
                >
                  <Tooltip
                    open={
                      peekedTab !== null &&
                      isDashboardTabActive(item.value, peekedTab)
                    }
                    onOpenChange={(open) =>
                      setPeekedTab(open ? item.value : null)
                    }
                  >
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        title={label}
                        aria-label={label}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "relative z-10 flex h-[60px] w-full items-center justify-center rounded-l-[30px] outline-none transition-colors duration-200",
                          "text-primary-foreground",
                          "hover:bg-background hover:text-primary",
                          "focus-visible:ring-2 focus-visible:ring-ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
                          isActive && "bg-background text-primary",
                        )}
                      >
                        <Icon className="size-5 shrink-0" aria-hidden />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-primary-foreground/15 p-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={siteLinks.faq}
                onClick={closeDrawer}
                aria-label={t("dashboardShell.helpSupport")}
                className="flex h-12 w-full items-center justify-center rounded-full text-primary-foreground/90 outline-none transition-colors duration-200 hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                <L.HelpCircle className="size-5 shrink-0" aria-hidden />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              {t("dashboardShell.helpSupport")}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </div>
  );
};
