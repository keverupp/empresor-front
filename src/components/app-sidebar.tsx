"use client";

import * as React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
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
} from "@/components/ui/sidebar";
import { useUserData } from "@/hooks/useUserData";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Dados da navegação com URLs corretas do dashboard
const navigationData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Orçamentos",
      url: "/dashboard/quotes",
      icon: IconListDetails,
    },
    {
      title: "Clientes",
      url: "/dashboard/clients",
      icon: IconUsers,
    },
    {
      title: "Produtos",
      url: "/dashboard/products",
      icon: IconFolder,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: IconChartBar,
    },
  ],
  navSecondary: [
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
  ],
  documents: [
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
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userData, isLoading, error } = useUserData();

  // Dados de fallback caso não consiga carregar
  const fallbackUserData = {
    name: "Usuário",
    email: "usuario@example.com",
    avatar: "/avatars/default.jpg",
  };

  const displayUserData = userData || fallbackUserData;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
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
      <SidebarContent>
        <NavMain items={navigationData.navMain} />
        <NavDocuments items={navigationData.documents} />
        <NavSecondary items={navigationData.navSecondary} className="mt-auto" />
      </SidebarContent>
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
