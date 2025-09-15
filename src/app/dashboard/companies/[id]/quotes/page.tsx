// src/app/dashboard/companies/[id]/quotes/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  FileText,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  Kanban,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Layouts e componentes
import {
  DashboardLayout,
  useDashboardLayout,
} from "@/components/layouts/DashboardLayout";
import { DataTable } from "@/components/data-table/data-table";
import { useQuotes } from "@/hooks/useQuotes";

// Componentes específicos
import { CreateQuoteDialog } from "@/components/quotes/CreateQuoteDialog";
import { QuoteDeleteDialog } from "@/components/quotes/QuoteDeleteDialog";

// Utilitários e tipos
import {
  formatCurrency,
  formatDateForDisplay,
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_COLORS,
} from "@/lib/quote-utils";
import { type Quote } from "@/types/apiInterfaces";

export default function QuotesPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const { createBreadcrumbs } = useDashboardLayout();

  // Estados
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Hook de orçamentos
  const {
    quotes,
    isLoading,
    isDeleting,
    error,
    fetchQuotes,
    createQuote,
    updateQuoteStatus,
    deleteQuote,
    fetchClients,
    generateQuoteNumber,
    generatePdf,
  } = useQuotes({ companyId });

  // Breadcrumbs
  useEffect(() => {
    createBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Empresas", href: "/dashboard/companies" },
      { label: "Orçamentos", href: "#" },
    ]);
  }, [createBreadcrumbs]);

  // Carregar dados iniciais
  useEffect(() => {
    if (!companyId) return;
    fetchQuotes({ page: 1, pageSize: 15 });
  }, [companyId, fetchQuotes]);

  const handleCreateQuote = async (data: any) => {
    const result = await createQuote(data);
    if (result) {
      setIsCreateDialogOpen(false);
      router.push(`/dashboard/companies/${companyId}/quotes/${result.id}/edit`);
    }
  };

  const handleStatusChange = async (
    quoteId: string,
    newStatus: Quote["status"]
  ) => {
    await updateQuoteStatus(quoteId, newStatus);
  };

  const handleDeleteQuote = async (quoteId: string): Promise<boolean> => {
    return await deleteQuote(quoteId);
  };

  const handleRefreshQuotes = useCallback(() => {
    fetchQuotes({ page: 1, pageSize: 15 });
  }, [fetchQuotes]);

  const getStatusIcon = (status: Quote["status"]) => {
    switch (status) {
      case "draft":
        return <Edit className="h-4 w-4" />;
      case "sent":
        return <Send className="h-4 w-4" />;
      case "viewed":
        return <Eye className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "expired":
        return <Clock className="h-4 w-4" />;
      case "invoiced":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Labels das colunas para o DataTable
  const columnLabels = {
    quote_number: "Identificação",
    client: "Cliente",
    status: "Status",
    issue_date: "Data de Emissão",
    expiry_date: "Validade",
    total_amount_cents: "Valor Total",
    actions: "Ações",
  };

  // Definição das colunas
  const columns: ColumnDef<Quote>[] = [
    {
      accessorKey: "quote_number",
      header: "Identificação",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("quote_number")}</span>
      ),
    },
    {
      id: "client",
      header: "Cliente",
      cell: ({ row }) => {
        const quote = row.original;
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <div className="font-medium">{quote.client?.name ?? "—"}</div>
              {quote.client?.email && (
                <div className="text-xs text-muted-foreground">
                  {quote.client.email}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Quote["status"];
        return (
          <Badge variant="outline" className={QUOTE_STATUS_COLORS[status]}>
            <span className="flex items-center gap-1">
              {getStatusIcon(status)}
              {QUOTE_STATUS_LABELS[status]}
            </span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "issue_date",
      header: "Data de Emissão",
      cell: ({ row }) => {
        const date = row.getValue("issue_date") as string;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formatDateForDisplay(date)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "expiry_date",
      header: "Validade",
      cell: ({ row }) => {
        const date = row.getValue("expiry_date") as string | null;
        return date ? (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formatDateForDisplay(date)}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        );
      },
    },
    {
      accessorKey: "total_amount_cents",
      header: "Valor Total",
      cell: ({ row }) => {
        const amount = row.getValue("total_amount_cents") as number;
        return <span className="font-medium">{formatCurrency(amount)}</span>;
      },
      meta: { className: "text-right" },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const quote = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/dashboard/companies/${companyId}/quotes/${quote.id}`
                  )
                }
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/dashboard/companies/${companyId}/quotes/${quote.id}/edit`
                  )
                }
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => generatePdf(quote.id)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Gerar PDF
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>

              {quote.status === "draft" && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(quote.id, "sent")}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Marcar como Enviado
                </DropdownMenuItem>
              )}

              {(quote.status === "sent" || quote.status === "viewed") && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(quote.id, "accepted")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Aceito
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleStatusChange(quote.id, "rejected")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Marcar como Rejeitado
                  </DropdownMenuItem>
                </>
              )}

              {quote.status === "accepted" && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(quote.id, "invoiced")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Marcar como Faturado
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <QuoteDeleteDialog
                quote={quote}
                isLoading={isDeleting}
                onConfirm={() => handleDeleteQuote(quote.id)}
              >
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </QuoteDeleteDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Colunas filtráveis para o DataTable
  const filterableColumns = [
    {
      id: "status",
      title: "Status",
      options: [
        { label: "Rascunho", value: "draft" },
        { label: "Enviado", value: "sent" },
        { label: "Visualizado", value: "viewed" },
        { label: "Aceito", value: "accepted" },
        { label: "Rejeitado", value: "rejected" },
        { label: "Expirado", value: "expired" },
        { label: "Faturado", value: "invoiced" },
      ],
    },
  ];

  // Ações do cabeçalho
  const actions = (
    <div className="flex gap-2">
      <Button variant="outline" asChild>
        <Link href={`/dashboard/companies/${companyId}/quotes/kanban`}>
          <Kanban className="h-4 w-4 mr-2" />
          Kanban
        </Link>
      </Button>
      <Button onClick={() => setIsCreateDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Orçamento
      </Button>
    </div>
  );

  return (
    <DashboardLayout title="Orçamentos" actions={actions}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
        <DataTable
          data={quotes || []}
          columnLabels={columnLabels}
          columns={columns}
          searchKey="quote_number"
          searchPlaceholder="Buscar por identificação do orçamento..."
          enableGlobalSearch
          enableColumnVisibility
          enableRefresh
          enableExport
          filterableColumns={filterableColumns}
          isLoading={isLoading}
          error={error}
          onRefresh={handleRefreshQuotes}
          onRowClick={(quote) =>
            router.push(`/dashboard/companies/${companyId}/quotes/${quote.id}`)
          }
          emptyStateMessage={
            error
              ? "Erro ao carregar orçamentos. Tente novamente."
              : "Nenhum orçamento encontrado. Crie o primeiro orçamento para começar."
          }
          emptyStateIcon={
            <FileText className="h-8 w-8 text-muted-foreground" />
          }
          columnStorageKey={`quotes-table-${companyId}`}
          pageSize={15}
          pageSizeOptions={[10, 15, 25, 50]}
        />
      </div>

      {/* Dialog de Criar Orçamento */}
      <CreateQuoteDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleCreateQuote}
        companyId={companyId}
        onLoadClients={fetchClients}
        onGenerateQuoteNumber={generateQuoteNumber}
      />
    </DashboardLayout>
  );
}
