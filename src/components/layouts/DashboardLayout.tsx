// src/components/layouts/DashboardLayout.tsx
"use client";

import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { BreadcrumbItem } from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function DashboardLayout({
  children,
  title,
  description,
  className = "",
}: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redireciona para login se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderiza o dashboard
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "280px",
          "--header-height": "60px",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />

        {/* Título e descrição da página */}
        {(title || description) && (
          <div className="flex flex-col gap-1 px-4 py-6 md:px-6">
            {title && (
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            )}
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>
        )}

        {/* Conteúdo da página */}
        <div className={`flex flex-1 flex-col ${className}`}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Hook para facilitar a configuração das páginas
export function useDashboardLayout() {
  return {
    createBreadcrumbs: (items: Array<{ label: string; href?: string }>) => {
      return items.map((item, index) => ({
        ...item,
        current: index === items.length - 1,
      }));
    },
  };
}
