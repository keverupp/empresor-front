// src/hooks/useCompanyDetail.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { appConfig } from "@/config/app";
import { detectDocumentType } from "@/lib/format-utils";
import type { Company } from "@/types/company";

// Função para converter CompanyApiResponse para Company
export function apiResponseToCompany(apiResponse: CompanyApiResponse): Company {
  const documentType = detectDocumentType(apiResponse.document_number);

  return {
    id: apiResponse.id,
    name: apiResponse.name,
    document_number: apiResponse.document_number,
    document_type: documentType !== "UNKNOWN" ? documentType : "CNPJ",
    status: apiResponse.status as any,
    email: apiResponse.email,
    phone: apiResponse.phone_number || undefined,
    website: undefined, // API não tem este campo
    logo_url: apiResponse.logo_url || undefined,
    address: {
      street: apiResponse.address_street || undefined,
      number: apiResponse.address_number || undefined,
      complement: apiResponse.address_complement || undefined,
      neighborhood: apiResponse.address_neighborhood || undefined,
      city: apiResponse.address_city || undefined,
      state: apiResponse.address_state || undefined,
      zip_code: apiResponse.address_zip_code || undefined,
    },
    owner_id: parseInt(apiResponse.owner_id), // Conversão string para number
    created_at: apiResponse.created_at,
    updated_at: apiResponse.updated_at,
  };
}

// Interface para a resposta real da API
export interface CompanyApiResponse {
  id: string;
  owner_id: string;
  name: string;
  legal_name?: string | null;
  document_number: string;
  document_type?: "CNPJ" | "CPF"; // Campo derivado para compatibilidade
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

  // Fetch company data
  const fetchCompany = useCallback(async () => {
    if (!tokens?.accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${appConfig.development.api.baseURL}/companies/${companyId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar dados da empresa");
      }

      const data: CompanyApiResponse = await response.json();
      const documentType = detectDocumentType(data.document_number);
      data.document_type =
        documentType !== "UNKNOWN" ? documentType : undefined;
      setCompany(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, tokens?.accessToken]);

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
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Erro ao atualizar empresa");
        }

        const updatedCompany: CompanyApiResponse = await response.json();
        const documentType = detectDocumentType(updatedCompany.document_number);
        updatedCompany.document_type =
          documentType !== "UNKNOWN" ? documentType : undefined;
        setCompany(updatedCompany);

        return true;
      } catch (err) {
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [companyId, tokens?.accessToken]
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
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao excluir empresa");
      }

      return true;
    } catch (err) {
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [companyId, tokens?.accessToken]);

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
