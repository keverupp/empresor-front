// src/app/dashboard/companies/[id]/clients/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Phone, Mail, FileText, MoreHorizontal, MapPin } from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { DataTable } from "@/components/data-table/data-table";
import { Client } from "@/types/apiInterfaces";
import { useApi } from "@/hooks/useApi";
import { CreateClientAction } from "@/components/clients/CreateClientAction";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatters } from "@/config/app";

export default function CompanyClientsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const { get } = useApi();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      console.error("Erro ao buscar clientes:", err);
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
    if (companyId) {
      fetchClients();
    }
  }, [companyId, fetchClients]);

  // Função para atualizar a lista após adicionar cliente
  const handleClientCreated = useCallback((newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
  }, []);

  // Função para atualizar a tabela (usada pelo botão refresh)
  const handleRefreshClients = useCallback(() => {
    fetchClients();
  }, [fetchClients]);

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          {row.original.document_number && (
            <span className="text-xs text-muted-foreground">
              {row.original.document_number}
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
            <span className="text-sm">{phone}</span>
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
            {formatters.date(date)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const client = row.original;

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
                onClick={() =>
                  router.push(
                    `/dashboard/companies/${companyId}/clients/${client.id}`
                  )
                }
              >
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/dashboard/companies/${companyId}/clients/${client.id}/edit`
                  )
                }
              >
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/dashboard/companies/${companyId}/quotes/new?clientId=${client.id}`
                  )
                }
              >
                Criar orçamento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filterableColumns = [
    {
      id: "name",
      title: "Nome",
      options: [],
      type: "text" as const,
      placeholder: "Filtrar por nome...",
    },
    {
      id: "email",
      title: "E-mail",
      options: [],
      type: "text" as const,
      placeholder: "Filtrar por e-mail...",
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
          columns={columns}
          searchKey="name"
          searchPlaceholder="Buscar clientes..."
          enableGlobalSearch
          filterableColumns={filterableColumns}
          enableColumnVisibility
          enableRefresh
          enableExport
          isLoading={isLoading}
          error={error}
          onRefresh={handleRefreshClients}
          onExport={async () => toast.info("Exportação em desenvolvimento")}
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
    </DashboardLayout>
  );
}
