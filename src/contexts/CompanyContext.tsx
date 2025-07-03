// src/contexts/CompanyContext.tsx
"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import type { CompanyContextType } from "@/types/company";

// Criação do contexto
const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// Provider Props
interface CompanyProviderProps {
  children: ReactNode;
}

// Provider Component
export function CompanyProvider({ children }: CompanyProviderProps) {
  const companiesData = useCompanies({
    autoFetch: true,
    params: {
      pageSize: 50, // Busca mais empresas por vez
    },
  });

  // Memoiza o contexto para evitar re-renders desnecessários
  const contextValue: CompanyContextType = useMemo(
    () => ({
      // Dados do hook
      companies: companiesData.companies,
      activeCompany: companiesData.activeCompany,
      activeCompanyId: companiesData.activeCompanyId,

      // Estados
      isLoading: companiesData.isLoading,
      isError: companiesData.isError,
      error: companiesData.error,

      // Ações
      switchCompany: companiesData.switchCompany,
      refreshCompanies: companiesData.refreshCompanies,

      // Permissões
      permissions: companiesData.permissions,
      hasPermission: companiesData.hasPermission,

      // Utilitários
      getCompanyById: companiesData.getCompanyById,
      isOwner: companiesData.isOwner,
    }),
    [
      companiesData.companies,
      companiesData.activeCompany,
      companiesData.activeCompanyId,
      companiesData.isLoading,
      companiesData.isError,
      companiesData.error,
      companiesData.switchCompany,
      companiesData.refreshCompanies,
      companiesData.permissions,
      companiesData.hasPermission,
      companiesData.getCompanyById,
      companiesData.isOwner,
    ]
  );

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
}

// Hook para usar o contexto
export function useCompanyContext(): CompanyContextType {
  const context = useContext(CompanyContext);

  if (context === undefined) {
    throw new Error(
      "useCompanyContext deve ser usado dentro de um CompanyProvider"
    );
  }

  return context;
}

// Hook conveniente para empresa ativa
export function useActiveCompany() {
  const { activeCompany, activeCompanyId, isLoading } = useCompanyContext();

  return useMemo(
    () => ({
      company: activeCompany,
      companyId: activeCompanyId,
      isLoading,
      isActive: !!activeCompany,
    }),
    [activeCompany, activeCompanyId, isLoading]
  );
}

// Hook para permissões da empresa ativa
export function useCompanyPermissions() {
  const { permissions, hasPermission, activeCompany, isOwner } =
    useCompanyContext();

  return useMemo(
    () => ({
      permissions,
      hasPermission,
      isOwner: activeCompany ? isOwner(activeCompany) : false,
      canViewClients: hasPermission("can_view_clients"),
      canCreateQuotes: hasPermission("can_create_quotes"),
      canEditSettings: hasPermission("can_edit_settings"),
      canViewFinance: hasPermission("can_view_finance"),
      canManageProducts: hasPermission("can_manage_products"),
      canViewReports: hasPermission("can_view_reports"),
    }),
    [permissions, hasPermission, activeCompany, isOwner]
  );
}

// Hook para ações de empresa
export function useCompanyActions() {
  const { switchCompany, refreshCompanies, getCompanyById } =
    useCompanyContext();

  return useMemo(
    () => ({
      switchCompany,
      refreshCompanies,
      getCompanyById,
    }),
    [switchCompany, refreshCompanies, getCompanyById]
  );
}
