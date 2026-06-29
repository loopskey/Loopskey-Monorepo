"use client";

import { TOrgAssignmentActive } from "@/types/org-dashboard.types";
import { OrgAssignmentsStats } from "@modules/OrgDashboard/parts/org-assignment-stats";
import { ContentPagination } from "@elements/pagination";
import { OrgAssignmentCard } from "@modules/OrgDashboard/parts/org-assignment-card";
import { GlassCard } from "@elements/glass-card";
import { Input } from "@ui/input";

export const OrgAssignmentsActiveView = ({ hook }: TOrgAssignmentActive) => {
  const {
    t,
    page,
    search,
    nextPage,
    setSearch,
    isLoading,
    totalCount,
    canPrevious,
    assignments,
    hasNextPage,
    previousPage,
  } = hook;

  return (
    <div className="space-y-6">
      <OrgAssignmentsStats hook={hook} />
      <GlassCard>
        <div className="relative z-10">
          <Input
            value={search}
            className="max-w-md rounded-2xl"
            placeholder={t("organizationDashboard.assignments.filters.search")}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {assignments.map((item) => (
              <OrgAssignmentCard key={item.id} hook={hook} assignment={item} />
            ))}
          </div>

          {!assignments.length && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {t("organizationDashboard.assignments.empty")}
            </div>
          )}

          <ContentPagination
            page={page}
            className="mt-6"
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
