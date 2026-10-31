"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PUBLIC_LOCALES, switchLocalePath } from "@/lib/i18n/locale";
import { TLanguageMenuProps } from "@/types/element.types";
import { LanguageIconButton } from "@elements/language-icon-button";
import { usePathname } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

import type { PublicLocale } from "@/lib/i18n/locale";

import Link from "next/link";

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
      <LanguageIconButton
        ref={triggerRef}
        code={language}
        className={className}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={t("common.languageSwitcher.current", {
          name: t(nameKeys[language as PublicLocale]),
        })}
      />

      <ul
        id={menuId}
        hidden={!isOpen}
        className={cn(
          "absolute right-0 top-full z-50 mt-2 min-w-44 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95",
        )}
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
                  <span aria-hidden className="size-4 shrink-0" />
                  {name}
                  <span className="ml-auto text-[11px] font-bold text-muted-foreground">
                    {locale.toUpperCase()}
                  </span>
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
                  {isCurrent ? (
                    <Check
                      aria-hidden
                      className="size-4 shrink-0 text-primary"
                    />
                  ) : (
                    <span aria-hidden className="size-4 shrink-0" />
                  )}
                  {name}
                  <span className="ml-auto text-[11px] font-bold">
                    {locale.toUpperCase()}
                  </span>
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
