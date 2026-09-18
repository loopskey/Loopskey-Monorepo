"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { isDashboardTabActive } from "@/utils/dashboard-nav.config";
import { useEffect, useRef, useState } from "react";
import { useDashboardNav } from "@/hooks/useDashboardNav";
import { siteLinks } from "@utils/constant";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import Link from "next/link";
import * as L from "lucide-react";

const HINT_STORAGE_KEY = "loopskey:dashboard-nav-hint-seen";
const HINT_AUTO_DISMISS_MS = 6000;
const ACTIVE_TAB_PEEK_MS = 2000;

type TTabHandleProps = {
  Chevron: typeof L.ChevronRight;
};

const TabHandle = ({ Chevron }: TTabHandleProps) => (
  <span className="relative flex h-24 w-7 flex-col items-center justify-between rounded-r-2xl bg-primary py-3 shadow-lg transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
    <span className="flex flex-col items-center gap-1">
      <span className="size-1 rounded-full bg-primary-foreground/50" />
      <span className="size-1 rounded-full bg-primary-foreground/50" />
    </span>
    <span className="flex flex-col items-center gap-1">
      <span className="size-1 rounded-full bg-primary-foreground/50" />
      <span className="size-1 rounded-full bg-primary-foreground/50" />
    </span>
    <span className="absolute left-full top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background text-primary shadow-md">
      <Chevron className="size-4" aria-hidden />
    </span>
  </span>
);

export const MobileDashboardDrawer = () => {
  const { t } = useI18n();
  const { role, tabs, activeTab, isReady } = useDashboardNav();
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [peekedTab, setPeekedTab] = useState<string | null>(null);
  const peekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    peekTimeoutRef.current = setTimeout(() => setPeekedTab(null), ACTIVE_TAB_PEEK_MS);
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

      {!isOpen && (
        <Tooltip open={showHint || undefined}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={openDrawer}
              aria-label={t("dashboardShell.openMenu")}
              aria-expanded={isOpen}
              className="group fixed left-0 top-[38%] z-50 -translate-y-1/2 outline-none"
            >
              <TabHandle Chevron={L.ChevronRight} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {showHint ? (
              <>
                <L.MousePointerClick className="size-4 shrink-0" aria-hidden />
                {t("dashboardShell.tapToOpenMenu")}
              </>
            ) : (
              t("dashboardShell.menu")
            )}
          </TooltipContent>
        </Tooltip>
      )}

      <aside
        aria-label={t("dashboardShell.navLabel")}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[72px] flex-col bg-primary text-primary-foreground shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <nav className="min-h-0 flex-1 overflow-y-auto py-3 pl-3">
          <ul>
            {tabs.map((item) => {
              const Icon = item.icon;
              const isActive = isDashboardTabActive(item.value, activeTab);
              const label = t(item.labelKey);

              return (
                <li key={item.value} className="sidebar-item" data-active={isActive}>
                  <Tooltip
                    open={peekedTab !== null && isDashboardTabActive(item.value, peekedTab)}
                    onOpenChange={(open) => setPeekedTab(open ? item.value : null)}
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
            <TooltipContent side="right">{t("dashboardShell.helpSupport")}</TooltipContent>
          </Tooltip>
        </div>

        {isOpen && (
          <button
            type="button"
            onClick={closeDrawer}
            aria-label={t("dashboardShell.closeMenu")}
            aria-expanded={isOpen}
            className="group absolute left-full top-[38%] -translate-y-1/2 outline-none"
          >
            <TabHandle Chevron={L.ChevronLeft} />
          </button>
        )}
      </aside>
    </div>
  );
};
