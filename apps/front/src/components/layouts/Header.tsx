"use client";

import { getAuthHrefForSolutionHref, siteLinks } from "@/utils/site-navigation";
import { HEADER_CONTAINER_CLASS_NAME } from "@/utils/site-navigation";
import { HEADER_SEARCH_INPUT_ID } from "@/utils/site-navigation";
import { getDashboardPath } from "@/utils/site-navigation";
import { Menu, Search, X } from "lucide-react";
import { solutionEntries } from "@/utils/site-navigation";
import { useActiveRole } from "@/providers/active-role-provider";
import { useEffect, useState } from "react";
import { RoleStrip } from "@layouts/parts/role-strip";
import { useHeader } from "@hooks/useHeader";
import { Button } from "@ui/button";
import { Logo } from "@layouts/parts/logo";
import { cn } from "@lib/utils";

import type { ReactNode } from "react";

import dynamic from "next/dynamic";
import Link from "@elements/localized-link";

const PublicUserMenu = dynamic(() => import("@layouts/parts/public-user-menu"));

const loadHeaderSearch = () =>
  import("@layouts/parts/header-search").then((module) => module.HeaderSearch);
const HeaderSearch = dynamic(loadHeaderSearch, { ssr: false });
const preloadHeaderSearch = () => void loadHeaderSearch();

// The drawer is only for narrow screens, so desktop visitors never download it.
const loadMobileMenu = () => import("@layouts/parts/header-mobile-menu");
const HeaderMobileMenu = dynamic(loadMobileMenu, { ssr: false });
const preloadMobileMenu = () => void loadMobileMenu();

type THeaderProps = {
  languageControl: ReactNode;
};

const MOBILE_NAV_ID = "header-mobile-navigation";
const SEARCH_ROW_ID = "header-search-row";

const Header = ({ languageControl }: THeaderProps) => {
  const {
    t,
    navItems,
    menuToggle,
    isScrolled,
    closeSearch,
    toggleSearch,
    isSearchOpen,
    isMobileOpen,
    showRoleStrip,
    isAuthenticated,
    currentUserRole,
    isActiveNavItem,
    closeMobileMenu,
    toggleMobileMenu,
    dismissMobileMenu,
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
                  "after:absolute after:inset-x-2.5 after:-bottom-[14px] after:h-0.5 after:rounded-t-full after:bg-primary after:opacity-0 after:transition-opacity after:duration-200 xl:after:inset-x-3",
                  isActive
                    ? "text-primary after:opacity-100"
                    : "text-muted-foreground hover:text-primary",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-0.5 min-[380px]:gap-1.5 sm:gap-2">
          {isInlineSearchActive ? (
            <HeaderSearch
              autoFocus
              variant="inline"
              className="hidden w-72 xl:block"
            />
          ) : (
            <button
              type="button"
              id={HEADER_SEARCH_INPUT_ID}
              onFocus={preloadHeaderSearch}
              onPointerEnter={preloadHeaderSearch}
              aria-label={t("navigation.search.label")}
              onClick={() => setIsInlineSearchActive(true)}
              className="relative hidden h-10 w-72 items-center gap-2 rounded-xl border border-border bg-muted/60 pl-3 pr-2.5 text-left text-sm font-medium text-muted-foreground outline-none transition-[border-color,background-color] hover:border-primary/25 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 xl:flex"
            >
              <Search aria-hidden className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">
                {t("navigation.search.placeholder")}
              </span>
              <kbd
                aria-hidden
                className="rounded-md border bg-background px-1.5 py-0.5 text-[11px] font-semibold"
              >
                /
              </kbd>
            </button>
          )}

          <Button
            size="icon"
            radius="xl"
            type="button"
            variant="ghost"
            onClick={toggleSearch}
            aria-expanded={isSearchOpen}
            aria-controls={SEARCH_ROW_ID}
            className="size-9 text-muted-foreground hover:text-primary min-[380px]:size-10 xl:hidden"
            aria-label={
              isSearchOpen
                ? t("navigation.search.close")
                : t("navigation.search.open")
            }
          >
            {isSearchOpen ? (
              <X className="size-5" />
            ) : (
              <Search className="size-5" />
            )}
          </Button>

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
            onFocus={preloadMobileMenu}
            onClick={toggleMobileMenu}
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

      {isSearchOpen ? (
        <div id={SEARCH_ROW_ID} className="border-t bg-background xl:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <HeaderSearch autoFocus variant="row" onClose={closeSearch} />
          </div>
        </div>
      ) : null}

      {hasOpenedMobileMenu ? (
        <HeaderMobileMenu
          id={MOBILE_NAV_ID}
          isOpen={isMobileOpen}
          joinHref={joinHref}
          navItems={navItems}
          joinLabel={joinLabel}
          onClose={closeMobileMenu}
          onDismiss={dismissMobileMenu}
          isActive={isActiveNavItem}
          showJoin={!isAuthenticated}
          showRoleMenu={showRoleMenuMobile}
        />
      ) : null}
    </header>
  );
};

export default Header;
