// src/app/dashboard/companies/[companyId]/quotes/[quoteId]/edit/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select as ShSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DashboardLayout,
  useDashboardLayout,
} from "@/components/layouts/DashboardLayout";
import {
  Loader2,
  MoreHorizontal,
  Eye,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Users,
  Package,
  Calculator,
  MessageSquare,
  Save,
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Clock,
  RefreshCw,
} from "lucide-react";

import { useQuoteEdit } from "@/hooks/useQuoteEdit";
import { ClientTab } from "@/components/quotes/edit/ClientTab";
import { ItemsTab } from "@/components/quotes/edit/ItemsTab";
import { FinanceTab } from "@/components/quotes/edit/FinanceTab";
import { ObservationsTab } from "@/components/quotes/edit/ObservationsTab";
import { FooterActions } from "@/components/quotes/edit/FooterActions";

import { useAuth } from "@/contexts/AuthContext";

type TabValue = "cliente" | "itens" | "financeiro" | "observacoes";

export default function QuoteEditPage() {
  const {
    // dados e estado
    quote,
    loading,
    error,
    router,
    companyId,
    form,
    products,
    subtotalCents,
    discountCents,
    totalCents,
    saving,
    updatingStatus,
    // ações gerais
    onSubmit,
    handleStatus,
    // ações de itens (rotas novas da API)
    addItem,
    updateItem,
    removeItem,
  } = useQuoteEdit();

  const { createBreadcrumbs } = useDashboardLayout();
  const [activeTab, setActiveTab] = useState<TabValue>("cliente");

  const { hasCatalog, activePlan } = useAuth();
  console.log("activePlan", activePlan, "hasCatalog", hasCatalog);

  

  // UX
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Tabs (theme-aware, sem cores fixas)
  const tabConfig = useMemo(
    () => ({
      cliente: { icon: Users, label: "Cliente" },
      itens: { icon: Package, label: "Itens" },
      financeiro: { icon: Calculator, label: "Financeiro" },
      observacoes: { icon: MessageSquare, label: "Observações" },
    }),
    []
  ) satisfies Record<
    TabValue,
    { icon: React.ComponentType<{ className?: string }>; label: string }
  >;

  const getStatusMeta = useCallback(() => {
    const status = quote?.status;
    // usamos variantes do shadcn para manter integridade do tema;
    // sem cores customizadas
    switch (status) {
      case "sent":
        return {
          icon: Send,
          label: "Enviado",
          badgeVariant: "default" as const,
        };
      case "viewed":
        return {
          icon: Eye,
          label: "Visualizado",
          badgeVariant: "default" as const,
        };
      case "accepted":
        return {
          icon: CheckCircle,
          label: "Aceito",
          badgeVariant: "default" as const,
        };
      case "rejected":
        return {
          icon: XCircle,
          label: "Rejeitado",
          badgeVariant: "destructive" as const,
        };
      case "invoiced":
        return {
          icon: FileText,
          label: "Faturado",
          badgeVariant: "secondary" as const,
        };
      case "draft":
      default:
        return {
          icon: FileText,
          label: "Rascunho",
          badgeVariant: "secondary" as const,
        };
    }
  }, [quote?.status]);

  // Breadcrumbs
  useEffect(() => {
    if (!quote) return;
    createBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Empresas", href: "/dashboard/companies" },
      { label: "Orçamentos", href: `/dashboard/companies/${companyId}/quotes` },
      { label: `#${quote.quote_number}`, href: "#" },
    ]);
  }, [quote, companyId, createBreadcrumbs]);

  // Watch form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Update last saved when saving completes
  useEffect(() => {
    if (!saving && hasUnsavedChanges) {
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }
  }, [saving, hasUnsavedChanges]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] grid place-items-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <p className="text-lg font-medium">Carregando orçamento...</p>
              <p className="text-sm text-muted-foreground">
                Aguarde enquanto buscamos os dados
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !quote) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] grid place-items-center">
          <div className="text-center space-y-4 max-w-md">
            <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Erro ao carregar orçamento
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error ??
                  "Não foi possível carregar os dados do orçamento. Tente novamente."}
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
                <Button
                  onClick={() => router.refresh()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusMeta = getStatusMeta();
  const StatusIcon = statusMeta.icon;

  return (
    <DashboardLayout
      title={
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold">Editar Orçamento</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{quote.quote_number}</span>
              <span>•</span>
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(quote.created_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
        </div>
      }
      actions={
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4 text-primary" />
            <Badge variant={statusMeta.badgeVariant}>{statusMeta.label}</Badge>
          </div>

          {/* Save Status */}
          {hasUnsavedChanges && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Alterações não salvas
            </div>
          )}

          {lastSaved && !hasUnsavedChanges && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3" />
              Salvo{" "}
              {lastSaved.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <MoreHorizontal className="h-4 w-4" />
                Ações
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Alterar Status
              </DropdownMenuLabel>

              {quote.status === "draft" && (
                <DropdownMenuItem
                  onClick={() => handleStatus("sent")}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Marcar como Enviado
                </DropdownMenuItem>
              )}

              {(quote.status === "sent" || quote.status === "viewed") && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleStatus("accepted")}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Marcar como Aceito
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatus("rejected")}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Marcar como Rejeitado
                  </DropdownMenuItem>
                </>
              )}

              {quote.status === "accepted" && (
                <DropdownMenuItem
                  onClick={() => handleStatus("invoiced")}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Marcar como Faturado
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/dashboard/companies/${companyId}/quotes/${quote.id}`
                  )
                }
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Visualizar Orçamento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="space-y-6 p-4 w-full mx-auto">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Mobile: seletor de abas */}
          <div className="md:hidden">
            <label className="mb-2 block text-sm font-medium">
              Navegar por seção
            </label>
            <ShSelect
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabValue)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecionar seção" />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(tabConfig) as [
                    TabValue,
                    (typeof tabConfig)[TabValue]
                  ][]
                ).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={key} value={key} className="h-12">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-primary" />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </ShSelect>
          </div>

          {/* Desktop: tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
          >
            <div className="hidden md:flex">
              <TabsList className="grid w-full grid-cols-4 h-12">
                {(
                  Object.entries(tabConfig) as [
                    TabValue,
                    (typeof tabConfig)[TabValue]
                  ][]
                ).map(([key, config]) => {
                  const Icon = config.icon;
                  const isActive = activeTab === key;
                  return (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className="flex items-center gap-2 h-10 data-[state=active]:bg-background"
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <span className="hidden sm:inline">{config.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <div className="mt-6">
              <TabsContent value="cliente" className="mt-0">
                <div className="text-card-foreground rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">
                      Informações do Cliente
                    </h2>
                  </div>
                  <ClientTab form={form} quote={quote} />
                </div>
              </TabsContent>

              <TabsContent value="itens" className="mt-0">
                <div className="text-card-foreground rounded-lg">
                  <ItemsTab
                    form={form}
                    hasCatalog={hasCatalog}
                    products={products}
                    onAdd={addItem}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                  />
                </div>
              </TabsContent>

              <TabsContent value="financeiro" className="mt-0">
                <div className="text-card-foreground rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">
                      Configurações Financeiras
                    </h2>
                  </div>
                  <FinanceTab
                    form={form}
                    subtotalCents={subtotalCents}
                    discountCents={discountCents}
                    totalCents={totalCents}
                  />
                </div>
              </TabsContent>

              <TabsContent value="observacoes" className="mt-0">
                <div className="text-card-foreground rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">
                      Observações Adicionais
                    </h2>
                  </div>
                  <ObservationsTab form={form} />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-background border-t border-border p-4 -mx-4">
            <FooterActions
              subtotalCents={subtotalCents}
              totalCents={totalCents}
              saving={saving}
              updatingStatus={updatingStatus}
              onBack={() =>
                router.push(
                  `/dashboard/companies/${quote.company_id}/quotes/${quote.id}`
                )
              }
            />
          </div>
        </form>

        {/* Quick Actions Panel (Mobile) */}
        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <div className="flex flex-col gap-2">
            {hasUnsavedChanges && (
              <Button
                size="sm"
                onClick={form.handleSubmit(onSubmit)}
                disabled={saving}
                className="shadow-lg"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Autosave Indicator */}
        {(saving || updatingStatus) && (
          <div className="fixed bottom-4 left-4 z-50">
            <div className="bg-popover text-popover-foreground border rounded-lg px-3 py-2 shadow-lg flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>{saving ? "Salvando..." : "Atualizando status..."}</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
