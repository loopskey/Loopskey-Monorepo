"use client";

type OrgAssignmentsHeaderProps = {
  t: (key: string, values?: Record<string, number>) => string;
};

export const OrgAssignmentsHeader = ({ t }: OrgAssignmentsHeaderProps) => {
  return (
    <section>
      <p className="text-sm font-medium text-primary">
        {t("organizationDashboard.assignments.eyebrow")}
      </p>
      <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
        {t("organizationDashboard.assignments.title")}
      </h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">
        {t("organizationDashboard.assignments.description")}
      </p>
    </section>
  );
};
