import { Table as TanstackTable, RowData } from "@tanstack/react-table";

export * from "./interfaces";

export type SortDirection = "asc" | "desc" | false;

export type FilterValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | number[];

export type TableInstance<TData extends RowData> = TanstackTable<TData>;
