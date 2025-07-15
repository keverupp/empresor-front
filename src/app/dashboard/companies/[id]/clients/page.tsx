"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Phone, Mail, FileText, MoreHorizontal } from "lucide-react";
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

  const { get } = useApi(); // ← desestrutura o método GET
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // useApi.get já cuida de headers, retry, token, toasts etc.
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

    setIsLoading(false);
  }, [companyId, get]);

  useEffect(() => {
    if (companyId) fetchClients();
  }, [companyId, fetchClients]);

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
            <span>{email}</span>
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
            <span>{phone}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Cadastrado em",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return <span className="text-sm">{formatters.date(date)}</span>;
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
      placeholder: "Filtrar por nome.",
    },
  ];

  const handleCreated = (client: Client) => {
    router.push(`/dashboard/companies/${companyId}/clients/${client.id}`);
  };

  const actions = (
    <CreateClientAction companyId={companyId} onCreated={handleCreated} />
  );

  return (
    <DashboardLayout title="Clientes" actions={actions}>
      <div className="space-y-6 p-4">
        <DataTable
          data={clients}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Buscar clientes."
          enableGlobalSearch
          filterableColumns={filterableColumns}
          enableColumnVisibility
          enableRefresh
          enableExport
          isLoading={isLoading}
          error={error}
          onRefresh={fetchClients}
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
