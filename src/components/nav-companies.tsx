// src/components/nav-companies.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBuilding,
  IconUsers,
  IconFileText,
  IconCurrencyDollar,
  IconSettings,
  IconFolder,
  IconChevronDown,
  IconChevronRight,
  IconDots,
  IconReport,
  IconMail,
  IconAlertTriangle,
} from "@tabler/icons-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyActivationModal } from "@/components/company-activation-modal";
import { NewCompanyButton } from "@/components/new-company-button";

import { useCompanyContext } from "@/contexts/CompanyContext";
import type { Company, CompanyMenuItem } from "@/types/company";

// Função para gerar os itens do menu baseado nas permissões
function getCompanyMenuItems(
  companyId: string,
  permissions: {
    canViewClients: boolean;
    canCreateQuotes: boolean;
    canEditSettings: boolean;
    canViewFinance: boolean;
    canManageProducts: boolean;
    canViewReports: boolean;
  }
): CompanyMenuItem[] {
  const baseUrl = `/dashboard/companies/${companyId}`;

  const items: CompanyMenuItem[] = [];

  // Orçamentos - sempre visível
  items.push({
    title: "Orçamentos",
    href: `${baseUrl}/quotes`,
    icon: IconFileText,
  });

  // Clientes - sempre visível
  items.push({
    title: "Clientes",
    href: `${baseUrl}/clients`,
    icon: IconUsers,
  });

  // Produtos - sempre visível
  items.push({
    title: "Produtos",
    href: `${baseUrl}/products`,
    icon: IconFolder,
  });

  // Relatórios - sempre visível
  items.push({
    title: "Relatórios",
    href: `${baseUrl}/reports`,
    icon: IconReport,
  });

  // Financeiro - baseado em permissão
  if (permissions.canViewFinance) {
    items.push({
      title: "Financeiro",
      href: `${baseUrl}/finance`,
      icon: IconCurrencyDollar,
    });
  }

  // Configurações - baseado em permissão (sempre por último se disponível)
  if (permissions.canEditSettings) {
    items.push({
      title: "Configurações",
      href: `${baseUrl}/settings`,
      icon: IconSettings,
    });
  }

  return items;
}

// Componente para cada empresa individual
interface CompanyItemProps {
  company: Company;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  menuItems: CompanyMenuItem[];
  onActivationClick: () => void;
}

