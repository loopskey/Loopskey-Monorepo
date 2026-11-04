"use client";

import { getAuthHrefForSolutionHref, siteLinks } from "@/utils/site-navigation";
import { HEADER_CONTAINER_CLASS_NAME } from "@/utils/site-navigation";
import { HeaderSearchRowField } from "@layouts/parts/header-search-control";
import { useEffect, useState } from "react";
import { HeaderSearchField } from "@layouts/parts/header-search-control";
import { getDashboardPath } from "@/utils/site-navigation";
import { solutionEntries } from "@/utils/site-navigation";
import { useActiveRole } from "@/providers/active-role-provider";
import { RoleStrip } from "@layouts/parts/role-strip";
import { useHeader } from "@hooks/useHeader";
import { Menu, X } from "lucide-react";
import { Button } from "@ui/button";
import { Logo } from "@layouts/parts/logo";
import { cn } from "@lib/utils";

import type { ReactNode } from "react";

import dynamic from "next/dynamic";
import Link from "@elements/localized-link";

const PublicUserMenu = dynamic(() => import("@layouts/parts/public-user-menu"));

const loadMobileMenu = () => import("@layouts/parts/header-mobile-menu");
const HeaderMobileMenu = dynamic(loadMobileMenu, { ssr: false });
const preloadMobileMenu = () => void loadMobileMenu();

type THeaderProps = {
  languageControl: ReactNode;
};

const MOBILE_MENU_ID = "header-mobile-menu";

const Header = ({ languageControl }: THeaderProps) => {
  const {
    t,
    menuToggle,
    isScrolled,
    closeSearch,
    isMobileOpen,
    showRoleStrip,
    isAuthenticated,
    currentUserRole,
    closeMobileMenu,
    toggleMobileMenu,
    isRowFieldActive,
    dismissMobileMenu,
    setIsRowFieldActive,
    isInlineSearchActive,
    setIsInlineSearchActive,
  } = useHeader();
  const { activeRoleHref } = useActiveRole();
  const activeRole = solutionEntries.find(
    (entry) => entry.href === activeRoleHref,
  );
  const joinHref = getAuthHrefForSolutionHref(
    activeRoleHref ?? siteLinks.professionals,
  );
  const joinLabel = activeRole
    ? t(`common.joinAs.${activeRole.role.toLowerCase()}`)
    : t("common.joinForFree");
  const workspaceEntry =
    isAuthenticated && currentUserRole
      ? solutionEntries.find((entry) => entry.role === currentUserRole)
      : undefined;
  const [hasOpenedMobileMenu, setHasOpenedMobileMenu] = useState(false);

  useEffect(() => {
    if (isMobileOpen) setHasOpenedMobileMenu(true);
  }, [isMobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background transition-all duration-300 lg:-top-10",
        isScrolled ? "border-b shadow-sm" : "border-b",
      )}
    >
      {showRoleStrip && (
        <RoleStrip
          workspace={
            workspaceEntry && currentUserRole
              ? {
                  roleLabelKey: workspaceEntry.roleLabelKey,
                  dashboardHref: getDashboardPath(currentUserRole),
                }
              : undefined
          }
        />
      )}

      <div
        className={cn(HEADER_CONTAINER_CLASS_NAME, "gap-1 min-[380px]:gap-3")}
      >
        <Logo label={t("navigation.homeLink")} />

        <div className="flex min-w-0 flex-1 items-center gap-0.5 min-[380px]:gap-1.5 sm:gap-2 lg:gap-3 lg:pl-6">
          <HeaderSearchField
            isActive={isInlineSearchActive}
            onActivate={() => setIsInlineSearchActive(true)}
          />

          <div className="ml-auto flex items-center gap-0.5 min-[380px]:gap-1.5 sm:gap-2 lg:gap-3">
            {languageControl}

            {isAuthenticated ? (
              <PublicUserMenu />
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  radius="full"
                  className="hidden lg:inline-flex"
                >
                  <Link href={joinHref}>{joinLabel}</Link>
                </Button>

                {/* Below lg the menu holds the role choice and the join button. */}
                <Button
                  size="icon"
                  radius="xl"
                  type="button"
                  variant="ghost"
                  ref={menuToggle}
                  onClick={toggleMobileMenu}
                  onFocus={preloadMobileMenu}
                  aria-expanded={isMobileOpen}
                  onPointerEnter={preloadMobileMenu}
                  aria-controls={
                    hasOpenedMobileMenu ? MOBILE_MENU_ID : undefined
                  }
                  className="size-9 text-muted-foreground hover:text-primary min-[380px]:size-10 lg:hidden"
                  aria-label={
                    isMobileOpen
                      ? t("navigation.closeMenu")
                      : t("navigation.openMenu")
                  }
                >
                  {isMobileOpen ? (
                    <X className="size-5" />
                  ) : (
                    <Menu className="size-5" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <HeaderSearchRowField
        onClose={closeSearch}
        isActive={isRowFieldActive}
        onActivate={() => setIsRowFieldActive(true)}
      />

      {hasOpenedMobileMenu && !isAuthenticated ? (
        <HeaderMobileMenu
          id={MOBILE_MENU_ID}
          joinHref={joinHref}
          isOpen={isMobileOpen}
          joinLabel={joinLabel}
          onClose={closeMobileMenu}
          onDismiss={dismissMobileMenu}
        />
      ) : null}
    </header>
  );
};

export default Header;
