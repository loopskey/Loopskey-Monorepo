"use client";

import { TAssociationGroupProgressRow } from "@/types/association-dashboard.types";
import { Heatmap, HeatmapRow } from "@elements/charts/heatmap";
import { THeatmapRowProps } from "@/types/association-dashboard.types";
import { THeatmapProps } from "@/types/association-dashboard.types";
import { ChartFrame } from "@elements/charts/chart-frame";

import * as API from "@lib/rtk/endpoints/association-dashboard.api";

const GroupHeatmapRow = ({
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

  return (
    <HeatmapRow
      label={groupTitle}
      isLoading={query.isLoading}
      emptyLabel={label("table.none")}
      valueName={label("chartTable.completion")}
      columns={columns.map((column) => ({ id: column.id, label: column.name }))}
      formatValue={(value) => `${value.toLocaleString(locale)}%`}
      values={columns.map(
        (column) =>
          (query.data ?? []).find((row) => row.categoryId === column.id)
            ?.averagePercent ?? null,
      )}
    />
  );
};

export const AssociationReportHeatmap = ({
  label,
  groups,
  filter,
  locale,
  columns,
}: THeatmapProps) => {
  const named = groups.filter(
    (group): group is TAssociationGroupProgressRow & { groupId: string } =>
      Boolean(group.groupId),
  );

  return (
    <ChartFrame
      headingLevel="h3"
      title={label("heatmap.title")}
      emptyLabel={label("heatmap.empty")}
      description={label("heatmap.description")}
      isEmpty={columns.length === 0 || named.length === 0}
    >
      <div className="grid gap-3">
        <Heatmap
          label={label("heatmap.caption")}
          rowHeader={label("heatmap.group")}
          scaleLabel={label("chartTable.completion")}
          columns={columns.map((column) => ({
            id: column.id,
            label: column.name,
          }))}
        >
          {named.map((group) => (
            <GroupHeatmapRow
              label={label}
              filter={filter}
              locale={locale}
              columns={columns}
              key={group.groupId}
              groupId={group.groupId}
              groupTitle={group.groupTitle ?? group.groupId}
            />
          ))}
        </Heatmap>
        <p className="text-xs text-muted-foreground">
          {label("heatmap.limited", { count: named.length })}
        </p>
      </div>
    </ChartFrame>
  );
};
