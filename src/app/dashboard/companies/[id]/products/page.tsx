"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, FileText } from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductDialog } from "@/components/products/ProductDialog";
import { ProductDeleteDialog } from "@/components/products/ProductDeleteDialog";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import type { Product } from "@/types/product";
import { formatters } from "@/config/app";

export default function CompanyProductsPage() {
  const params = useParams();
  const companyId = params.id as string;
  const { tokens } = useAuth();
  const { get } = useApi();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await get<{ data: Product[] }>(
      `/companies/${companyId}/products`
    );
    if (error) {
      setError(error);
      toast.error("Erro ao carregar produtos", { description: error });
      setProducts([]);
    } else if (data) {
      const maybeList = (data as { data?: unknown }).data;
      if (Array.isArray(maybeList)) {
        setProducts(maybeList as Product[]);
      } else if (Array.isArray(data as unknown)) {
        setProducts(data as unknown as Product[]);
      } else {
        setProducts([]);
      }
    }
    setIsLoading(false);
  }, [companyId, get]);

  useEffect(() => {
    if (tokens?.accessToken) {
      fetchProducts();
    }
  }, [tokens?.accessToken, fetchProducts]);

  const handleCreated = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
  };

  const handleUpdated = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  };

  const handleDeleted = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Nome",
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => {
        const sku = row.getValue("sku") as string | null;
        return sku || "-";
      },
    },
    {
      accessorKey: "unit_price_cents",
      header: "Preço",
      cell: ({ row }) =>
        formatters.currency(row.getValue("unit_price_cents") as number),
    },
    {
      accessorKey: "unit",
      header: "Unidade",
      cell: ({ row }) => {
        const unit = row.getValue("unit") as string | null;
        return unit || "-";
      },
    },
    {
      accessorKey: "is_active",
      header: "Ativo",
      cell: ({ row }) => ((row.getValue("is_active") as boolean) ? "Sim" : "Não"),
    },
    {
      accessorKey: "created_at",
      header: "Cadastrado em",
      cell: ({ row }) => formatters.date(row.getValue("created_at") as string),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <ProductDialog
                companyId={companyId}
                product={product}
                onSuccess={handleUpdated}
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="cursor-pointer"
                  >
                    Editar
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuSeparator />
              <ProductDeleteDialog
                companyId={companyId}
                product={product}
                onDeleted={handleDeleted}
              >
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive cursor-pointer"
                >
                  Excluir
                </DropdownMenuItem>
              </ProductDeleteDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const actions = (
    <ProductDialog
      companyId={companyId}
      onSuccess={handleCreated}
      trigger={<Button size="sm">+ Novo produto</Button>}
    />
  );

  return (
    <DashboardLayout title="Produtos" actions={actions}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
        <DataTable
          data={products}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Buscar produtos..."
          enableGlobalSearch
          enableColumnVisibility
          enableRefresh
          isLoading={isLoading}
          error={error}
          onRefresh={fetchProducts}
          emptyStateMessage={
            error
              ? "Erro ao carregar produtos. Tente novamente."
              : "Nenhum produto encontrado. Adicione o primeiro produto."
          }
          emptyStateIcon={<FileText className="h-8 w-8 text-muted-foreground" />}
          columnStorageKey={`products-table-${companyId}`}
          pageSize={15}
          pageSizeOptions={[10, 15, 25, 50]}
        />
      </div>
    </DashboardLayout>
  );
}
