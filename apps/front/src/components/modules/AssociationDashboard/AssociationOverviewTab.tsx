"use client";

import { useAssociationProfileQuery } from "@lib/rtk/endpoints/association-dashboard.api";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { useI18n } from "@hooks/useI18n";

import * as L from "lucide-react";

const AssociationOverviewTab = () => {
  const { t } = useI18n();
  const { data, isLoading, isError } = useAssociationProfileQuery();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-primary">
          {t("associationDashboard.eyebrow")}
        </p>

        {isLoading ? (
          <Skeleton className="mt-2 h-10 w-72 rounded-2xl" />
        ) : (
          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {data?.name ?? t("associationDashboard.overview.title")}
          </h1>
        )}

        <p className="mt-2 max-w-3xl text-muted-foreground">
          {data?.description ?? t("associationDashboard.overview.description")}
        </p>
      </section>

      {isError && (
        <GlassCard className="relative" glow={false}>
          <p role="alert" className="text-muted-foreground">
            {t("associationDashboard.overview.loadFailed")}
          </p>
        </GlassCard>
      )}

      {!isError && !isLoading && data && (
        <GlassCard className="relative" glow={false}>
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">
                {t("associationDashboard.overview.contactEmail")}
              </dt>
              <dd className="mt-1 font-medium">{data.contactEmail ?? "—"}</dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                {t("associationDashboard.overview.country")}
              </dt>
              <dd className="mt-1 font-medium">{data.country ?? "—"}</dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                {t("associationDashboard.overview.website")}
              </dt>
              <dd className="mt-1 font-medium">
                {data.website ? (
                  <a
                    rel="noreferrer noopener"
                    target="_blank"
                    href={data.website}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {data.website}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </GlassCard>
      )}

      <GlassCard className="relative" glow={false}>
        <div className="flex items-start gap-3">
          <L.Compass className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-muted-foreground">
            {t("associationDashboard.overview.comingSoon")}
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default AssociationOverviewTab;
