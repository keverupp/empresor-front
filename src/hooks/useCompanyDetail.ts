// src/hooks/useCompanyDetail.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { appConfig } from "@/config/app";
import { toast } from "sonner";

// Interface para a resposta real da API
export interface CompanyApiResponse {
  id: string;
  owner_id: string;
  name: string;
  legal_name?: string | null;
  document_number: string;
  email: string;
  phone_number?: string | null;
  address_street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_neighborhood?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip_code?: string | null;
  address_country?: string | null;
  logo_url?: string | null;
  pdf_preferences?: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UseCompanyDetailReturn {
  company: CompanyApiResponse | null;
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  fetchCompany: () => Promise<void>;
  updateCompany: (data: Partial<CompanyApiResponse>) => Promise<boolean>;
  deleteCompany: () => Promise<boolean>;
}

export function useCompanyDetail(companyId: string): UseCompanyDetailReturn {
  const { tokens } = useAuth();

  // Estados
  const [company, setCompany] = useState<CompanyApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Headers para requisições
  const getHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${tokens?.accessToken}`,
      "Content-Type": "application/json",
    }),
    [tokens?.accessToken]
  );

  // Fetch company data
  const fetchCompany = useCallback(async () => {
    if (!tokens?.accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${appConfig.development.api.baseURL}/companies/${companyId}`,
        { headers: getHeaders() }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar dados da empresa");
      }

      const data: CompanyApiResponse = await response.json();
      setCompany(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast.error("Erro ao carregar empresa", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [companyId, tokens?.accessToken, getHeaders]);

  // Update company
  const updateCompany = useCallback(
    async (updateData: Partial<CompanyApiResponse>): Promise<boolean> => {
      if (!tokens?.accessToken) return false;

      setIsUpdating(true);

      try {
        const response = await fetch(
          `${appConfig.development.api.baseURL}/companies/${companyId}`,
          {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(updateData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Erro ao atualizar empresa");
        }

        const updatedCompany: CompanyApiResponse = await response.json();
        setCompany(updatedCompany);

        toast.success("Empresa atualizada com sucesso!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        toast.error("Erro ao atualizar empresa", {
          description: errorMessage,
        });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [companyId, tokens?.accessToken, getHeaders]
  );

  // Delete company
  const deleteCompany = useCallback(async (): Promise<boolean> => {
    if (!tokens?.accessToken) return false;

    setIsDeleting(true);

    try {
      const response = await fetch(
        `${appConfig.development.api.baseURL}/companies/${companyId}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao excluir empresa");
      }

      toast.success("Empresa excluída com sucesso!");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Erro ao excluir empresa", {
        description: errorMessage,
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [companyId, tokens?.accessToken, getHeaders]);

  // Effect para carregar dados iniciais
  useEffect(() => {
    if (companyId && tokens?.accessToken) {
      fetchCompany();
    }
  }, [companyId, tokens?.accessToken, fetchCompany]);

  return {
    company,
    isLoading,
    isUpdating,
    isDeleting,
    error,
    fetchCompany,
    updateCompany,
    deleteCompany,
  };
}
