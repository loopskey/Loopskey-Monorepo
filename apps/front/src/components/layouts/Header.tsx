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

const MOBILE_NAV_ID = "header-mobile-navigation";

const Header = ({ languageControl }: THeaderProps) => {
  const {
    t,
    navItems,
    menuToggle,
    isScrolled,
    closeSearch,
    isMobileOpen,
    showRoleStrip,
    drawerNavItems,
    isAuthenticated,
    currentUserRole,
    isActiveNavItem,
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
  const showRoleMenuMobile = showRoleStrip && !isAuthenticated;
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

      <div className={cn(HEADER_CONTAINER_CLASS_NAME, "gap-4 xl:gap-8")}>
        <Logo label={t("navigation.homeLink")} />
        <nav
          aria-label={t("navigation.primary")}
          className="hidden items-center lg:flex"
        >
          {navItems.map((item) => {
            const isActive = isActiveNavItem(item.href);
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-semibold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring xl:px-3",
                  "after:absolute after:inset-x-2.5 after:-bottom-[14px] after:h-0.5 after:origin-center after:scale-x-0 after:rounded-t-full after:bg-primary after:transition-transform after:duration-300 after:ease-out motion-reduce:after:transition-none xl:after:inset-x-3",
                  isActive
                    ? "text-primary after:scale-x-100"
                    : "text-muted-foreground hover:text-primary hover:after:scale-x-100 focus-visible:after:scale-x-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-0.5 min-[380px]:gap-1.5 sm:gap-2 lg:flex-1 lg:justify-end lg:gap-3">
          <HeaderSearchField
            isActive={isInlineSearchActive}
            onActivate={() => setIsInlineSearchActive(true)}
          />

          {languageControl}

          {isAuthenticated ? (
            <PublicUserMenu />
          ) : (
            <Button
              asChild
              size="lg"
              radius="full"
              className="hidden lg:inline-flex"
            >
              <Link href={joinHref}>{joinLabel}</Link>
            </Button>
          )}

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
            aria-controls={hasOpenedMobileMenu ? MOBILE_NAV_ID : undefined}
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
        </div>
      </div>

      <HeaderSearchRowField
        onClose={closeSearch}
        isActive={isRowFieldActive}
        onActivate={() => setIsRowFieldActive(true)}
      />

      {hasOpenedMobileMenu ? (
        <HeaderMobileMenu
          id={MOBILE_NAV_ID}
          joinHref={joinHref}
          isOpen={isMobileOpen}
          joinLabel={joinLabel}
          navItems={drawerNavItems}
          onClose={closeMobileMenu}
          isActive={isActiveNavItem}
          showJoin={!isAuthenticated}
          onDismiss={dismissMobileMenu}
          showRoleMenu={showRoleMenuMobile}
        />
      ) : null}
    </header>
  );
};

export default Header;
