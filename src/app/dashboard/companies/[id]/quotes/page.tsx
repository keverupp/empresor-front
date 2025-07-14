// src/app/dashboard/companies/[id]/quotes/page.tsx
"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, RefreshCw, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable, type FilterableColumn } from "@/components/data-table";
import {
  DashboardLayout,
  useDashboardLayout,
} from "@/components/layouts/DashboardLayout";

import { useQuotes } from "@/hooks/useQuotes";
import { createQuoteColumns } from "@/components/quotes/quotes-columns";
import type { QuoteListParams } from "@/types/quote";

export default function QuotesPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const { createBreadcrumbs } = useDashboardLayout();

  // Estados locais
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  const [filters, setFilters] = useState<QuoteListParams>({
    page: 1,
    pageSize: 10,
  });

  // Hook dos orçamentos
  const {
    quotes,
    isLoading,
    isDeleting,
    error,
    deleteQuote,
    refetch,
    clearError,
  } = useQuotes({
    companyId,
    autoFetch: true,
    params: filters,
  });

  // Handlers para ações
  const handleView = useCallback(
    (quoteId: string) => {
      router.push(`/dashboard/companies/${companyId}/quotes/${quoteId}`);
    },
    [companyId, router]
  );

  const handleEdit = useCallback(
    (quoteId: string) => {
      router.push(`/dashboard/companies/${companyId}/quotes/${quoteId}/edit`);
    },
    [companyId, router]
  );

  const handleCreateNew = useCallback(() => {
    router.push(`/dashboard/companies/${companyId}/quotes/new`);
  }, [companyId, router]);

  const handleViewClient = useCallback(
    (clientId: string) => {
      router.push(`/dashboard/companies/${companyId}/clients/${clientId}`);
    },
    [companyId, router]
  );

  const handleDuplicate = useCallback(async (quoteId: string) => {
    try {
      // TODO: Implementar replicação no backend
      toast.info("Funcionalidade de replicação em desenvolvimento");
    } catch (error) {
      toast.error("Erro ao replicar orçamento");
    }
  }, []);

  const handleDeleteConfirm = useCallback((quoteId: string) => {
    setQuoteToDelete(quoteId);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteExecute = useCallback(async () => {
    if (!quoteToDelete) return;

    try {
      await deleteQuote(quoteToDelete);
      toast.success("Orçamento excluído com sucesso!");
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
    } catch (error) {
      toast.error("Erro ao excluir orçamento");
    }
  }, [quoteToDelete, deleteQuote]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Configurar colunas do DataTable
  const columns = createQuoteColumns({
    onEdit: handleEdit,
    onDelete: handleDeleteConfirm,
    onViewClient: handleViewClient,
    onDuplicate: handleDuplicate,
  });

  // Configurar filtros do DataTable
  const filterableColumns: FilterableColumn[] = [
    {
      id: "status",
      title: "Status do Orçamento",
      type: "select",
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

  // Breadcrumbs
  const breadcrumbs = createBreadcrumbs([
    { label: "Dashboard", href: "/dashboard" },
    { label: "Empresas", href: "/dashboard/companies" },
    { label: "Empresa", href: `/dashboard/companies/${companyId}` },
    { label: "Orçamentos" },
  ]);

  // Actions do header
  const actions = (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isLoading}
      >
        <RefreshCw
          className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
        />
        Atualizar
      </Button>
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-2" />
        Filtros
      </Button>
      <Button size="sm" onClick={handleCreateNew}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Orçamento
      </Button>
    </>
  );

  // Limpar erro se houver
  if (error) {
    clearError();
  }

  return (
    <DashboardLayout
      title="Orçamentos"
      description="Gerencie os orçamentos da empresa"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <div className="space-y-6 px-4 py-6 md:px-6">
        {/* Tabela de Orçamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Orçamentos da Empresa</CardTitle>
            <CardDescription>
              Gerencie todos os orçamentos: criar, editar, visualizar clientes e
              replicar orçamentos existentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={quotes}
              columns={columns}
              searchKey="quote_number"
              searchPlaceholder="Buscar por número do orçamento ou nome do cliente..."
              filterableColumns={filterableColumns}
              enableGlobalSearch={false}
              enableColumnVisibility={true}
              enableRefresh={true}
              enableExport={false}
              isLoading={isLoading}
              onRefresh={handleRefresh}
              pageSize={10}
              pageSizeOptions={[5, 10, 20, 50]}
              emptyStateMessage="Nenhum orçamento encontrado para esta empresa"
              loadingMessage="Carregando orçamentos..."
              columnStorageKey={`quotes-table-${companyId}`}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este orçamento? Esta ação não
                pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteExecute}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
