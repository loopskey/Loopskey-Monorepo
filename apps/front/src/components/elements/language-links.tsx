"use client";

import { PUBLIC_LOCALES, switchLocalePath } from "@/lib/i18n/locale";
import { usePathname, useSearchParams } from "next/navigation";
import { stripLocalePrefix } from "@/lib/i18n/locale";
import { Languages } from "lucide-react";
import { Suspense } from "react";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import type { PublicLocale } from "@/lib/i18n/locale";

import Link from "next/link";

type TLanguageLinksProps = {
  available?: readonly PublicLocale[];
  className?: string;
};

type TLinkListProps = TLanguageLinksProps & { search: string };

const LANGUAGE_NAME_KEY: Record<PublicLocale, string> = {
  en: "common.english",
  fr: "common.french",
};

const isCatalogPath = (pathname: string) =>
  stripLocalePrefix(pathname).startsWith("/content");

const LinkList = ({ available, className, search }: TLinkListProps) => {
  const { language, t } = useI18n();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("common.languageSwitcher.label")}
      className={cn("flex items-center gap-1 text-sm font-semibold", className)}
    >
      <Languages className="size-4 text-muted-foreground" aria-hidden />
      {PUBLIC_LOCALES.map((locale) => {
        const name = t(LANGUAGE_NAME_KEY[locale]);
        const isCurrent = locale === language;
        const isAvailable =
          !available || isCurrent || available.includes(locale);
        const itemClass = cn(
          "rounded-full px-2.5 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isCurrent
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        );

        if (!isAvailable)
          return (
            <span
              key={locale}
              lang={locale}
              aria-disabled="true"
              title={t("common.languageSwitcher.unavailable")}
              className={cn(itemClass, "cursor-not-allowed opacity-50")}
              aria-label={`${name}: ${t(`common.languageSwitcher.unavailable`)}`}
            >
              {locale.toUpperCase()}
            </span>
          );

        return (
          <Link
            key={locale}
            lang={locale}
            hrefLang={locale}
            aria-label={name}
            className={itemClass}
            aria-current={isCurrent ? "true" : undefined}
            href={switchLocalePath(pathname, search, locale)}
          >
            {locale.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
};

const LinksWithSearch = (props: TLanguageLinksProps) => {
  const query = useSearchParams().toString();
  return <LinkList {...props} search={query ? `?${query}` : ""} />;
};

export const LanguageLinks = (props: TLanguageLinksProps) => {
  const pathname = usePathname();

  if (!isCatalogPath(pathname)) return <LinkList {...props} search="" />;

  return (
    <Suspense fallback={<LinkList {...props} search="" />}>
      <LinksWithSearch {...props} />
    </Suspense>
  );
};
