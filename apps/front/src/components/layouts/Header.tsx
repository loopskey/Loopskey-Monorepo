"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import { LanguageToggleBtn } from "@elements/language-switcher";
import { ThemeToggleBtn } from "@elements/mode-toggle";
import { useHeader } from "@hooks/useHeader";
import { UserMenu } from "@layouts/parts/user-menu";
import { Button } from "@ui/button";
import { Logo } from "@layouts/parts/logo";
import { cn } from "@lib/utils";

import Link from "next/link";

const Header = () => {
  const {
    t,
    navItems,
    loginHref,
    isScrolled,
    isMobileOpen,
    isAuthenticated,
    isActiveNavItem,
    closeMobileMenu,
    toggleMobileMenu,
  } = useHeader();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "border-b border-glass-border bg-background/65 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:bg-background/45 dark:shadow-[0_16px_50px_rgba(0,0,0,0.35)]"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive = isActiveNavItem(item.href);
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative mx-3 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-300",
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
          <LanguageToggleBtn />
          <ThemeToggleBtn />
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button asChild variant="brand" radius="full" size="lg">
              <Link href={loginHref}>
                {t("common.login")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggleBtn />
          <ThemeToggleBtn />
          <Button
            size="icon"
            type="button"
            radius="full"
            variant="glass"
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
        className={cn(
          "lg:hidden",
          isMobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        <div
          className={cn(
            "fixed inset-0 top-20 z-40 bg-background/45 backdrop-blur-sm transition-opacity duration-300",
            isMobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={closeMobileMenu}
        />

        <div
          className={cn(
            "absolute left-4 right-4 top-20 z-50 origin-top rounded-[2rem] border border-glass-border bg-background/80 p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 dark:bg-background/70",
            isMobileOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "-translate-y-3 scale-95 opacity-0",
          )}
        >
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = isActiveNavItem(item.href);
              return (
                <Link
                  href={item.href}
                  onClick={closeMobileMenu}
                  key={`mobile-${item.href}-${item.label}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                    isActive
                      ? "bg-primary/10 text-primary ring-1 ring-primary/15"
                      : "text-foreground hover:bg-primary/10 hover:text-primary",
                  )}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.14)]" />
                  )}
                </Link>
              );
            })}

            <div className="mt-2 border-t border-border/70 pt-4">
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <Button
                  asChild
                  size="lg"
                  radius="xl"
                  variant="brand"
                  className="w-full"
                >
                  <Link href={loginHref} onClick={closeMobileMenu}>
                    {t("common.login")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
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
