"use client";

import * as React from "react";
import { RowData } from "@tanstack/react-table";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTableFiltersProps } from "./interfaces";

export function DataTableFilters<TData extends RowData>({
  table,
  filterableColumns,
}: DataTableFiltersProps<TData>) {
  const handleFilterChange = (columnId: string, value: string) => {
    const column = table.getColumn(columnId);
    if (!column) return;

    if (value === "all" || value === "") {
      column.setFilterValue(undefined);
    } else {
      const filterableColumn = filterableColumns.find(
        (col) => col.id === columnId
      );
      if (filterableColumn?.type === "multi-select") {
        const currentFilter = (column.getFilterValue() as string[]) || [];
        if (currentFilter.includes(value)) {
          column.setFilterValue(currentFilter.filter((v) => v !== value));
        } else {
          column.setFilterValue([...currentFilter, value]);
        }
      } else {
        column.setFilterValue(value);
      }
    }
  };

  return (
    <>
      {filterableColumns.map((filterColumn) => {
        const column = table.getColumn(filterColumn.id);
        const selectedValue = column?.getFilterValue() as string | string[];

        return (
          <Select
            key={filterColumn.id}
            value={
              selectedValue
                ? Array.isArray(selectedValue)
                  ? selectedValue.join(",")
                  : selectedValue
                : "all"
            }
            onValueChange={(value) =>
              handleFilterChange(filterColumn.id, value)
            }
          >
            <SelectTrigger className="w-auto min-w-[180px] h-9">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder={filterColumn.title} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos ({filterColumn.title})</SelectItem>
              {filterColumn.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      })}
    </>
  );
}
