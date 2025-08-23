// src/components/quotes/quotes-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, User, Copy, Clock } from "lucide-react";
import { QUOTE_STATUS_CONFIG } from "@/types/quote";
import type { Quote, QuoteStatus } from "@/types/quote";
import { formatters } from "@/config/app";

interface QuoteActionsProps {
  quote: Quote;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewClient: (clientId: string) => void;
  onDuplicate: (id: string) => void;
}

const QuoteActions = ({
  quote,
  onEdit,
  onDelete,
  onViewClient,
  onDuplicate,
}: QuoteActionsProps) => {
  const canEdit = quote.status === "draft";
  const canDelete = quote.status === "draft";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu de ações</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Ações do Orçamento</DropdownMenuLabel>

        {canEdit ? (
          <DropdownMenuItem onClick={() => onEdit(quote.id)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Orçamento
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled>
            <Edit className="mr-2 h-4 w-4 opacity-50" />
            Editar (Indisponível)
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => onViewClient(quote.client.id)}>
          <User className="mr-2 h-4 w-4" />
          Ver Dados do Cliente
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onDuplicate(quote.id)}>
          <Copy className="mr-2 h-4 w-4" />
          Replicar Orçamento
        </DropdownMenuItem>

        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(quote.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Orçamento
            </DropdownMenuItem>
          </>
        )}

        {!canDelete && quote.status !== "draft" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <Trash2 className="mr-2 h-4 w-4 opacity-50" />
              Excluir (Indisponível)
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const StatusBadge = ({ status }: { status: QuoteStatus }) => {
  const config = QUOTE_STATUS_CONFIG[status];

  const variantMap = {
    gray: "secondary" as const,
    blue: "default" as const,
    yellow: "secondary" as const,
    green: "default" as const,
    red: "destructive" as const,
    orange: "secondary" as const,
    purple: "default" as const,
  };

  return (
    <Badge variant={variantMap[config.color]} className="whitespace-nowrap">
      {config.label}
    </Badge>
  );
};

interface CreateQuoteColumnsProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewClient: (clientId: string) => void;
  onDuplicate: (id: string) => void;
}

export const createQuoteColumns = ({
  onEdit,
  onDelete,
  onViewClient,
  onDuplicate,
}: CreateQuoteColumnsProps): ColumnDef<Quote>[] => [
  {
    accessorKey: "quote_number",
    header: "Número",
    cell: ({ row }) => {
      const quote = row.original;
      return <div className="font-medium">{quote.quote_number}</div>;
    },
  },
  {
    accessorKey: "client.name",
    header: "Cliente",
    cell: ({ row }) => {
      const quote = row.original;
      return (
        <div>
          <div className="font-medium">{quote.client.name}</div>
          {quote.client.email && (
            <div className="text-sm text-muted-foreground">
              {quote.client.email}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as QuoteStatus;
      return <StatusBadge status={status} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "total_amount_cents",
    header: "Valor Total",
    cell: ({ row }) => {
      const amount = row.getValue("total_amount_cents") as number;
      return <div className="font-medium">{formatters.currency(amount)}</div>;
    },
  },
  {
    accessorKey: "issue_date",
    header: "Data Emissão",
    cell: ({ row }) => {
      const date = row.getValue("issue_date") as string;
      return <div className="whitespace-nowrap">{formatters.date(date)}</div>;
    },
  },
  {
    accessorKey: "expiry_date",
    header: "Vencimento",
    cell: ({ row }) => {
      const date = row.getValue("expiry_date") as string | null;
      if (!date) {
        return <div className="text-muted-foreground">-</div>;
      }

      const isExpired = new Date(date) < new Date();
      const isExpiringSoon =
        new Date(date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      return (
        <div className="whitespace-nowrap flex items-center gap-1">
          {isExpired && <Clock className="h-3 w-3 text-red-500" />}
          {!isExpired && isExpiringSoon && (
            <Clock className="h-3 w-3 text-orange-500" />
          )}
          <span
            className={
              isExpired
                ? "text-red-500"
                : isExpiringSoon
                ? "text-orange-500"
                : ""
            }
          >
            {formatters.date(date)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Criado em",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return (
        <div className="whitespace-nowrap text-sm text-muted-foreground">
          {formatters.dateTime(date)}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const quote = row.original;
      
      return (
        <QuoteActions
          quote={quote}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewClient={onViewClient}
          onDuplicate={onDuplicate}
        />
      );
    },
  },
];
