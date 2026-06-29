"use client";

type TOrgMembersHeader = {
  t: (key: string, values?: Record<string, number>) => string;
};

export const OrgMembersHeader = ({ t }: TOrgMembersHeader) => {
  return (
    <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="text-sm font-medium text-primary">
          {t("organizationDashboard.members.eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          {t("organizationDashboard.members.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          {t("organizationDashboard.members.description")}
        </p>
      </div>
    </section>
  );
};
