"use client";

import { OrgEventCatalogFilters } from "@modules/OrgDashboard/parts/org-event-catalog-filters";
import { OrgEventCatalogHeader } from "@modules/OrgDashboard/parts/org-event-catalog-header";
import { useOrgEventCatalogTab } from "@/hooks/useOrgEventCatalogTab";
import { OrgEventCatalogGrid } from "@modules/OrgDashboard/parts/org-event-catalog-grid";
import { OrgEventAssignView } from "@modules/OrgDashboard/parts/org-event-assign-view";
import { ContentPagination } from "@elements/pagination";
import { GlassCard } from "@elements/glass-card";

const OrgEventCatalogTab = () => {
  const hook = useOrgEventCatalogTab();

  const {
    t,
    page,
    events,
    nextPage,
    isLoading,
    totalCount,
    canPrevious,
    hasNextPage,
    previousPage,
    isAssignViewOpen,
  } = hook;

  if (isAssignViewOpen) return <OrgEventAssignView hook={hook} />;

  return (
    <div className="space-y-6">
      <OrgEventCatalogHeader t={t} />

      <OrgEventCatalogFilters hook={hook} />

      <OrgEventCatalogGrid
        t={t}
        events={events}
        isLoading={isLoading}
        openAssignView={hook.openAssignView}
      />

      {!events.length && (
        <GlassCard>
          <div className="relative z-10 py-10 text-center text-sm text-muted-foreground">
            {t("organizationDashboard.eventCatalog.empty")}
          </div>
        </GlassCard>
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
  );
};

export default OrgEventCatalogTab;
