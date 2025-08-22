// src/app/dashboard/companies/[id]/clients/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Phone, Mail, FileText, MoreHorizontal, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { DataTable } from "@/components/data-table/data-table";
import { Client } from "@/types/apiInterfaces";
import { useApi } from "@/hooks/useApi";
import { CreateClientAction } from "@/components/clients/CreateClientAction";
import { ClientDeleteDialog } from "@/components/clients/ClientDeleteDialog";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Utils
import { formatCPF, formatCNPJ, formatPhone } from "@/lib/utils";

// Quotes
import { CreateQuoteDialog } from "@/components/quotes/CreateQuoteDialog";
import { useQuotes } from "@/hooks/useQuotes";

const formatDocument = (document: string | null): string => {
  if (!document) return "";
  const clean = document.replace(/\D/g, "");
  if (clean.length === 11) return formatCPF(clean);
  if (clean.length === 14) return formatCNPJ(clean);
  return document;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

export default function CompanyClientsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const { tokens } = useAuth();

  const { get, delete: deleteApi } = useApi();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);

  // --- estados do diálogo de criar orçamento ---
  const [isCreateQuoteOpen, setIsCreateQuoteOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Reaproveita utilidades do hook de orçamentos
  const { createQuote, generateQuoteNumber } = useQuotes({ companyId });

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await get<Client[]>(
        `/companies/${companyId}/clients`
      );

      if (apiError) {
        setError(apiError);
        toast.error("Erro ao carregar clientes", { description: apiError });
        setClients([]);
      } else if (data) {
        setClients(data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast.error("Erro ao carregar clientes", { description: errorMessage });
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, get]);

  useEffect(() => {
    if (tokens?.accessToken) {
      fetchClients();
    }
  }, [tokens?.accessToken, fetchClients]);

  // Excluir cliente
  const handleDeleteClient = useCallback(
    async (clientId: string): Promise<boolean> => {
      setDeletingClientId(clientId);

      try {
        const { error } = await deleteApi(
          `/companies/${companyId}/clients/${clientId}`
        );

        if (error) {
          toast.error("Erro ao excluir cliente", { description: error });
          return false;
        }

        setClients((prev) => prev.filter((c) => c.id !== clientId));
        toast.success("Cliente excluído com sucesso");
        return true;
      } catch (err) {
        toast.error("Erro ao excluir cliente", {
          description: err instanceof Error ? err.message : "Erro desconhecido",
        });
        return false;
      } finally {
        setDeletingClientId(null);
      }
    },
    [companyId, deleteApi]
  );

  const handleClientCreated = useCallback((newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
  }, []);

  const handleRefreshClients = useCallback(() => {
    fetchClients();
  }, [fetchClients]);

  // Abrir dialog de criar orçamento para um cliente
  const openCreateQuoteForClient = (client: Client) => {
    setSelectedClient(client);
    setIsCreateQuoteOpen(true);
  };

  // onSuccess do dialog: cria orçamento e redireciona para edição
  const handleCreateQuote = useCallback(
    async (payload: {
      client_id: string;
      quote_number: string;
      expiry_date?: string | null;
      items?: any[];
    }) => {
      // garante items: []
      const ensureItems = Array.isArray(payload.items) ? payload.items : [];
      const created = await createQuote({
        ...payload,
        items: ensureItems,
      } as any);

      if (created?.id) {
        router.push(
          `/dashboard/companies/${companyId}/quotes/${created.id}/edit`
        );
      }
    },
    [companyId, createQuote, router]
  );

  const columnLabels = {
    name: "Nome",
    email: "E-mail",
    phone_number: "Telefone",
    address: "Endereço",
    created_at: "Data de Cadastro",
    actions: "Ações",
  };

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          {row.original.document_number && (
            <span className="text-xs text-muted-foreground">
              {formatDocument(row.original.document_number)}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "E-mail",
      cell: ({ row }) => {
        const email = row.getValue("email") as string | null;
        return email ? (
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{email}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        );
      },
    },
    {
      accessorKey: "phone_number",
      header: "Telefone",
      cell: ({ row }) => {
        const phone = row.getValue("phone_number") as string | null;
        return phone ? (
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{formatPhone(phone)}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        );
      },
    },
    {
      id: "address",
      header: "Endereço",
      cell: ({ row }) => {
        const { address_street, address_city, address_state } = row.original;
        const hasAddress = address_street || address_city || address_state;

        if (!hasAddress) {
          return <span className="text-muted-foreground text-sm">-</span>;
        }

        const addressParts = [
          address_street,
          address_city,
          address_state,
        ].filter(Boolean);

        return (
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span
              className="text-sm truncate max-w-[200px]"
              title={addressParts.join(", ")}
            >
              {addressParts.join(", ")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Cadastrado em",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(date)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const client = row.original;
        const isDeleting = deletingClientId === client.id;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  router.push(
                    `/dashboard/companies/${companyId}/clients/${client.id}`
                  )
                }
              >
                Ver detalhes
              </DropdownMenuItem>

              {/* 👉 abre o dialog de criar orçamento com o cliente pré-selecionado */}
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => openCreateQuoteForClient(client)}
              >
                Criar orçamento
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <ClientDeleteDialog
                client={client}
                onConfirm={() => handleDeleteClient(client.id)}
                isLoading={isDeleting}
              >
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive cursor-pointer"
                  disabled={isDeleting}
                >
                  Excluir cliente
                </DropdownMenuItem>
              </ClientDeleteDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const actions = (
    <CreateClientAction
      companyId={companyId}
      onCreated={handleClientCreated}
      onSuccess={handleRefreshClients}
    />
  );

  return (
    <DashboardLayout title="Clientes" actions={actions}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
        <DataTable
          data={clients}
          columnLabels={columnLabels}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Buscar clientes..."
          enableGlobalSearch
          enableColumnVisibility
          enableRefresh
          enableExport
          isLoading={isLoading}
          error={error}
          onRefresh={handleRefreshClients}
          onRowClick={(client) =>
            router.push(
              `/dashboard/companies/${companyId}/clients/${client.id}`
            )
          }
          emptyStateMessage={
            error
              ? "Erro ao carregar clientes. Tente novamente."
              : "Nenhum cliente encontrado. Adicione o primeiro cliente para começar."
          }
          emptyStateIcon={
            <FileText className="h-8 w-8 text-muted-foreground" />
          }
          columnStorageKey={`clients-table-${companyId}`}
          pageSize={15}
          pageSizeOptions={[10, 15, 25, 50]}
        />
      </div>

      {/* Dialog de Criar Orçamento (reuso) */}
      <CreateQuoteDialog
        isOpen={isCreateQuoteOpen}
        onClose={() => setIsCreateQuoteOpen(false)}
        onSuccess={handleCreateQuote}
        companyId={companyId}
        preSelectedClient={selectedClient ?? undefined}
        // Como estamos na página de clientes, não precisamos carregar lista
        onLoadClients={undefined}
        onGenerateQuoteNumber={generateQuoteNumber}
      />
    </DashboardLayout>
  );
}
