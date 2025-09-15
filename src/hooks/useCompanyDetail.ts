// src/hooks/useCompanyDetail.ts
import { useState, useCallback, useEffect, useContext } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/hooks/useApi";
import { detectDocumentType } from "@/lib/format-utils";
import type { Company } from "@/types/company";
import { appConfig } from "@/config/app";
import { toast } from "sonner";
import { CompanyContext } from "@/contexts/CompanyContext";

// ... (manter todas as interfaces existentes)
export interface CompanyApiResponse {
  id: string;
  name: string;
  legal_name?: string | null;
  document_number: string;
  document_type?: "CPF" | "CNPJ" | undefined;
  email: string;
  phone_number?: string | null;
  website?: string | null;
  address_street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_neighborhood?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip_code?: string | null;
  address_country?: string | null;
  logo_url?: string | null;
  status?: "active" | "inactive" | "pending_verification";
  owner_id?: string | null;
  created_at: string;
  updated_at: string;
}

// ... (manter outras interfaces e funções helper)

export interface UseCompanyDetailReturn {
  company: CompanyApiResponse | null;
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isUploadingLogo: boolean;
  error: string | null;
  fetchCompany: () => Promise<void>;
  updateCompany: (updateData: Partial<CompanyApiResponse>) => Promise<boolean>;
  deleteCompany: () => Promise<boolean>;
  uploadLogo: (file: File) => Promise<boolean>;
}

export function useCompanyDetail(companyId: string): UseCompanyDetailReturn {
  const { tokens } = useAuth();
  const { get, put, delete: del } = useApi(); // ✅ Usar o sistema centralizado
  const companyContext = useContext(CompanyContext);
  const refreshCompanies = companyContext?.refreshCompanies;

  // Estados
  const [company, setCompany] = useState<CompanyApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch company
  const fetchCompany = useCallback(async () => {
    if (!tokens?.accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      // ✅ Usar useApi em vez de fetch direto
      const response = await get<CompanyApiResponse>(
        `/companies/${companyId}`,
        { showErrorToast: true } // Toast de erro automático
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        // Derivar document_type baseado no document_number para compatibilidade
        const documentType = detectDocumentType(response.data.document_number);
        const processed = {
          ...response.data,
          document_type:
            documentType !== "UNKNOWN" ? documentType : undefined,
        };
        if (processed.logo_url) {
          processed.logo_url = `${processed.logo_url}${processed.logo_url.includes("?") ? "&" : "?"}v=${encodeURIComponent(processed.updated_at)}`;
        }
        setCompany(processed);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      // ✅ Erro já tratado pelo useApi com toast automático
    } finally {
      setIsLoading(false);
    }
  }, [companyId, tokens?.accessToken, get]);

  // Update company
  const updateCompany = useCallback(
    async (updateData: Partial<CompanyApiResponse>): Promise<boolean> => {
      if (!tokens?.accessToken) return false;

      setIsUpdating(true);

      try {
        // ✅ Usar useApi em vez de fetch direto
        const response = await put<CompanyApiResponse>(
          `/companies/${companyId}`,
          updateData,
          {
            showErrorToast: true, // Toast de erro automático
            showSuccessToast: false, // Sucesso será tratado no componente
          }
        );

        if (response.error) {
          return false;
        }

        if (response.data) {
          // Derivar document_type baseado no document_number para compatibilidade
          const documentType = detectDocumentType(
            response.data.document_number
          );
          const processed = {
            ...response.data,
            document_type:
              documentType !== "UNKNOWN" ? documentType : undefined,
          };
          if (processed.logo_url) {
            processed.logo_url = `${processed.logo_url}${processed.logo_url.includes("?") ? "&" : "?"}v=${encodeURIComponent(processed.updated_at)}`;
          }
          setCompany(processed);
          return true;
        }

        return false;
      } catch {
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [companyId, tokens?.accessToken, put]
  );

  // Delete company
  const deleteCompany = useCallback(async (): Promise<boolean> => {
    if (!tokens?.accessToken) return false;

    setIsDeleting(true);

    try {
      const response = await del<void>(`/companies/${companyId}`, {
        showErrorToast: true, // Toast de erro automático
        showSuccessToast: false, // Sucesso será tratado no componente
      });

      if (response.error) {
        return false;
      }

      return true;
    } catch {
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [companyId, tokens?.accessToken, del]);

  // Upload logo
  const uploadLogo = useCallback(
    async (file: File): Promise<boolean> => {
      if (!tokens?.accessToken) return false;

      setIsUploadingLogo(true);
      const formData = new FormData();
      formData.append("logo", file);

      try {
        const endpoint = `${appConfig.development.api.baseURL}${appConfig.urls.api.endpoints.companies.logo(companyId)}`;
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          toast.error("Falha ao atualizar logo");
          return false;
        }

        const data = (await response.json()) as Partial<CompanyApiResponse>;
        setCompany((prev) => {
          const merged = { ...(prev ?? {}), ...data } as CompanyApiResponse;
          if (merged.document_number) {
            const documentType = detectDocumentType(merged.document_number);
            merged.document_type =
              documentType !== "UNKNOWN" ? documentType : undefined;
          }
          if (merged.owner_id != null) {
            merged.owner_id = String(merged.owner_id);
          }
          if (merged.logo_url) {
            const cacheKey = merged.updated_at
              ? encodeURIComponent(merged.updated_at)
              : Date.now();
            merged.logo_url = `${merged.logo_url}${merged.logo_url.includes("?") ? "&" : "?"}v=${cacheKey}`;
          }
          return merged;
        });
        await refreshCompanies?.();
        return true;
      } catch (err) {
        console.error("Erro ao enviar logo:", err);
        toast.error("Erro ao enviar logo");
        return false;
      } finally {
        setIsUploadingLogo(false);
      }
    },
    [companyId, tokens?.accessToken, refreshCompanies]
  );

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
    isUploadingLogo,
    error,
    fetchCompany,
    updateCompany,
    deleteCompany,
    uploadLogo,
  };
}

// ... (manter funções helper existentes como detectDocumentType, apiResponseToCompany, etc.)

// Função para converter CompanyApiResponse para Company
export function apiResponseToCompany(apiResponse: CompanyApiResponse): Company {
  const documentType = detectDocumentType(apiResponse.document_number);
  const status = apiResponse.status ?? "active";

  return {
    id: apiResponse.id,
    name: apiResponse.name,
    document_number: apiResponse.document_number,
    document_type: documentType !== "UNKNOWN" ? documentType : "CNPJ",
    status: status as Company["status"],
    email: apiResponse.email,
    phone: apiResponse.phone_number || undefined,
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
    owner_id: apiResponse.owner_id ?? "",
    created_at: apiResponse.created_at,
    updated_at: apiResponse.updated_at,
  };
}
