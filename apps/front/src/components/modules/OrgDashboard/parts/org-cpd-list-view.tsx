"use client";

import { OrgCpdCategoryFilters } from "@modules/OrgDashboard/parts/org-cpd-filters";
import { OrgCpdCategoryHeader } from "@modules/OrgDashboard/parts/org-cpd-header";
import { OrgCpdCategoryStats } from "@modules/OrgDashboard/parts/org-cpd-stats";
import { OrgCpdCategoryCard } from "@modules/OrgDashboard/parts/org-cpd-card";
import { ContentPagination } from "@elements/pagination";
import { TCPDListView } from "@/types/org-dashboard.types";
import { GlassCard } from "@elements/glass-card";

export const OrgCpdCategoryListView = ({ hook }: TCPDListView) => {
  const {
    t,
    page,
    nextPage,
    isLoading,
    categories,
    totalCount,
    canPrevious,
    hasNextPage,
    previousPage,
  } = hook;

  return (
    <div className="space-y-6">
      <OrgCpdCategoryHeader hook={hook} />
      <OrgCpdCategoryStats hook={hook} />

      <GlassCard>
        <div className="relative z-10 space-y-6">
          <OrgCpdCategoryFilters hook={hook} />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((item) => (
              <OrgCpdCategoryCard
                t={t}
                item={item}
                key={item.id}
                isLoading={isLoading}
                onEdit={hook.openEditView}
                onDelete={hook.removeCategory}
                onToggle={hook.toggleCategoryStatus}
              />
            ))}
          </div>

          {!categories.length && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {t("organizationDashboard.cpd.empty")}
            </div>
          )}

          <ContentPagination
            page={page}
            onNext={nextPage}
            isLoading={isLoading}
            totalCount={totalCount}
            canPrevious={canPrevious}
            onPrevious={previousPage}
            hasNextPage={hasNextPage}
          />
        </div>
      </GlassCard>
    </div>
  );
};
