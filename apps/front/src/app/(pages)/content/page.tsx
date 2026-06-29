"use client";

import { ContentPagination } from "@elements/pagination";
import { useContentPage } from "@/hooks/useContentPage";
import { AnimatedTabs } from "@elements/animated-tabs";

import ContentCardSkeleton from "@modules/Content/ContentCardSkeleton";
import ContentSearchHero from "@modules/Content/ContentSearchHero";
import FilterPanel from "@modules/Content/FilterPanel";
import ContentCard from "@modules/Content/ContentCard";
import EmptyState from "@modules/Content/EmptyState";

const ContentPage = () => {
  const {
    TAKE,
    tabs,
    items,
    search,
    goNext,
    activeTab,
    setSearch,
    isLoading,
    goPrevious,
    activeData,
    setActiveTab,
    currentCursor,
    filterPanelProps,
  } = useContentPage();

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <ContentSearchHero value={search} onChange={setSearch} />

        <AnimatedTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <FilterPanel {...filterPanelProps} />
          </aside>

          <section className="min-w-0 space-y-6">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
                {Array.from({ length: TAKE }).map((_, index) => (
                  <ContentCardSkeleton key={index} />
                ))}
              </div>
            ) : items.length > 0 ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
                  {items.map((item) => (
                    <ContentCard key={`${item.kind}-${item.id}`} item={item} />
                  ))}
                </div>

                <ContentPagination
                  onNext={goNext}
                  isLoading={isLoading}
                  onPrevious={goPrevious}
                  page={currentCursor.page}
                  totalCount={activeData?.totalCount}
                  hasNextPage={activeData?.pageInfo.hasNextPage}
                  canPrevious={currentCursor.history.length > 0}
                />
              </>
            ) : (
              <EmptyState />
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default ContentPage;
