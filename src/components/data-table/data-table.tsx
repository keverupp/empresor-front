"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  ColumnOrderState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

import { DataTableToolbar } from "./data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableProps } from "./interfaces";
import { cn } from "@/lib/utils";

type ColumnConfig = {
  id: string;
  visible: boolean;
  order: number;
};

export function DataTable<TData, TValue>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Buscar...",
  enableGlobalSearch = false,
  filterableColumns = [],
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
  enableColumnVisibility = true,
  enableExport = false,
  enableRefresh = false,
  isLoading = false,
  onRefresh,
  onExport,
  onRowClick,
  customActions = [],
  emptyStateMessage,
  emptyStateIcon,
  className,
  tableClassName,
  columnStorageKey,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  React.useEffect(() => {
    if (columnStorageKey && typeof window !== "undefined") {
      const savedConfig = localStorage.getItem(columnStorageKey);
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig) as ColumnConfig[];

          const visibility: VisibilityState = {};
          config.forEach((col: ColumnConfig) => {
            visibility[col.id] = col.visible;
          });
          setColumnVisibility(visibility);

          const order = config
            .sort((a: ColumnConfig, b: ColumnConfig) => a.order - b.order)
            .map((col: ColumnConfig) => col.id);
          setColumnOrder(order);
        } catch (error) {
          console.error("Erro ao carregar configuração das colunas:", error);
        }
      }
    }
  }, [columnStorageKey]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
      globalFilter: enableGlobalSearch ? globalFilter : "",
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const hasActiveFilters = React.useMemo(() => {
    const hasColumnFilters = columnFilters.length > 0;
    const hasGlobalFilter = enableGlobalSearch && Boolean(globalFilter);
    const hasSearchFilter =
      searchKey && Boolean(table.getColumn(searchKey)?.getFilterValue());

    return hasColumnFilters || hasGlobalFilter || hasSearchFilter;
  }, [
    columnFilters.length,
    enableGlobalSearch,
    globalFilter,
    searchKey,
    table,
  ]);

  const renderEmptyState = () => {
    const defaultIcon = <FileText className="h-8 w-8 text-muted-foreground" />;
    const defaultMessage = hasActiveFilters
      ? "Nenhum resultado encontrado com os filtros aplicados."
      : "Nenhum dado encontrado.";

    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            {emptyStateIcon || defaultIcon}
            <span className="text-muted-foreground">
              {emptyStateMessage || defaultMessage}
            </span>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGlobalFilter("");
                  setColumnFilters([]);
                  if (searchKey) {
                    table.getColumn(searchKey)?.setFilterValue("");
                  }
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const renderLoadingState = () => (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-24 text-center">
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Carregando dados...</span>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className={cn("space-y-4", className)}>
      <DataTableToolbar
        table={table}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        enableGlobalSearch={enableGlobalSearch}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        filterableColumns={filterableColumns}
        enableColumnVisibility={enableColumnVisibility}
        enableExport={enableExport}
        enableRefresh={enableRefresh}
        isLoading={isLoading}
        onRefresh={onRefresh}
        onExport={onExport}
        customActions={customActions}
        columnStorageKey={columnStorageKey}
      />

      <div className="overflow-hidden rounded-lg border">
        <Table className={tableClassName}>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading
              ? renderLoadingState()
              : table.getRowModel().rows?.length
              ? table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      index % 2 ? "bg-muted/20" : "",
                      onRowClick ? "cursor-pointer" : ""
                    )}
                    onClick={() => {
                      if (onRowClick) {
                        onRowClick(row.original);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        onClick={(e) => {
                          if (
                            cell.column.id === "actions" ||
                            cell.column.id === "select" ||
                            cell.column.id === "checkbox"
                          ) {
                            e.stopPropagation();
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : renderEmptyState()}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
    </div>
  );
}
