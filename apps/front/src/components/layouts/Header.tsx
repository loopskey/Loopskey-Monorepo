"use client";

import { getSolutionHrefForRole, siteLinks } from "@/utils/site-navigation";
import { HEADER_CONTAINER_CLASS_NAME } from "@/utils/site-navigation";
import { getAuthHrefForSolutionHref } from "@/utils/site-navigation";
import { RoleMenuSection } from "@layouts/parts/role-menu-section";
import { solutionEntries } from "@/utils/site-navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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

const MOBILE_NAV_STAGGER_MS = 50;

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
    showRoleStrip,
    isMobileOpen,
    isAuthenticated,
    currentUserRole,
    isActiveNavItem,
    closeMobileMenu,
    toggleMobileMenu,
    dismissMobileMenu,
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
  const authenticatedRoleHref =
    isAuthenticated && currentUserRole
      ? getSolutionHrefForRole(currentUserRole)
      : undefined;
  const showRoleMenuMobile = showRoleStrip && !isAuthenticated;
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );

  const staggerDelay = (index: number) =>
    prefersReducedMotion || !isMobileOpen
      ? "0ms"
      : `${index * MOBILE_NAV_STAGGER_MS}ms`;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background transition-all duration-300 lg:-top-10",
        isScrolled ? "border-b shadow-sm" : "border-b",
      )}
    >
      {showRoleStrip && <RoleStrip lockedHref={authenticatedRoleHref} />}

      <div className={HEADER_CONTAINER_CLASS_NAME}>
        <Logo label={t("navigation.homeLink")} />
        <nav
          aria-label={t("navigation.primary")}
          className="hidden items-center gap-1 lg:flex"
        >
          {navItems.map((item) => {
            const isActive = isActiveNavItem(item.href);
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative mx-1 whitespace-nowrap rounded-full px-2 py-2 text-sm font-semibold xl:mx-3 xl:px-3 transition-all duration-300",
                  "after:absolute after:bottom-1 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-primary after:transition-all after:duration-300",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/15 after:w-6"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary hover:after:w-5",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {languageControl}
          {isAuthenticated ? (
            <PublicUserMenu />
          ) : (
            <Button asChild size="lg" radius="full">
              <Link href={joinHref}>{joinLabel}</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {languageControl}
          <Button
            size="icon"
            type="button"
            radius="full"
            variant="outline"
            ref={menuToggle}
            aria-expanded={isMobileOpen}
            aria-controls={MOBILE_NAV_ID}
            aria-label={
              isMobileOpen
                ? t("navigation.closeMenu")
                : t("navigation.openMenu")
            }
            onClick={toggleMobileMenu}
          >
            {isMobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <div
        inert={!isMobileOpen}
        aria-hidden={!isMobileOpen}
        className={cn(
          "lg:hidden",
          isMobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        <div
          className={cn(
            "fixed inset-0 top-16 z-40 bg-foreground/20 transition-opacity duration-300",
            isMobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={dismissMobileMenu}
        />

        <div
          className={cn(
            "absolute left-4 right-4 top-16 z-50 origin-top rounded-lg border bg-popover p-4 shadow-md transition-all duration-300",
            isMobileOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "-translate-y-3 scale-95 opacity-0",
          )}
        >
          <nav
            id={MOBILE_NAV_ID}
            aria-label={t("navigation.primary")}
            className="flex flex-col gap-2"
          >
            {navItems.map((item, index) => {
              const isActive = isActiveNavItem(item.href);
              return (
                <Link
                  href={item.href}
                  onClick={closeMobileMenu}
                  key={`mobile-${item.href}-${item.label}`}
                  aria-current={isActive ? "page" : undefined}
                  style={{ transitionDelay: staggerDelay(index) }}
                  className={cn(
                    "flex items-center justify-between rounded-md px-4 py-3 text-sm font-semibold transition-all duration-300",
                    isMobileOpen
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-2 opacity-0",
                    isActive
                      ? "bg-primary/10 text-primary ring-1 ring-primary/15"
                      : "text-foreground hover:bg-primary/10 hover:text-primary",
                  )}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_14%,transparent)]" />
                  )}
                </Link>
              );
            })}

            {showRoleMenuMobile && (
              <div
                style={{ transitionDelay: staggerDelay(navItems.length) }}
                className={cn(
                  "mt-2 transition-all duration-300",
                  isMobileOpen
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-2 opacity-0",
                )}
              >
                <RoleMenuSection />
              </div>
            )}

            <div
              style={{ transitionDelay: staggerDelay(navItems.length + 1) }}
              className={cn(
                "mt-2 pt-4 transition-all duration-300",
                showRoleMenuMobile && "border-t-0",
                !showRoleMenuMobile && "border-t border-border/70",
                isMobileOpen
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-2 opacity-0",
              )}
            >
              {isAuthenticated ? (
                <PublicUserMenu variant="inline" onNavigate={closeMobileMenu} />
              ) : (
                <Button
                  asChild
                  size="lg"
                  radius="full"
                  className="w-full"
                  onClick={closeMobileMenu}
                >
                  <Link href={joinHref}>{joinLabel}</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