function CompanyItem({
  company,
  isActive,
  isExpanded,
  onToggle,
  onSelect,
  menuItems,
  onActivationClick,
}: CompanyItemProps) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  // Verifica se a empresa está pendente de validação
  const isPending =
    company.status === "pending_validation" || company.status === "pending";

  return (
    <SidebarMenuItem>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <SidebarMenuButton
          asChild
          tooltip={company.name}
          isActive={isActive}
          className="group/company"
        >
          <CollapsibleTrigger
            onClick={onSelect}
            className="flex w-full items-center gap-2 p-2"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={`Logo ${company.name}`}
                  className="w-4 h-4 rounded object-cover flex-shrink-0"
                />
              ) : (
                <IconBuilding className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="truncate font-medium">{company.name}</span>
            </div>

            <div className="flex items-center gap-1">
              {/* Badge de status */}
              {isPending && (
                <Badge
                  variant="outline"
                  className="text-xs border-amber-200 bg-amber-100 text-amber-800"
                >
                  <IconAlertTriangle className="w-3 h-3 mr-1" />
                  Pendente
                </Badge>
              )}

              {/* Chevron */}
              {isExpanded ? (
                <IconChevronDown className="w-4 h-4" />
              ) : (
                <IconChevronRight className="w-4 h-4" />
              )}
            </div>
          </CollapsibleTrigger>
        </SidebarMenuButton>

        {/* Menu de ações da empresa */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction
              showOnHover
              className="data-[state=open]:bg-accent rounded-sm opacity-0 group-hover/company:opacity-100"
            >
              <IconDots className="w-4 h-4" />
              <span className="sr-only">Ações da empresa</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-48 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align={isMobile ? "end" : "start"}
          >
            {isPending && (
              <>
                <DropdownMenuItem onClick={onActivationClick}>
                  <IconMail className="w-4 h-4 mr-2" />
                  Ativar Empresa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/companies/${company.id}/settings`}>
                <IconSettings className="w-4 h-4 mr-2" />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/companies/${company.id}`}>
                <IconBuilding className="w-4 h-4" />
                <span>Ver Empresa</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Submenu com as seções da empresa */}
        <CollapsibleContent>
          <SidebarMenuSub>
            {isPending ? (
              // Mensagem para empresa pendente
              <SidebarMenuSubItem>
                <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                  <IconAlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Ative a empresa para acessar</span>
                </div>
              </SidebarMenuSubItem>
            ) : (
              // Menu normal para empresa ativa
              menuItems.map((item) => {
                const isSubActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuSubItem key={item.href}>
                    <SidebarMenuSubButton asChild isActive={isSubActive}>
                      <Link href={item.href}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

// Componente principal NavCompanies
export function NavCompanies() {
  const {
    companies,
    activeCompanyId,
    switchCompany,
    isLoading,
    isError,
    hasPermission,
    refreshCompanies,
  } = useCompanyContext();

  const [expandedCompanies, setExpandedCompanies] = React.useState<Set<string>>(
    new Set(activeCompanyId ? [activeCompanyId] : [])
  );

  // Modal de ativação
  const [activationModal, setActivationModal] = React.useState<{
    isOpen: boolean;
    company: Company | null;
  }>({
    isOpen: false,
    company: null,
  });

  // Expande automaticamente a empresa ativa
  React.useEffect(() => {
    if (activeCompanyId) {
      setExpandedCompanies((prev) => new Set([...prev, activeCompanyId]));
    }
  }, [activeCompanyId]);

  // Toggle do accordion
  const toggleCompany = React.useCallback((companyId: string) => {
    setExpandedCompanies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  }, []);

  // Selecionar empresa
  const selectCompany = React.useCallback(
    (companyId: string) => {
      switchCompany(companyId);
    },
    [switchCompany]
  );

  // Abrir modal de ativação
  const openActivationModal = React.useCallback((company: Company) => {
    setActivationModal({
      isOpen: true,
      company,
    });
  }, []);

  // Fechar modal de ativação
  const closeActivationModal = React.useCallback(() => {
    setActivationModal({
      isOpen: false,
      company: null,
    });
  }, []);

  // Callback de sucesso da ativação
  const handleActivationSuccess = React.useCallback(() => {
    refreshCompanies(); // Recarrega a lista de empresas
  }, [refreshCompanies]);

  // Permissões simplificadas
  const companyPermissions = React.useMemo(
    () => ({
      canViewClients: hasPermission("can_view_clients"),
      canCreateQuotes: hasPermission("can_create_quotes"),
      canEditSettings: hasPermission("can_edit_settings"),
      canViewFinance: hasPermission("can_view_finance"),
      canManageProducts: hasPermission("can_manage_products"),
      canViewReports: hasPermission("can_view_reports"),
    }),
    [hasPermission]
  );

  return (
    <>
      {/* Seção principal de empresas */}
      <SidebarGroup>
        <SidebarGroupLabel>Empresas</SidebarGroupLabel>
        <SidebarMenu>
          {/* Loading state - só para as empresas */}
          {isLoading && (
            <>
              {[1, 2].map((i) => (
                <SidebarMenuItem key={i}>
                  <div className="flex items-center gap-2 p-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                </SidebarMenuItem>
              ))}
            </>
          )}

          {/* Error state */}
          {isError && (
            <SidebarMenuItem>
              <div className="p-2 text-sm text-red-500">
                Erro ao carregar empresas
                <button
                  onClick={refreshCompanies}
                  className="ml-2 text-blue-500 underline hover:no-underline"
                >
                  Tentar novamente
                </button>
              </div>
            </SidebarMenuItem>
          )}

          {/* Lista de empresas */}
          {!isLoading &&
            !isError &&
            companies.map((company) => {
              const isActive = activeCompanyId === company.id;
              const isExpanded = expandedCompanies.has(company.id);
              const menuItems = getCompanyMenuItems(
                company.id,
                companyPermissions
              );

              return (
                <CompanyItem
                  key={company.id}
                  company={company}
                  isActive={isActive}
                  isExpanded={isExpanded}
                  onToggle={() => toggleCompany(company.id)}
                  onSelect={() => selectCompany(company.id)}
                  onActivationClick={() => openActivationModal(company)}
                  menuItems={menuItems}
                />
              );
            })}

          {/* Mensagem quando não há empresas */}
          {!isLoading && !isError && companies.length === 0 && (
            <SidebarMenuItem>
              <div className="p-2 text-sm text-muted-foreground text-center">
                Cadastre uma empresa para iniciar!
              </div>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroup>

      {/* Botão Nova Empresa - sempre disponível */}
      <NewCompanyButton
        showSeparator={companies.length > 0}
        onCompanyCreated={(newCompany) => {
          // Opcional: abrir modal de ativação para a nova empresa
          setActivationModal({
            isOpen: true,
            company: newCompany,
          });
        }}
      />

      {/* Modal de ativação */}
      <CompanyActivationModal
        company={activationModal.company}
        isOpen={activationModal.isOpen}
        onClose={closeActivationModal}
        onSuccess={handleActivationSuccess}
      />
    </>
  );
}
