"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Phone, Mail, MapPin, FileText, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { DataTable } from "@/components/data-table/data-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatters } from "@/config/app";

// Interface baseada no schema def-4 da API
interface Client {
  id: string;
  company_id: string;
  name: string;
  email: string | null;
  phone_number: string | null;
  document_number: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function CompanyClientsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar clientes da API
  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/companies/${companyId}/clients`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      toast.error("Erro ao carregar clientes", {
        description: err instanceof Error ? err.message : "Erro desconhecido",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar clientes na montagem do componente
  useEffect(() => {
    if (companyId) {
      fetchClients();
    }
  }, [companyId]);

  // Definição das colunas da tabela
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
            <MapPin className="h-3 w-3 text-muted-foreground" />
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

  // Filtros configuráveis para a tabela
  const filterableColumns = [
    {
      id: "name",
      title: "Nome",
      options: [],
      type: "text" as const,
      placeholder: "Filtrar por nome...",
    },
  ];

  return (
    <DashboardLayout title="Clientes">
      <div className="space-y-6 p-4">
        {/* Tabela de clientes */}

        <DataTable
          data={clients}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Buscar clientes..."
          enableGlobalSearch={true}
          filterableColumns={filterableColumns}
          enableColumnVisibility={true}
          enableRefresh={true}
          enableExport={true}
          isLoading={isLoading}
          error={error}
          onRefresh={fetchClients}
          onExport={async () => {
            // Implementar exportação
            toast.info("Exportação em desenvolvimento");
          }}
          onRowClick={(client) => {
            router.push(
              `/dashboard/companies/${companyId}/clients/${client.id}`
            );
          }}
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
