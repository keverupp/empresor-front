import {
  ColumnDef,
  Table,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowData,
} from "@tanstack/react-table";
import { ReactNode } from "react";

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface FilterOption {
  label: string;
  value: string;
  icon?: ReactNode;
  description?: string;
}

export interface FilterableColumn {
  id: string;
  title: string;
  options: FilterOption[];
  type?: "select" | "multi-select" | "date-range" | "number-range";
  placeholder?: string;
}

export interface CustomAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost";
  disabled?: boolean;
  tooltip?: string;
  hidden?: boolean;
}

export interface ExportConfig {
  filename?: string;
  includeHeaders?: boolean;
  columns?: Array<{
    key: string;
    label: string;
  }>;
}

export interface DataTableProps<TData extends RowData, TValue> {
  data: TData[];
  columnLabels?: Record<string, string>;
  columns: ColumnDef<TData, TValue>[];
  searchKey?: string;
  searchPlaceholder?: string;
  enableGlobalSearch?: boolean;
  filterableColumns?: FilterableColumn[];
  pageSize?: number;
  pageSizeOptions?: number[];
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  enableRefresh?: boolean;
  enableSelection?: boolean;
  enableSorting?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void | Promise<void>;
  onExport?: (config?: ExportConfig) => void | Promise<void>;
  onSelectionChange?: (selectedRows: TData[]) => void;
  onRowClick?: (row: TData) => void;
  customActions?: CustomAction[];
  emptyStateMessage?: string;
  emptyStateIcon?: ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
  className?: string;
  tableClassName?: string;
  containerClassName?: string;
  stickyHeader?: boolean;
  maxHeight?: string;
  density?: "compact" | "normal" | "comfortable";
  columnStorageKey?: string;
  onColumnConfigChange?: (config: ColumnConfig[]) => void;
}

export interface DataTableToolbarProps<TData extends RowData> {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
  enableGlobalSearch?: boolean;
  globalFilter?: string;
  setGlobalFilter?: (value: string) => void;
  filterableColumns?: FilterableColumn[];
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  enableRefresh?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void | Promise<void>;
  onExport?: (config?: ExportConfig) => void | Promise<void>;
  customActions?: CustomAction[];
  density?: "compact" | "normal" | "comfortable";
  onDensityChange?: (density: "compact" | "normal" | "comfortable") => void;
  columnStorageKey?: string;
}

export interface DataTablePaginationProps<TData extends RowData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  showSelectedRows?: boolean;
  showPageInfo?: boolean;
  showPageSizeSelector?: boolean;
  className?: string;
}

export interface DataTableFiltersProps<TData extends RowData> {
  table: Table<TData>;
  filterableColumns: FilterableColumn[];
  className?: string;
}

export interface DataTableViewOptionsProps<TData extends RowData> {
  table: Table<TData>;
  columnLabels?: Record<string, string>;
  className?: string;
  storageKey?: string;
  onConfigChange?: (config: ColumnConfig[]) => void;
}

export interface DensityConfig {
  compact: {
    cellPadding: string;
    fontSize: string;
    lineHeight: string;
  };
  normal: {
    cellPadding: string;
    fontSize: string;
    lineHeight: string;
  };
  comfortable: {
    cellPadding: string;
    fontSize: string;
    lineHeight: string;
  };
}

export interface DataTableTheme {
  colors: {
    border: string;
    background: string;
    foreground: string;
    muted: string;
    accent: string;
  };
  borderRadius: string;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
  };
}

export interface DataTableState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  globalFilter: string;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  rowSelection: Record<string, boolean>;
  density: "compact" | "normal" | "comfortable";
}

export interface UseDataTableReturn<TData> {
  data: TData[];
  setData: (data: TData[]) => void;
  isLoading: boolean;
  error: string | null;
  refreshData: (fetchFn?: () => Promise<TData[]>) => Promise<void>;
  addItem: (item: TData) => void;
  updateItem: (index: number, updatedItem: Partial<TData>) => void;
  removeItem: (index: number) => void;
  clearError: () => void;
}

export interface ColumnHelperConfig<TData> {
  statusConfig?: Record<
    string,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label?: string;
      icon?: ReactNode;
    }
  >;
  currencyConfig?: {
    currency: string;
    locale: string;
  };
  dateConfig?: {
    format: string;
    locale: string;
  };
  actionsConfig?: Array<{
    label: string;
    onClick: (row: TData) => void;
    icon?: ReactNode;
    variant?: "default" | "destructive" | "ghost";
    hidden?: (row: TData) => boolean;
  }>;
}

export type FilterType =
  | "select"
  | "multi-select"
  | "date-range"
  | "number-range"
  | "text";

export type TableDensity = "compact" | "normal" | "comfortable";

export type ActionVariant =
  | "default"
  | "outline"
  | "destructive"
  | "secondary"
  | "ghost";

export type FormatterFunction<T = unknown> = (value: T) => string | ReactNode;

export type ExtendedColumnDef<
  TData extends RowData,
  TValue = unknown
> = ColumnDef<TData, TValue> & {
  meta?: {
    exportable?: boolean;
    filterable?: boolean;
    sortable?: boolean;
    hideable?: boolean;
    formatter?: FormatterFunction<TValue>;
  };
};
