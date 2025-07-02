"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Download, X } from "lucide-react";

import { DataTableFilters } from "./data-table-filters";
import { DataTableViewOptions } from "./data-table-view-options";
// Importar as interfaces de um arquivo centralizado
import { DataTableToolbarProps, FilterableColumn } from "./interfaces";

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Buscar...",
  enableGlobalSearch = false,
  globalFilter = "",
  setGlobalFilter,
  filterableColumns = [],
  enableColumnVisibility = true,
  enableExport = false,
  enableRefresh = false,
  isLoading = false,
  onRefresh,
  onExport,
  customActions = [],
  columnStorageKey,
}: DataTableToolbarProps<TData>) {
  const [searchValue, setSearchValue] = React.useState("");

  React.useEffect(() => {
    if (searchKey && !enableGlobalSearch) {
      table.getColumn(searchKey)?.setFilterValue(searchValue);
    }
  }, [searchValue, searchKey, table, enableGlobalSearch]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (enableGlobalSearch && setGlobalFilter) {
      setGlobalFilter(value);
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    if (enableGlobalSearch && setGlobalFilter) {
      setGlobalFilter("");
    } else if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue("");
    }
  };

  const activeFilters = table.getState().columnFilters;
  const hasActiveFilters =
    activeFilters.length > 0 ||
    searchValue ||
    (enableGlobalSearch && globalFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {(searchKey || enableGlobalSearch) && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={enableGlobalSearch ? globalFilter : searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
              {(searchValue || globalFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 p-0 -translate-y-1/2 hover:bg-muted"
                  onClick={clearSearch}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {filterableColumns.length > 0 && (
            <DataTableFilters
              table={table}
              filterableColumns={filterableColumns}
            />
          )}
        </div>

        <div className="flex items-center space-x-2">
          {customActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "outline"}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          ))}

          {enableColumnVisibility && (
            <DataTableViewOptions table={table} storageKey={columnStorageKey} />
          )}

          {enableRefresh && onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
          )}

          {enableExport && onExport && (
            <Button variant="outline" size="sm" onClick={() => onExport!()}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>

          {(searchValue || globalFilter) && (
            <Badge variant="secondary" className="gap-1">
              Busca: {enableGlobalSearch ? globalFilter : searchValue}
              <button
                onClick={clearSearch}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}

          {activeFilters.map((filter) => {
            const column = filterableColumns.find(
              (col) => col.id === filter.id
            ) as FilterableColumn | undefined;
            if (!column) return null;

            return (
              <Badge key={filter.id} variant="secondary" className="gap-1">
                {column.title}:{" "}
                {/* CORREÇÃO: Converte o valor para string para renderizar com segurança */}
                {Array.isArray(filter.value)
                  ? filter.value.join(", ")
                  : String(filter.value)}
                <button
                  onClick={() =>
                    table.getColumn(filter.id)?.setFilterValue(undefined)
                  }
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            );
          })}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              table.resetColumnFilters();
              clearSearch();
            }}
            className="h-8 px-2 lg:px-3"
          >
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
