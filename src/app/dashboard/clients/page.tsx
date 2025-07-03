"use client";

import {
  DashboardLayout,
  useDashboardLayout,
} from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";

export default function ClientsPage() {
  const { createBreadcrumbs } = useDashboardLayout();

  const breadcrumbs = createBreadcrumbs([
    { label: "Dashboard", href: "/dashboard" },
    { label: "Clientes" },
  ]);

  const actions = (
    <>
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-2" />
        Filtros
      </Button>
      <Button size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Novo Cliente
      </Button>
    </>
  );

  return (
    <DashboardLayout
      title="Clientes"
      description="Gerencie seus clientes e informações de contato"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <div className="space-y-6 px-4 py-6 md:px-6">
        {/* Barra de pesquisa */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar clientes..." className="pl-8" />
          </div>
        </div>

        {/* Conteúdo da página */}
        <div className="bg-card rounded-lg border p-6">
          <p className="text-muted-foreground">
            Lista de clientes será exibida aqui...
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
