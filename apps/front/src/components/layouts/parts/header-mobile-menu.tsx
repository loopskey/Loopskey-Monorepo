"use client";

import { useEffect, useState } from "react";
import { RoleMenuSection } from "@layouts/parts/role-menu-section";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { THeaderMobileMenuProps } from "@/types/layouts.types";

import Link from "@elements/localized-link";

const STAGGER_MS = 50;

const HeaderMobileMenu = ({
  id,
  isOpen,
  onClose,
  joinHref,
  onDismiss,
  joinLabel,
}: THeaderMobileMenuProps) => {
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );

  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsShown(isOpen));
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  const staggerDelay = (index: number) =>
    prefersReducedMotion || !isShown ? "0ms" : `${index * STAGGER_MS}ms`;

  const itemClassName = cn(
    "transition-all duration-300",
    isShown ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
  );

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
        id={id}
        className={cn(
          "absolute left-4 right-4 top-16 z-50 flex origin-top flex-col gap-4 rounded-lg border bg-popover p-4 shadow-md transition-all duration-300",
          isShown
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-3 scale-95 opacity-0",
        )}
      >
        <div
          className={itemClassName}
          style={{ transitionDelay: staggerDelay(0) }}
        >
          <RoleMenuSection />
        </div>

        <div
          className={cn(itemClassName, "border-t border-border/70 pt-4")}
          style={{ transitionDelay: staggerDelay(1) }}
        >
          <Button
            asChild
            size="lg"
            radius="full"
            onClick={onClose}
            className="w-full"
          >
            <Link href={joinHref}>{joinLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeaderMobileMenu;
