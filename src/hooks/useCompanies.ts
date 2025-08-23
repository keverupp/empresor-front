// src/hooks/useCompanies.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { appConfig } from "@/config/app";
import type {
  Company,
  CompanyListResponse,
  CompanyListParams,
  CompanyPermissions,
} from "@/types/company";

interface UseCompaniesOptions {
  autoFetch?: boolean;
  params?: CompanyListParams;
}

interface UseCompaniesReturn {
  // Dados
  companies: Company[];
  activeCompany: Company | null;
  activeCompanyId: string | null;

  // Estados
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Ações
  fetchCompanies: () => Promise<void>;
  refreshCompanies: () => Promise<void>;
  switchCompany: (companyId: string) => void;
  getCompanyById: (id: string) => Company | undefined;

  // Permissões
  permissions: CompanyPermissions;
  hasPermission: (permission: keyof CompanyPermissions) => boolean;
  isOwner: (company: Company) => boolean;
}

const DEFAULT_PERMISSIONS: CompanyPermissions = {
  can_view_clients: false,
  can_create_quotes: false,
  can_edit_settings: false,
  can_view_finance: false,
  can_manage_products: false,
  can_view_reports: false,
};

export function useCompanies(
  options: UseCompaniesOptions = {}
): UseCompaniesReturn {
  const { autoFetch = true, params = {} } = options;
  const { tokens, user } = useAuth();

  // Estados
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Recupera empresa ativa do localStorage apenas uma vez
  useEffect(() => {
    const stored = localStorage.getItem("activeCompanyId");
    if (stored) {
      setActiveCompanyId(stored);
    }
    setHasInitialized(true);
  }, []);

  // Persiste empresa ativa no localStorage
  const switchCompany = useCallback((companyId: string) => {
    setActiveCompanyId(companyId);
    localStorage.setItem("activeCompanyId", companyId);
  }, []);

  // Função para fazer requisição à API
  const fetchCompanies = useCallback(async () => {
    if (!tokens?.accessToken) {
      setError(new Error("Token de acesso não encontrado"));
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const searchParams = new URLSearchParams();

      // Adiciona parâmetros de busca
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.pageSize)
        searchParams.append("pageSize", params.pageSize.toString());
      if (params.name) searchParams.append("name", params.name);
      if (params.status) searchParams.append("status", params.status);
      if (params.owner_id) searchParams.append("owner_id", params.owner_id);
      if (params.document_number)
        searchParams.append("document_number", params.document_number);

      const url = `${appConfig.development.api.baseURL}${
        appConfig.urls.api.endpoints.companies.list
      }${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar empresas: ${response.status}`);
      }

      const data: CompanyListResponse = await response.json();
      const mapped = (data.data || []).map((c) => ({
        ...c,
        logo_url: c.logo_url
          ? `${c.logo_url}${c.logo_url.includes("?") ? "&" : "?"}v=${encodeURIComponent(c.updated_at)}`
          : undefined,
      }));
      setCompanies(mapped);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(new Error(errorMessage));
      setIsError(true);
      console.error("Erro ao buscar empresas:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    tokens?.accessToken,
    params.page,
    params.pageSize,
    params.name,
    params.status,
    params.owner_id,
    params.document_number,
  ]);

  // Refresh que limpa cache
  const refreshCompanies = useCallback(async () => {
    await fetchCompanies();
  }, [fetchCompanies]);

  // Busca automática ao montar o componente
  useEffect(() => {
    if (autoFetch && tokens?.accessToken && hasInitialized) {
      fetchCompanies();
    }
    // A dependência `fetchCompanies` já contempla mudanças em `params`
    // e nos tokens; remover `isLoading` evita requisições em loop.
  }, [autoFetch, tokens?.accessToken, hasInitialized, fetchCompanies]);

  // Efeito separado para selecionar primeira empresa
  useEffect(() => {
    if (hasInitialized && !activeCompanyId && companies.length > 0) {
      const firstCompany = companies[0];
      switchCompany(firstCompany.id);
    }
  }, [hasInitialized, activeCompanyId, companies, switchCompany]);

  // Busca empresa por ID
  const getCompanyById = useCallback(
    (id: string): Company | undefined => {
      return companies.find((company) => company.id === id);
    },
    [companies]
  );

  // Empresa ativa - garantindo que não seja undefined
  const activeCompany = activeCompanyId
    ? getCompanyById(activeCompanyId) || null
    : null;

  // Verifica se é proprietário da empresa
  const isOwner = useCallback(
    (company: Company): boolean => {
      // Converte user.id (string) para number para comparar com owner_id (number)
      const userId = user?.id ? parseInt(user.id, 10) : null;
      return userId === company.owner_id;
    },
    [user?.id]
  );

  // Obtém permissões da empresa ativa
  // TODO: Implementar busca de permissões específicas via API quando for compartilhada
  const permissions: CompanyPermissions = useMemo(() => {
    if (!activeCompany) return DEFAULT_PERMISSIONS;
    return isOwner(activeCompany)
      ? {
          can_view_clients: true,
          can_create_quotes: true,
          can_edit_settings: true,
          can_view_finance: true,
          can_manage_products: true,
          can_view_reports: true,
        }
      : DEFAULT_PERMISSIONS; // TODO: Buscar permissões reais da API de shares
  }, [activeCompany, isOwner]);

  // Verifica se tem permissão específica
  const hasPermission = useCallback(
    (permission: keyof CompanyPermissions): boolean => {
      return permissions[permission] === true;
    },
    [permissions]
  );

  return {
    // Dados
    companies,
    activeCompany,
    activeCompanyId,

    // Estados
    isLoading,
    isError,
    error,

    // Ações
    fetchCompanies,
    refreshCompanies,
    switchCompany,
    getCompanyById,

    // Permissões
    permissions,
    hasPermission,
    isOwner,
  };
}
