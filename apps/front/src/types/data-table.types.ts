import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type DataTableSortDirection = "asc" | "desc";

export type DataTableSort = {
  id: string;
  direction: DataTableSortDirection;
};

export type DataTableMobileSlot = "title" | "badge" | "meta" | "wide" | "hidden";

export type DataTableColumn<Row> = {
  id: string;
  header: string;
  cell: (row: Row) => ReactNode;
  align?: "start" | "end";
  isSortable?: boolean;
  className?: string;
  mobile?: DataTableMobileSlot;
};

export type DataTableConfirm = {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
};

export type DataTableRowAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  isDisabled?: boolean;
  isPending?: boolean;
  tone?: "default" | "danger";
  confirm?: DataTableConfirm;
  onSelect?: () => void | Promise<unknown>;
};

export type DataTableState = {
  title: string;
  icon?: LucideIcon;
  description?: string;
  action?: ReactNode;
};

export type DataTablePagesPagination = {
  kind: "pages";
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  pageSizeOptions?: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

export type DataTableCursorPagination = {
  kind: "cursor";
  page: number;
  total?: number;
  hasNextPage: boolean;
  onNext: () => void;
  onPrevious: () => void;
};

export type DataTablePagination =
  | DataTablePagesPagination
  | DataTableCursorPagination;

export type DataTableSelection<Row> = {
  label: string;
  allLabel: string;
  isDisabled?: boolean;
  selectedKeys: readonly string[];
  onToggle: (key: string) => void;
  onToggleAll: (keys: string[]) => void;
  isSelectable?: (row: Row) => boolean;
};

export type DataTableProps<Row> = {
  caption: string;
  rows: readonly Row[];
  rowKey: (row: Row) => string;
  columns: DataTableColumn<Row>[];
  rowActions?: (row: Row) => DataTableRowAction[];
  selection?: DataTableSelection<Row>;
  inlineActionCount?: number;
  rowLabel?: (row: Row) => string;
  onRowClick?: (row: Row) => void;
  selectedRowKey?: string | null;
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  pagination?: DataTablePagination;
  isLoading?: boolean;
  isFetching?: boolean;
  isFiltered?: boolean;
  error?: DataTableState | null;
  isError?: boolean;
  onRetry?: () => void;
  empty: DataTableState;
  filteredEmpty?: DataTableState;
  toolbar?: ReactNode;
  skeletonRows?: number;
  className?: string;
  scrollClassName?: string;
};

export type DataTableOption = {
  value: string;
  label: string;
};

export type DataTableSelectFilter = {
  type: "select";
  id: string;
  label: string;
  value: string;
  defaultValue: string;
  options: readonly DataTableOption[];
  onChange: (value: string) => void;
  isDisabled?: boolean;
};

export type DataTableToggleFilter = {
  type: "toggle";
  id: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export type DataTableDateFilter = {
  type: "date";
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export type DataTableTextFilter = {
  type: "text";
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export type DataTableFilter =
  | DataTableSelectFilter
  | DataTableToggleFilter
  | DataTableDateFilter
  | DataTableTextFilter;

export type DataTableSearch = {
  value: string;
  label: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export type DataTableFiltersProps = {
  search?: DataTableSearch;
  filters?: readonly (DataTableFilter | false | null | undefined)[];
  onReset?: () => void;
  isFiltered?: boolean;
  actions?: ReactNode;
  className?: string;
};
