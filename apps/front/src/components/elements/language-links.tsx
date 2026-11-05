"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { TLanguageLinksProps } from "@/types/element.types";
import { stripLocalePrefix } from "@/lib/i18n/locale";
import { LanguageSwitch } from "@elements/language-switch";
import { Suspense } from "react";

type TLinkListProps = TLanguageLinksProps & { search: string };

const isCatalogPath = (pathname: string) =>
  stripLocalePrefix(pathname).startsWith("/content");

const LinkList = ({ search, available, className }: TLinkListProps) => (
  <LanguageSwitch search={search} available={available} className={className} />
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
