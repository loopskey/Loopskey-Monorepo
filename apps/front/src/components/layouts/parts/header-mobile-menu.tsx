"use client";

import { RoleMenuSection } from "@layouts/parts/role-menu-section";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useEffect, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { THeaderMobileMenuProps } from "@/types/layouts.types";

import Link from "@elements/localized-link";

const STAGGER_MS = 50;

const HeaderMobileMenu = ({
  id,
  isOpen,
  onClose,
  navItems,
  joinHref,
  showJoin,
  onDismiss,
  joinLabel,
  isActive,
  showRoleMenu,
}: THeaderMobileMenuProps) => {
  const { t } = useI18n();
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );
  // The panel mounts the first time the menu opens, so it starts hidden and
  // is revealed on the next frame to keep the enter transition.
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsShown(isOpen));
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  const staggerDelay = (index: number) =>
    prefersReducedMotion || !isShown ? "0ms" : `${index * STAGGER_MS}ms`;

  return (
    <div
      inert={!isOpen}
      aria-hidden={!isOpen}
      className={cn(
        "lg:hidden",
        isShown
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >
      <div
        className={cn(
          "fixed inset-0 top-16 z-40 bg-foreground/20 transition-opacity duration-300",
          isShown ? "opacity-100" : "opacity-0",
        )}
        onClick={onDismiss}
      />

      <div
        className={cn(
          "absolute left-4 right-4 top-16 z-50 origin-top rounded-lg border bg-popover p-4 shadow-md transition-all duration-300",
          isShown
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-3 scale-95 opacity-0",
        )}
      >
        <nav
          id={id}
          aria-label={t("navigation.primary")}
          className="flex flex-col gap-2"
        >
          {navItems.map((item, index) => {
            const active = isActive(item.href);
            return (
              <Link
                href={item.href}
                onClick={onClose}
                key={`mobile-${item.href}-${item.label}`}
                aria-current={active ? "page" : undefined}
                style={{ transitionDelay: staggerDelay(index) }}
                className={cn(
                  "flex items-center justify-between rounded-md px-4 py-3 text-sm font-semibold transition-all duration-300",
                  isShown
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-2 opacity-0",
                  active
                    ? "bg-primary/10 text-primary ring-1 ring-primary/15"
                    : "text-foreground hover:bg-primary/10 hover:text-primary",
                )}
              >
                <span>{item.label}</span>
                {active && (
                  <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_14%,transparent)]" />
                )}
              </Link>
            );
          })}

          {showRoleMenu && (
            <div
              style={{ transitionDelay: staggerDelay(navItems.length) }}
              className={cn(
                "mt-2 transition-all duration-300",
                isShown
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-2 opacity-0",
              )}
            >
              <RoleMenuSection />
            </div>
          )}

          {showJoin ? (
            <div
              style={{ transitionDelay: staggerDelay(navItems.length + 1) }}
              className={cn(
                "mt-2 pt-4 transition-all duration-300",
                isShown
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-2 opacity-0",
              )}
            >
              <Button
                asChild
                size="lg"
                radius="full"
                className="w-full"
                onClick={onClose}
              >
                <Link href={joinHref}>{joinLabel}</Link>
              </Button>
            </div>
          ) : null}
        </nav>
      </div>
    </div>
  );
};

export default HeaderMobileMenu;
