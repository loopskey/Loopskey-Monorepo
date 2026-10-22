"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PUBLIC_LOCALES, switchLocalePath } from "@/lib/i18n/locale";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { PublicLocale } from "@/lib/i18n/locale";

import Link from "next/link";

type TLanguageMenuProps = {
  search: string;
  className?: string;
  available?: readonly PublicLocale[];
  nameKeys: Record<PublicLocale, string>;
};

const ITEM_CLASS =
  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground";

export const LanguageMenu = ({
  search,
  nameKeys,
  available,
  className,
}: TLanguageMenuProps) => {
  const { language, t } = useI18n();
  const pathname = usePathname();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setIsOpen(false), [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        aria-expanded={isOpen}
        aria-controls={menuId}
        className={cn("rounded-full", className)}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={t("common.languageSwitcher.label")}
      >
        <Languages className="mr-2 h-4 w-4" />
        {language.toUpperCase()}
      </Button>

      <ul
        id={menuId}
        hidden={!isOpen}
        className="absolute right-0 top-full z-50 mt-2 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
      >
        {PUBLIC_LOCALES.map((locale) => {
          const isCurrent = locale === language;
          const isAvailable =
            !available || isCurrent || available.includes(locale);
          const name = t(nameKeys[locale]);

          return (
            <li key={locale}>
              {isAvailable && !isCurrent ? (
                <Link
                  lang={locale}
                  hrefLang={locale}
                  className={ITEM_CLASS}
                  onClick={() => setIsOpen(false)}
                  href={switchLocalePath(pathname, search, locale)}
                >
                  {name}
                </Link>
              ) : (
                <span
                  lang={locale}
                  aria-current={isCurrent ? "true" : undefined}
                  title={
                    isAvailable
                      ? undefined
                      : t("common.languageSwitcher.unavailable")
                  }
                  className={cn(
                    ITEM_CLASS,
                    "pointer-events-none",
                    isCurrent
                      ? "font-semibold"
                      : "text-muted-foreground line-through",
                  )}
                >
                  {name}
                  {!isAvailable && (
                    <span className="sr-only">
                      {`: ${t("common.languageSwitcher.unavailable")}`}
                    </span>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
