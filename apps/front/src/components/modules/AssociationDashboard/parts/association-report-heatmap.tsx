"use client";

import { TAssociationGroupProgressRow } from "@/types/association-dashboard.types";
import { semanticChartColor } from "@hooks/useChartPalette";
import { useChartSemantics } from "@hooks/useChartPalette";
import { THeatmapProps, THeatmapRowProps } from "@/types/association-dashboard.types";
import { chartTone } from "@utils/association-reports";
import { Skeleton } from "@ui/skeleton";

import * as API from "@lib/rtk/endpoints/association-dashboard.api";

const HeatmapRow = ({
  tone,
  label,
  filter,
  locale,
  groupId,
  columns,
  groupTitle,
}: THeatmapRowProps) => {
  const query = API.useAssociationProgressByCategoryQuery({
    filter: { ...filter, groupId },
  });

  const percentOf = (categoryId: string) =>
    (query.data ?? []).find((row) => row.categoryId === categoryId)
      ?.averagePercent ?? null;

  return (
    <tr className="border-b border-glass-border/70">
      <th scope="row" className="py-2 pr-4 text-left font-medium">
        {groupTitle}
      </th>

      {columns.map((column) => {
        const percent = percentOf(column.id);

        if (query.isLoading)
          return (
            <td key={column.id} className="p-1">
              <Skeleton className="h-9 w-full rounded-xl" />
            </td>
          );

        return (
          <td key={column.id} className="p-1">
            <span
              className="flex h-9 items-center justify-center rounded-xl tabular-nums"
              style={{
                backgroundColor:
                  percent === null ? undefined : chartTone(tone, percent / 100),
              }}
            >
              {percent === null
                ? label("table.none")
                : `${percent.toLocaleString(locale)}%`}
            </span>
          </td>
        );
      })}
    </tr>
  );
};

export const AssociationReportHeatmap = ({
  label,
  groups,
  filter,
  locale,
  columns,
}: THeatmapProps) => {
  const semantics = useChartSemantics();

  const named = groups.filter(
    (group): group is TAssociationGroupProgressRow & { groupId: string } =>
      Boolean(group.groupId),
  );

  if (columns.length === 0 || named.length === 0)
    return (
      <div className="rounded-3xl border border-dashed border-glass-border py-10 text-center text-sm text-muted-foreground">
        {label("heatmap.empty")}
      </div>
    );

  const tone = semanticChartColor(semantics, "renewalReady");

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {label("heatmap.description")}
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">{label("heatmap.caption")}</caption>

          <thead className="text-xs uppercase text-muted-foreground">
            <tr className="border-b border-glass-border">
              <th scope="col" className="py-3 pr-4 text-left">
                {label("heatmap.group")}
              </th>

              {columns.map((column) => (
                <th key={column.id} scope="col" className="px-1 py-3">
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {named.map((group) => (
              <HeatmapRow
                tone={tone}
                label={label}
                filter={filter}
                locale={locale}
                columns={columns}
                key={group.groupId}
                groupId={group.groupId}
                groupTitle={group.groupTitle ?? group.groupId}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {label("heatmap.limited", { count: named.length })}
      </p>
    </div>
  );
};
