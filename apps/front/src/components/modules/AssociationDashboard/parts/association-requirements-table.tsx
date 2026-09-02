"use client";

import { TAssociationRequirementsTable } from "@/types/association-dashboard.types";
import { TAssociationRequirementRow } from "@/types/association-dashboard.types";
import { AssociationRequirementStatus } from "@/lib/graphql/base";
import { useChartPalette } from "@hooks/useChartPalette";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import dynamic from "next/dynamic";

import * as D from "@ui/dropdown-menu";
import * as L from "lucide-react";

import type { ReactNode } from "react";

const DONUT_SIZE = 44;

const CoverageChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-requirement-coverage-chart"
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-11 w-11 rounded-full" />,
  },
);

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
  const palette = useChartPalette();

  const {
    t,
    goTo,
    locale,
    isSaving,
    rosterSize,
    isRefetching,
    requirements,
    archiveRequirement,
  } = hook;

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
            {t(
              `associationDashboard.requirements.cycle.${requirement.reportingCycle}`,
            )}
          </p>
        </div>
      ),
    },
    {
      id: "credits",
      header: t("associationDashboard.requirements.table.credits"),
      cell: (requirement) =>
        `${requirement.totalRequiredCredits.toLocaleString(locale)} ${requirement.creditType}`,
    },
    {
      id: "deadline",
      header: t("associationDashboard.requirements.table.deadline"),
      cell: (requirement) => formatDate(requirement.deadline),
    },
    {
      id: "audience",
      header: t("associationDashboard.requirements.table.audience"),
      cell: audienceLabel,
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
    {
      id: "covered",
      header: t("associationDashboard.requirements.table.covered"),
      cell: (requirement) => (
        <div className="flex items-center gap-3">
          <CoverageChart
            palette={palette}
            size={DONUT_SIZE}
            covered={requirement.assignedMemberCount}
            total={Math.max(rosterSize, requirement.assignedMemberCount)}
            chartLabel={t(
              "associationDashboard.requirements.chart.rowCoverageLabel",
              { name: requirement.name },
            )}
            coveredLabel={t("associationDashboard.requirements.chart.covered")}
            uncoveredLabel={t(
              "associationDashboard.requirements.chart.uncovered",
            )}
            chartDescription={t(
              "associationDashboard.requirements.chart.coverageDescription",
              {
                covered: requirement.assignedMemberCount,
                total: Math.max(rosterSize, requirement.assignedMemberCount),
              },
            )}
          />

          <span className="tabular-nums">
            {requirement.assignedMemberCount.toLocaleString(locale)}
          </span>
        </div>
      ),
    },
  ];

  const rowActions = (requirement: TAssociationRequirementRow) => (
    <D.DropdownMenu>
      <D.DropdownMenuTrigger asChild>
        <Button
          size="sm"
          radius="xl"
          type="button"
          variant="glass"
          disabled={isSaving}
          aria-label={t("associationDashboard.requirements.table.actionsFor", {
            name: requirement.name,
          })}
        >
          <L.MoreHorizontal className="h-4 w-4" />
        </Button>
      </D.DropdownMenuTrigger>

      <D.DropdownMenuContent align="end" className="z-[9999] rounded-2xl">
        <D.DropdownMenuItem onSelect={() => goTo(requirement.id)}>
          <L.Eye className="h-4 w-4" />
          {t("associationDashboard.requirements.actions.open")}
        </D.DropdownMenuItem>

        {requirement.status === AssociationRequirementStatus.Draft && (
          <D.DropdownMenuItem onSelect={() => goTo(requirement.id, "details")}>
            <L.PencilLine className="h-4 w-4" />
            {t("associationDashboard.requirements.actions.continueDraft")}
          </D.DropdownMenuItem>
        )}

        {requirement.status !== AssociationRequirementStatus.Archived && (
          <ConfirmDialog
            isLoading={isSaving}
            confirmVariant="destructive"
            title={t("associationDashboard.requirements.confirm.archiveTitle")}
            cancelText={t("associationDashboard.requirements.confirm.cancel")}
            confirmText={t(
              "associationDashboard.requirements.confirm.archiveConfirm",
            )}
            description={t(
              "associationDashboard.requirements.confirm.archiveBody",
              { name: requirement.name },
            )}
            onConfirm={() => archiveRequirement(requirement.id)}
            trigger={
              <D.DropdownMenuItem
                variant="destructive"
                onSelect={(event) => event.preventDefault()}
              >
                <L.Archive className="h-4 w-4" />
                {t("associationDashboard.requirements.actions.archive")}
              </D.DropdownMenuItem>
            }
          />
        )}
      </D.DropdownMenuContent>
    </D.DropdownMenu>
  );

  if (isRefetching) {
    return (
      <div className="mt-6 space-y-3" aria-busy="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-2xl" />
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
            <tr className="border-b border-glass-border">
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
                className="border-b border-glass-border/70 transition-colors hover:bg-primary/5"
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
          <li
            key={requirement.id}
            className="rounded-3xl border border-glass-border bg-background/50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{requirement.name}</p>

                <p className="text-xs text-muted-foreground">
                  {t(
                    `associationDashboard.requirements.cycle.${requirement.reportingCycle}`,
                  )}
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
