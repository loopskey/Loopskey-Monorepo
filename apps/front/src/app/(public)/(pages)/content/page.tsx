"use client";

import { ContentPagination } from "@elements/pagination";
import { useContentPage } from "@/hooks/useContentPage";

import ContentCardSkeleton from "@modules/Content/ContentCardSkeleton";
import ContentSearchHero from "@modules/Content/ContentSearchHero";
import ContentTabs from "@modules/Content/ContentTabs";
import FilterPanel from "@modules/Content/FilterPanel";
import ContentCard from "@modules/Content/ContentCard";
import EmptyState from "@modules/Content/EmptyState";

const CARD_GRID_CLASS_NAME =
  "grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4";

const ContentPage = () => {
  const {
    t,
    TAKE,
    tabs,
    items,
    goNext,
    activeTab,
    isLoading,
    goPrevious,
    activeData,
    setActiveTab,
    currentCursor,
    filterPanelProps,
  } = useContentPage();

  return (
    <main className="py-6">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ContentSearchHero
              activeTab={activeTab}
              totalCount={activeData?.totalCount}
            />

            <ContentTabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              label={t("content.tabs.label")}
            />
          </div>

          <FilterPanel {...filterPanelProps} />
        </div>

        <section className="min-w-0 space-y-6">
          {isLoading ? (
            <div className={CARD_GRID_CLASS_NAME}>
              {Array.from({ length: TAKE }).map((_, index) => (
                <ContentCardSkeleton key={index} />
              ))}
            </div>
          ) : items.length > 0 ? (
            <>
              <div className={CARD_GRID_CLASS_NAME}>
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
