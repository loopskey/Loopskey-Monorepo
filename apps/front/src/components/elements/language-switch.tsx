"use client";

import { PUBLIC_LOCALES, switchLocalePath } from "@/lib/i18n/locale";
import { usePathname } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import type { TLanguageSwitchProps } from "@/types/element.types";
import type { PublicLocale } from "@/lib/i18n/locale";

import Link from "next/link";

const LANGUAGE_NAME_KEY: Record<PublicLocale, string> = {
  en: "common.english",
  fr: "common.french",
};

const SEGMENT_CLASS_NAME =
  "grid h-8 min-w-[1.875rem] place-items-center rounded-[9px] px-2 text-[13px] font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring min-[380px]:h-[34px] min-[380px]:min-w-9 min-[380px]:px-2.5";

const ACTIVE_CLASS_NAME = "bg-primary text-primary-foreground";

const IDLE_CLASS_NAME = "text-foreground hover:bg-accent hover:text-primary";

const UNAVAILABLE_CLASS_NAME = "cursor-not-allowed text-muted-foreground/60";

export const LanguageSwitch = ({
  search = "",
  onSelect,
  available,
  className,
}: TLanguageSwitchProps) => {
  const { language, t } = useI18n();
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={t("common.languageSwitcher.label")}
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-xl border-[1.5px] border-primary/30 bg-background p-[3px]",
        className,
      )}
    >
      {PUBLIC_LOCALES.map((locale) => {
        const name = t(LANGUAGE_NAME_KEY[locale]);
        const code = locale.toUpperCase();

        if (locale === language)
          return (
            <span
              key={locale}
              lang={locale}
              aria-current="true"
              aria-label={t("common.languageSwitcher.current", { name })}
              className={cn(SEGMENT_CLASS_NAME, ACTIVE_CLASS_NAME)}
            >
              {code}
            </span>
          );

        if (available && !available.includes(locale))
          return (
            <span
              key={locale}
              lang={locale}
              aria-disabled="true"
              title={t("common.languageSwitcher.unavailable")}
              aria-label={`${name}: ${t("common.languageSwitcher.unavailable")}`}
              className={cn(SEGMENT_CLASS_NAME, UNAVAILABLE_CLASS_NAME)}
            >
              {code}
            </span>
          );

        if (onSelect)
          return (
            <button
              key={locale}
              type="button"
              lang={locale}
              aria-label={name}
              onClick={() => onSelect(locale)}
              className={cn(SEGMENT_CLASS_NAME, IDLE_CLASS_NAME)}
            >
              {code}
            </button>
          );

        return (
          <Link
            key={locale}
            lang={locale}
            hrefLang={locale}
            aria-label={name}
            className={cn(SEGMENT_CLASS_NAME, IDLE_CLASS_NAME)}
            href={switchLocalePath(pathname, search, locale)}
          >
            {code}
          </Link>
        );
      })}
    </div>
  );
};
