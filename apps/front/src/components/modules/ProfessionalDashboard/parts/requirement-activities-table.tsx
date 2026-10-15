"use client";

import { REQUIREMENT_TONE_CLASSES } from "@/utils/professional-requirement.helper";
import { ClipboardList } from "lucide-react";
import { formatDate } from "@/utils/function-helper";
import { DataTable } from "@elements/data-table/data-table";
import { GlassCard } from "@elements/glass-card";
import { useState } from "react";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { cn } from "@/lib/utils";

import type { TRequirementActivitiesTableProps } from "@/types/professional-requirement.types";

const KEY = "cpdProgress.requirements.activities";
const PREVIEW_COUNT = 5;

export const RequirementActivitiesTable = ({
  t,
  rows,
  isLoading,
}: TRequirementActivitiesTableProps) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? rows : rows.slice(0, PREVIEW_COUNT);
  const hiddenCount = rows.length - PREVIEW_COUNT;

  return (
    <GlassCard>
      <h2 className="mb-3 text-sm font-medium">{t(`${KEY}.title`)}</h2>

      <DataTable
        rows={visible}
        skeletonRows={3}
        isLoading={isLoading}
        rowKey={(row) => row.id}
        caption={t(`${KEY}.title`)}
        empty={{ icon: ClipboardList, title: t(`${KEY}.empty`) }}
        columns={[
          {
            id: "activity",
            mobile: "title",
            className: "max-w-72",
            header: t(`${KEY}.columns.activity`),
            cell: (row) => (
              <span className="block min-w-0">
                <span className="block truncate font-medium" title={row.title}>
                  {row.title}
                </span>
                {row.note ? (
                  <span className="mt-1 block whitespace-normal text-xs font-normal text-muted-foreground">
                    {row.note}
                  </span>
                ) : null}
              </span>
            ),
          },
          {
            id: "status",
            mobile: "badge",
            header: t(`${KEY}.columns.status`),
            cell: (row) => (
              <span className="flex flex-wrap items-center gap-1.5">
                <Badge
                  className={cn(
                    "border-transparent",
                    REQUIREMENT_TONE_CLASSES[row.tone],
                  )}
                >
                  {row.statusLabel}
                </Badge>
                {row.isLate ? (
                  <Badge variant="outline">{t(`${KEY}.late`)}</Badge>
                ) : null}
              </span>
            ),
          },
          {
            id: "date",
            header: t(`${KEY}.columns.date`),
            cell: (row) => formatDate(row.date),
          },
          {
            id: "category",
            header: t(`${KEY}.columns.category`),
            cell: (row) => row.category,
          },
          {
            id: "credits",
            align: "end",
            header: t(`${KEY}.columns.credits`),
            cell: (row) => row.credits,
          },
        ]}
      />

      {!isLoading && !showAll && hiddenCount > 0 ? (
        <Button
          size="sm"
          radius="lg"
          type="button"
          variant="ghost"
          className="mt-3 w-full justify-center"
          onClick={() => setShowAll(true)}
        >
          {t(`${KEY}.viewAll`, { count: rows.length })}
        </Button>
      ) : null}
    </GlassCard>
  );
};

export default RequirementActivitiesTable;
