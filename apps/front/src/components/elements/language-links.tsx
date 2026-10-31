"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { TLanguageLinksProps } from "@/types/element.types";
import { stripLocalePrefix } from "@/lib/i18n/locale";
import { LanguageMenu } from "@elements/language-menu";
import { Suspense } from "react";

import type { PublicLocale } from "@/lib/i18n/locale";

type TLinkListProps = TLanguageLinksProps & { search: string };

const LANGUAGE_NAME_KEY: Record<PublicLocale, string> = {
  en: "common.english",
  fr: "common.french",
};

const isCatalogPath = (pathname: string) =>
  stripLocalePrefix(pathname).startsWith("/content");

const LinkList = ({ search, available, className }: TLinkListProps) => (
  <LanguageMenu
    search={search}
    available={available}
    className={className}
    nameKeys={LANGUAGE_NAME_KEY}
  />
);

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
