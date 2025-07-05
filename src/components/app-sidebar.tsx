// src/components/app-sidebar.tsx
"use client";

import * as React from "react";
import {
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconHelp,
  IconInnerShadowTop,
  IconReport,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";

import { NavCompanies } from "@/components/nav-companies";
import { NavDocuments } from "@/components/nav-documents";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { useUserData } from "@/hooks/useUserData";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Navegação principal (itens que ficam no topo, independente de empresa)
const mainNavigation = [
  {
    title: "Dashboard Geral",
    url: "/dashboard",
    icon: IconDashboard,
    description: "Visão geral de todas as empresas",
  },
];

// Navegação secundária (ferramentas e configurações)
const secondaryNavigation = [
  {
    title: "Configurações",
    url: "/dashboard/settings",
    icon: IconSettings,
  },
  {
    title: "Ajuda",
    url: "/dashboard/help",
    icon: IconHelp,
  },
  {
    title: "Buscar",
    url: "/dashboard/search",
    icon: IconSearch,
  },
];

// Documentos e ferramentas
const documentsNavigation = [
  {
    name: "Biblioteca de Dados",
    url: "/dashboard/data-library",
    icon: IconDatabase,
  },
  {
    name: "Relatórios",
    url: "/dashboard/reports",
    icon: IconReport,
  },
  {
    name: "Assistente de Documentos",
    url: "/dashboard/document-assistant",
    icon: IconFileWord,
  },
];

// Componente para navegação principal
function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {mainNavigation.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.description}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userData, isLoading, error } = useUserData();

  // Dados de fallback caso não consiga carregar
  const fallbackUserData = {
    name: "Usuário",
    email: "usuario@example.com",
  };

  const displayUserData = userData || fallbackUserData;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Header com logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Empresor</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Conteúdo principal */}
      <SidebarContent>
        {/* Dashboard Geral - sempre visível */}
        <NavMain />

        {/* Empresas com accordion - seção principal */}
        <NavCompanies />

        {/* Ferramentas e documentos */}
        <NavDocuments items={documentsNavigation} />

        {/* Navegação secundária - sempre no final */}
        <NavSecondary items={secondaryNavigation} className="mt-auto" />
      </SidebarContent>

      {/* Footer com dados do usuário */}
      <SidebarFooter>
        {isLoading ? (
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ) : (
          <NavUser user={displayUserData} />
        )}
        {error && (
          <div className="text-xs text-red-500 p-2">
            Erro ao carregar dados do usuário
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
