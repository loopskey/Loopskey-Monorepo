"use client";

import { TAssociationRequirementsTable } from "@/types/association-dashboard.types";
import { AssociationRequirementStatus } from "@/lib/graphql/base";
import { TAssociationRequirementRow } from "@/types/association-dashboard.types";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

import type { ReactNode } from "react";

type TRequirementColumn = {
  id: string;
  header: string;
  cell: (requirement: TAssociationRequirementRow) => ReactNode;
};

const statusVariant = (status: AssociationRequirementStatus) => {
  if (status === AssociationRequirementStatus.Published)
    return "default" as const;
  if (status === AssociationRequirementStatus.Draft) return "orange" as const;
  return "secondary" as const;
};

export const AssociationRequirementsTable = ({
  hook,
}: TAssociationRequirementsTable) => {
  const { t, goTo, locale, isSaving, isRefetching, requirements } = hook;

  const formatDate = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleDateString(locale) : "-";

  const audienceLabel = (requirement: TAssociationRequirementRow) => {
    const named = requirement.targets
      .map((target) => target.label)
      .filter(Boolean);

    if (named.length) return named.join(", ");
    return t(
      `associationDashboard.requirements.audience.${requirement.audienceKind}`,
    );
  };

  const columns: TRequirementColumn[] = [
    {
      id: "name",
      header: t("associationDashboard.requirements.table.name"),
      cell: (requirement) => (
        <div>
          <p className="font-medium">{requirement.name}</p>

          <p className="text-xs text-muted-foreground">
            {`${requirement.totalRequiredCredits.toLocaleString(locale)} ${requirement.creditType}`}{" "}
            · {audienceLabel(requirement)}
          </p>
        </div>
      ),
    },
    {
      id: "cycle",
      header: t("associationDashboard.requirements.table.cycle"),
      cell: (requirement) =>
        t(
          `associationDashboard.requirements.cycle.${requirement.reportingCycle}`,
        ),
    },
    {
      id: "covered",
      header: t("associationDashboard.requirements.table.covered"),
      cell: (requirement) => (
        <span className="tabular-nums">
          {requirement.assignedMemberCount.toLocaleString(locale)}
        </span>
      ),
    },
    {
      id: "deadline",
      header: t("associationDashboard.requirements.table.deadline"),
      cell: (requirement) => formatDate(requirement.deadline),
    },
    {
      id: "status",
      header: t("associationDashboard.requirements.table.status"),
      cell: (requirement) => (
        <Badge variant={statusVariant(requirement.status)}>
          {t(`associationDashboard.requirements.status.${requirement.status}`)}
        </Badge>
      ),
    },
  ];

  const rowActions = (requirement: TAssociationRequirementRow) => {
    const isDraft = requirement.status === AssociationRequirementStatus.Draft;

    return (
      <div className="flex items-center justify-end gap-2">
        <Button
          size="icon"
          radius="xl"
          type="button"
          variant="outline"
          disabled={isSaving}
          onClick={() => goTo(requirement.id)}
          aria-label={t("associationDashboard.requirements.table.viewFor", {
            name: requirement.name,
          })}
        >
          <L.Eye className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          radius="xl"
          type="button"
          variant="outline"
          disabled={isSaving}
          onClick={() => goTo(requirement.id, isDraft ? "details" : undefined)}
          aria-label={t("associationDashboard.requirements.table.editFor", {
            name: requirement.name,
          })}
        >
          <L.PencilLine className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (isRefetching) {
    return (
      <div className="mt-6 space-y-3" aria-busy="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[860px] text-left text-sm">
          <caption className="sr-only">
            {t("associationDashboard.requirements.table.caption")}
          </caption>

          <thead className="text-xs uppercase text-muted-foreground">
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th key={column.id} scope="col" className="py-3">
                  {column.header}
                </th>
              ))}

              <th scope="col" className="py-3 text-right">
                {t("associationDashboard.requirements.table.actions")}
              </th>
            </tr>
          </thead>

          <tbody>
            {requirements.map((requirement) => (
              <tr
                key={requirement.id}
                className="border-b border-border/70 transition-colors hover:bg-primary/5"
              >
                {columns.map((column) => (
                  <td key={column.id} className="py-4 pr-4 align-middle">
                    {column.cell(requirement)}
                  </td>
                ))}

                <td className="py-4 text-right">{rowActions(requirement)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-6 space-y-3 lg:hidden">
        {requirements.map((requirement) => (
          <li key={requirement.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{requirement.name}</p>

                <p className="text-xs text-muted-foreground">
                  {`${requirement.totalRequiredCredits.toLocaleString(locale)} ${requirement.creditType}`}{" "}
                  · {audienceLabel(requirement)}
                </p>
              </div>

              {rowActions(requirement)}
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {columns
                .filter((column) => column.id !== "name")
                .map((column) => (
                  <div key={column.id}>
                    <dt className="text-xs uppercase text-muted-foreground">
                      {column.header}
                    </dt>

                    <dd className="mt-1">{column.cell(requirement)}</dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
};
