"use client";

import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import {
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_COLORS,
  formatCurrency,
  formatDateForDisplay,
} from "@/lib/quote-utils";
import type { DashboardQuote } from "@/hooks/useDashboard";

interface DashboardQuotesTableProps {
  data: DashboardQuote[];
  isLoading?: boolean;
}

export function DashboardQuotesTable({ data, isLoading }: DashboardQuotesTableProps) {
  const router = useRouter();

  const columns: ColumnDef<DashboardQuote>[] = [
    {
      accessorKey: "quote_number",
      header: "Orçamento",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("quote_number")}</span>
      ),
    },
    {
      id: "company",
      header: "Empresa",
      cell: ({ row }) => row.original.company?.name ?? "-",
    },
    {
      id: "client",
      header: "Cliente",
      cell: ({ row }) => row.original.client?.name ?? "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as DashboardQuote["status"];
        return (
          <Badge variant="outline" className={QUOTE_STATUS_COLORS[status]}>
            {QUOTE_STATUS_LABELS[status]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "total_amount_cents",
      header: "Valor",
      cell: ({ row }) => {
        const amount = row.getValue("total_amount_cents") as number;
        return <span className="font-medium">{formatCurrency(amount)}</span>;
      },
      meta: { className: "text-right" },
    },
    {
      accessorKey: "issue_date",
      header: "Emissão",
      cell: ({ row }) => {
        const date = row.getValue("issue_date") as string;
        return formatDateForDisplay(date);
      },
    },
  ];

  const columnLabels = {
    quote_number: "Orçamento",
    company: "Empresa",
    client: "Cliente",
    status: "Status",
    total_amount_cents: "Valor",
    issue_date: "Emissão",
  };

  return (
    <div className="px-4 lg:px-6">
      <DataTable
        data={data}
        columns={columns}
        columnLabels={columnLabels}
        searchKey="quote_number"
        enableGlobalSearch
        enableColumnVisibility
        isLoading={isLoading}
        columnStorageKey="dashboard-quotes"
        onRowClick={(quote) =>
          router.push(`/dashboard/companies/${quote.company.id}/quotes/${quote.id}`)
        }
      />
    </div>
  );
}

