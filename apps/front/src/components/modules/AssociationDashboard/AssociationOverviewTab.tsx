"use client";

import { AssociationOverviewRequirements } from "@modules/AssociationDashboard/parts/association-overview-requirements";
import { AssociationOverviewAttention } from "@modules/AssociationDashboard/parts/association-overview-attention";
import { AssociationOverviewActivity } from "@modules/AssociationDashboard/parts/association-overview-activity";
import { useAssociationOverviewTab } from "@hooks/useAssociationOverviewTab";
import { AssociationOverviewCharts } from "@modules/AssociationDashboard/parts/association-overview-charts";
import { AssociationOverviewEmpty } from "@modules/AssociationDashboard/parts/association-overview-empty";
import { AssociationOverviewCards } from "@modules/AssociationDashboard/parts/association-overview-cards";
import { Skeleton } from "@ui/skeleton";

const AssociationOverviewTab = () => {
  const hook = useAssociationOverviewTab();

  const {
    t,
    associationName,
    isNewAssociation,
    isProfileLoading,
    associationDescription,
  } = hook;

  const label = (key: string) => t(`associationDashboard.overview.${key}`);

  const header = (
    <section>
      <p className="text-sm font-medium text-primary">
        {t("associationDashboard.eyebrow")}
      </p>

      {isProfileLoading ? (
        <Skeleton className="mt-2 h-10 w-72 rounded-md" />
      ) : (
        <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          {associationName ?? label("title")}
        </h1>
      )}

      <p className="mt-2 max-w-3xl text-muted-foreground">
        {associationDescription ?? label("description")}
      </p>
    </section>
  );

  if (isNewAssociation)
    return (
      <div className="space-y-6">
        {header}

        <AssociationOverviewEmpty />
      </div>
    );

  return (
    <div className="space-y-6">
      {header}
      <AssociationOverviewCards hook={hook} />
      <div className="grid gap-6 xl:grid-cols-2">
        <AssociationOverviewAttention hook={hook} />
        <AssociationOverviewRequirements hook={hook} />
      </div>
      <AssociationOverviewCharts hook={hook} />
      <AssociationOverviewActivity hook={hook} />
    </div>
  );
};

export default AssociationOverviewTab;
