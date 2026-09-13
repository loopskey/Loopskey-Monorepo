"use client";

import { getDashboardTabsByRole } from "@/utils/dashboard-nav.config";
import { isDashboardTabActive } from "@/utils/dashboard-nav.config";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { LanguageToggleBtn } from "@elements/language-switcher";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UserMenu } from "@layouts/parts/user-menu";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Logo } from "@layouts/parts/logo";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

import Link from "next/link";

import * as S from "@ui/sheet";

export const DashboardTopBar = () => {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const { data } = useCurrentUserQuery();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const focusMainOnClose = useRef(false);

  const role = data?.user?.role;
  const tabs = getDashboardTabsByRole(role);
  const activeTab = searchParams?.get("tab") ?? "overview";

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b bg-background px-3 md:px-6">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <S.Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <S.SheetTrigger asChild>
              <Button
                size="icon"
                type="button"
                variant="outline"
                className="h-11 w-11 md:hidden"
                aria-expanded={isDrawerOpen}
                aria-controls="dashboard-drawer"
                aria-label={
                  isDrawerOpen
                    ? t("dashboardShell.drawer.closeMenu")
                    : t("dashboardShell.drawer.openMenu")
                }
              >
                <Menu className="h-5 w-5" aria-hidden />
              </Button>
            </S.SheetTrigger>
            <S.SheetContent
              side="left"
              id="dashboard-drawer"
              className="w-[85%] max-w-xs p-0"
              onCloseAutoFocus={(event) => {
                if (!focusMainOnClose.current) return;
                event.preventDefault();
                focusMainOnClose.current = false;
                document.getElementById("dashboard-main")?.focus();
              }}
            >
              <S.SheetHeader className="border-b">
                <S.SheetTitle>{t("dashboardShell.drawer.title")}</S.SheetTitle>
              </S.SheetHeader>
              <nav
                aria-label={t("dashboardShell.drawer.navLabel")}
                className="min-h-0 flex-1 overflow-y-auto p-2"
              >
                <ul className="space-y-1">
                  {tabs.map((item) => {
                    const Icon = item.icon;
                    const isActive = isDashboardTabActive(
                      item.value,
                      activeTab,
                    );
                    return (
                      <li key={item.value}>
                        <Link
                          href={item.href}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => {
                            focusMainOnClose.current = true;
                            setIsDrawerOpen(false);
                          }}
                          className={cn(
                            "flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted",
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0" aria-hidden />
                          {t(item.labelKey)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </S.SheetContent>
          </S.Sheet>

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
