// src/components/layouts/DashboardLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

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
  fetchCompanies?: boolean;
}

// Componente interno que usa o CompanyContext
function DashboardContent({
  children,
  title,
  description,
  actions,
  className = "",
}: DashboardLayoutProps) {
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
        <SiteHeader actions={actions} />

        {/* Título e descrição da página */}
        {(title || description) && (
          <div className="flex flex-col gap-1 px-4 py-6 md:px-6">
            {title && (
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                {title}
              </h1>
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

export function DashboardLayout({
  children,
  title,
  description,
  breadcrumbs,
  actions,
  className = "",
  fetchCompanies = true,
}: DashboardLayoutProps) {
  const { isAuthenticated, isLoading, validateSession } = useAuth();
  const router = useRouter();
  const [hasValidated, setHasValidated] = useState(false);

  // Validar sessão uma única vez no mount
  useEffect(() => {
    const validateAuth = async () => {
      if (!hasValidated) {
        await validateSession();
        setHasValidated(true);
      }
    };

    validateAuth();
  }, [validateSession, hasValidated]);

  // Redirecionar para login quando sessão for inválida
  useEffect(() => {
    if (hasValidated && !isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, hasValidated, router]);

  // Loading enquanto valida
  if (isLoading || !hasValidated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Validando sessão...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado após validação, não renderiza
  if (!isAuthenticated) {
    return null;
  }

  // Envolve todo o dashboard com o CompanyProvider
  return (
    <CompanyProvider autoFetch={fetchCompanies}>
      <DashboardContent
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={actions}
        className={className}
      >
        {children}
      </DashboardContent>
    </CompanyProvider>
  );
}

// Hook para facilitar a configuração das páginas
export function useDashboardLayout() {
  return {
    createBreadcrumbs: (items: Array<{ label: string; href?: string }>) =>
      items.map((item, index) => ({
        ...item,
        current: index === items.length - 1,
      })),
  };
}
