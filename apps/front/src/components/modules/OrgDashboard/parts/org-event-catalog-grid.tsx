"use client";

import { OrgEventCatalogCard } from "@modules/OrgDashboard/parts/org-event-catalog-card";
import { TEventCatalogGrid } from "@/types/org-dashboard.types";

export const OrgEventCatalogGrid = ({
  t,
  events,
  isLoading,
  openAssignView,
}: TEventCatalogGrid) => {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <OrgEventCatalogCard
          t={t}
          event={event}
          key={event.id}
          isLoading={isLoading}
          openAssignView={openAssignView}
        />
      ))}
    </div>
  );
};
