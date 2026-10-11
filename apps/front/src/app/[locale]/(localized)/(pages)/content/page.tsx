import { permanentRedirect } from "next/navigation";
import { loadDictionary } from "@/i18n/dictionaries";
import { noindexMetadata } from "@/lib/site/page-metadata";
import { publicPageMetadata } from "@/lib/site/page-metadata";
import { readCatalog, readCatalogFacets } from "@/lib/server/catalog-reader";
import { isCanonicalRequest } from "@/lib/content-catalog/query-state";
import { parseCatalogQuery } from "@/lib/content-catalog/query-state";
import { firstPageHref } from "@/lib/content-catalog/catalog-href";
import { hasContentFilters } from "@/lib/content-catalog/catalog-href";
import { tabHref, withCursor } from "@/lib/content-catalog/catalog-href";
import { asPublicLocale } from "@/lib/i18n/route-locale";
import { localizePath } from "@/lib/i18n/locale";

import ContentCatalogPagination from "@modules/Content/ContentCatalogPagination";
import ContentResultsHeading from "@modules/Content/ContentResultsHeading";
import ContentFilterForm from "@modules/Content/ContentFilterForm";
import ContentSearchHero from "@modules/Content/ContentSearchHero";
import ContentResults from "@modules/Content/ContentResults";
import CatalogNotice from "@modules/Content/CatalogNotice";
import ContentTabs from "@modules/Content/ContentTabs";
import EmptyState from "@modules/Content/EmptyState";

import type { CatalogQuery } from "@/lib/content-catalog/catalog-href";
import type { RawSearchParams } from "@/lib/content-catalog/query-state";
import type { PublicLocale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/i18n/dictionaries";
import type { TContentTab } from "@/types/content-module.types";
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type TContentPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
};

type TCatalogLayoutProps = {
  tab: TContentTab;
  children: ReactNode;
  filters?: ReactNode;
  totalCount?: number;
};

const tabMeta = (dictionary: Dictionary, tab: TContentTab) => {
  const { meta } = dictionary.content;
  return tab === "courses" ? meta : meta.tabs[tab];
};

const pageMetadata = (
  dictionary: Dictionary,
  href: string,
  tab: TContentTab,
  locale: PublicLocale,
  isIndexable: boolean,
) => {
  const { title, description } = tabMeta(dictionary, tab);
  const metadata = publicPageMetadata({
    title,
    description,
    path: href,
    locale,
    isTitleBranded: true,
  });
  return isIndexable
    ? metadata
    : { ...metadata, robots: { index: false, follow: true } };
};

export const generateMetadata = async ({
  params,
  searchParams,
}: TContentPageProps): Promise<Metadata> => {
  const locale = asPublicLocale((await params).locale);
  const dictionary = await loadDictionary(locale);
  const parsed = parseCatalogQuery(await searchParams);
  if (parsed.kind === "invalid")
    return {
      ...pageMetadata(
        dictionary,
        tabHref(parsed.tab),
        parsed.tab,
        locale,
        false,
      ),
      ...noindexMetadata(),
    };

  const { query, canonicalHref } = parsed;
  let isIndexable = !hasContentFilters(query);
  if (isIndexable && query.after)
    isIndexable = (await readCatalog(query, locale)).kind === "page";
  return pageMetadata(
    dictionary,
    canonicalHref,
    query.tab,
    locale,
    isIndexable,
  );
};

const CatalogLayout = ({
  tab,
  filters,
  children,
  totalCount,
}: TCatalogLayoutProps) => (
  <main className="py-6">
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ContentSearchHero activeTab={tab} totalCount={totalCount} />
          <ContentTabs activeTab={tab} />
        </div>
        {filters}
      </div>

      <section
        aria-labelledby="catalog-results-heading"
        className="min-w-0 space-y-6"
      >
        <ContentResultsHeading />
        {children}
      </section>
    </div>
  </main>
);

const paginationLinks = (
  query: CatalogQuery,
  pageInfo: {
    hasNextPage: boolean;
    nextCursor?: string | null;
    hasPreviousPage: boolean;
    previousCursor?: string | null;
  },
) => ({
  nextHref:
    pageInfo.hasNextPage && pageInfo.nextCursor
      ? withCursor(query, pageInfo.nextCursor)
      : null,
  previousHref: pageInfo.hasPreviousPage
    ? withCursor(query, pageInfo.previousCursor ?? null)
    : null,
});

const ContentPage = async ({ params, searchParams }: TContentPageProps) => {
  const locale = asPublicLocale((await params).locale);
  const rawParams = await searchParams;
  const parsed = parseCatalogQuery(rawParams);

  if (parsed.kind === "invalid")
    return (
      <CatalogLayout tab={parsed.tab}>
        <CatalogNotice variant="invalid" restartHref={tabHref(parsed.tab)} />
      </CatalogLayout>
    );

  const { query, canonicalHref } = parsed;
  if (!isCanonicalRequest(rawParams, canonicalHref))
    permanentRedirect(localizePath(canonicalHref, locale));

  const [read, facets] = await Promise.all([
    readCatalog(query, locale),
    readCatalogFacets(query.tab),
  ]);

  if (read.kind !== "page")
    return (
      <CatalogLayout tab={query.tab}>
        <CatalogNotice
          restartHref={firstPageHref(query)}
          variant={read.kind === "expired-cursor" ? "expired" : "invalid"}
        />
      </CatalogLayout>
    );

  const { page } = read;
  const hasFilters = hasContentFilters(query);
  const { nextHref, previousHref } = paginationLinks(query, page.pageInfo);

  return (
    <CatalogLayout
      tab={query.tab}
      totalCount={page.totalCount}
      filters={
        <ContentFilterForm
          tab={query.tab}
          facets={facets}
          retryHref={canonicalHref}
          hasActiveFilters={hasFilters}
          resetHref={tabHref(query.tab)}
          values={{
            q: query.search ?? "",
            category: query.category ?? "",
            level: query.level ?? "",
            rating: query.rating ?? "",
            eventType: query.eventType ?? "",
          }}
        />
      }
    >
      {page.items.length > 0 ? (
        <>
          <ContentResults page={page} />
          {(nextHref || previousHref) && (
            <ContentCatalogPagination
              nextHref={nextHref}
              previousHref={previousHref}
              totalCount={page.totalCount}
            />
          )}
        </>
      ) : (
        <EmptyState resetHref={hasFilters ? tabHref(query.tab) : undefined} />
      )}
    </CatalogLayout>
  );
};

export default ContentPage;
