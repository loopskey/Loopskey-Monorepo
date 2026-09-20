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
      <div className="mx-auto max-w-7xl space-y-8">
        <ContentSearchHero value={search} onChange={setSearch} />

        <div className="sticky top-28 z-30 -mx-4 flex flex-col gap-4 border-y border-border/70 bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <AnimatedTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
          <FilterPanel {...filterPanelProps} />
        </div>

        <section className="min-w-0 space-y-6">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: TAKE }).map((_, index) => (
                <ContentCardSkeleton key={index} />
              ))}
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
    </main>
  );
};

export default ContentPage;
