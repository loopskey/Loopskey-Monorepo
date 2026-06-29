"use client";

type OrgEventCatalogHeaderProps = {
  t: (key: string, values?: Record<string, number>) => string;
};

export const OrgEventCatalogHeader = ({ t }: OrgEventCatalogHeaderProps) => {
  return (
    <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="text-sm font-medium text-primary">
          {t("organizationDashboard.eventCatalog.eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          {t("organizationDashboard.eventCatalog.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          {t("organizationDashboard.eventCatalog.description")}
        </p>
      </div>
    </section>
  );
};
