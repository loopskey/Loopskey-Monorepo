import { readCatalog, readCatalogFacets } from "@/lib/server/catalog-reader";
import { tabHref, withCursor } from "@/lib/content-catalog/catalog-href";
import { publicPageMetadata } from "@/lib/site/page-metadata";
import { isCanonicalRequest } from "@/lib/content-catalog/query-state";
import { permanentRedirect } from "next/navigation";
import { defaultDictionary } from "@/i18n/dictionaries";
import { parseCatalogQuery } from "@/lib/content-catalog/query-state";
import { hasContentFilters } from "@/lib/content-catalog/catalog-href";
import { noindexMetadata } from "@/lib/site/page-metadata";
import { firstPageHref } from "@/lib/content-catalog/catalog-href";

import ContentCatalogPagination from "@modules/Content/ContentCatalogPagination";
import ContentResultsHeading from "@modules/Content/ContentResultsHeading";
import ContentFilterForm from "@modules/Content/ContentFilterForm";
import ContentSearchHero from "@modules/Content/ContentSearchHero";
import ContentResults from "@modules/Content/ContentResults";
import CatalogNotice from "@modules/Content/CatalogNotice";
import ContentTabs from "@modules/Content/ContentTabs";
import EmptyState from "@modules/Content/EmptyState";

import type { RawSearchParams } from "@/lib/content-catalog/query-state";
import type { CatalogQuery } from "@/lib/content-catalog/catalog-href";
import type { TContentTab } from "@/types/content-module.types";
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type TContentPageProps = {
  searchParams: Promise<RawSearchParams>;
};

type TCatalogLayoutProps = {
  tab: TContentTab;
  children: ReactNode;
  filters?: ReactNode;
  totalCount?: number;
};

const tabMeta = (tab: TContentTab) => {
  const { meta } = defaultDictionary.content;
  return tab === "courses" ? meta : meta.tabs[tab];
};

const pageMetadata = (href: string, tab: TContentTab, isIndexable: boolean) => {
  const { title, description } = tabMeta(tab);
  const metadata = publicPageMetadata({
    title,
    description,
    path: href,
    isTitleBranded: true,
  });
  return isIndexable
    ? metadata
    : { ...metadata, robots: { index: false, follow: true } };
};

export const generateMetadata = async ({
  searchParams,
}: TContentPageProps): Promise<Metadata> => {
  const parsed = parseCatalogQuery(await searchParams);
  if (parsed.kind === "invalid")
    return {
      ...pageMetadata(tabHref(parsed.tab), parsed.tab, false),
      ...noindexMetadata(),
    };

  const { query, canonicalHref } = parsed;
  let isIndexable = !hasContentFilters(query);
  if (isIndexable && query.after)
    isIndexable = (await readCatalog(query)).kind === "page";
  return pageMetadata(canonicalHref, query.tab, isIndexable);
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

const ContentPage = async ({ searchParams }: TContentPageProps) => {
  const params = await searchParams;
  const parsed = parseCatalogQuery(params);

  if (parsed.kind === "invalid")
    return (
      <CatalogLayout tab={parsed.tab}>
        <CatalogNotice variant="invalid" restartHref={tabHref(parsed.tab)} />
      </CatalogLayout>
    );

  const { query, canonicalHref } = parsed;
  if (!isCanonicalRequest(params, canonicalHref))
    permanentRedirect(canonicalHref);

  const [read, facets] = await Promise.all([
    readCatalog(query),
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
