import type * as T from "@/types/data-table.types";

const PAGE_WINDOW_EDGE = 1;
const PAGE_WINDOW_SPREAD = 1;

export type PageWindowEntry = number | "gap-start" | "gap-end";

export const pageWindow = (
  page: number,
  pageCount: number,
): PageWindowEntry[] => {
  const pages = new Set<number>();

  for (let index = 1; index <= Math.min(PAGE_WINDOW_EDGE, pageCount); index++)
    pages.add(index);
  for (
    let index = Math.max(1, page - PAGE_WINDOW_SPREAD);
    index <= Math.min(pageCount, page + PAGE_WINDOW_SPREAD);
    index++
  )
    pages.add(index);
  for (
    let index = Math.max(1, pageCount - PAGE_WINDOW_EDGE + 1);
    index <= pageCount;
    index++
  )
    pages.add(index);

  const sorted = [...pages].sort((left, right) => left - right);

  return sorted.flatMap<PageWindowEntry>((entry, index) => {
    const previous = sorted[index - 1];
    if (previous === undefined || entry - previous === 1) return [entry];
    if (entry - previous === 2) return [previous + 1, entry];
    return [entry < page ? "gap-start" : "gap-end", entry];
  });
};

export const presentFilters = (
  filters: T.DataTableFiltersProps["filters"],
): T.DataTableFilter[] =>
  (filters ?? []).filter((filter): filter is T.DataTableFilter =>
    Boolean(filter),
  );

export const isFilterActive = (filter: T.DataTableFilter) => {
  if (filter.type === "select") return filter.value !== filter.defaultValue;
  if (filter.type === "toggle") return filter.value;
  return filter.value !== "";
};

export const selectedOptionLabel = (filter: T.DataTableSelectFilter) =>
  filter.options.find((option) => option.value === filter.value)?.label ??
  filter.value;

export const clearFilter = (filter: T.DataTableFilter) => {
  if (filter.type === "select") filter.onChange(filter.defaultValue);
  else if (filter.type === "toggle") filter.onChange(false);
  else filter.onChange("");
};

export const nextSort = (
  current: T.DataTableSort | undefined,
  columnId: string,
): T.DataTableSort => {
  if (current?.id !== columnId) return { id: columnId, direction: "asc" };
  return {
    id: columnId,
    direction: current.direction === "asc" ? "desc" : "asc",
  };
};

export const mobileSlotOf = <Row>(
  column: T.DataTableColumn<Row>,
  index: number,
  columns: T.DataTableColumn<Row>[],
): T.DataTableMobileSlot => {
  if (column.mobile) return column.mobile;
  const hasTitle = columns.some((entry) => entry.mobile === "title");
  return !hasTitle && index === 0 ? "title" : "meta";
};
