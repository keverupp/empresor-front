// src/hooks/useClientDetail.ts
import { useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Client } from "@/types/apiInterfaces";

export interface ClientUpdatePayload {
  name: string;
  email?: string | null;
  phone_number?: string | null;
  document_number?: string | null;
  address_street?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip_code?: string | null;
  notes?: string | null;
}

export interface UseClientDetailReturn {
  client: Client | null;
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  fetchClient: () => Promise<void>;
  updateClient: (updateData: ClientUpdatePayload) => Promise<boolean>;
  deleteClient: () => Promise<boolean>;
  clearError: () => void;
}

export function useClientDetail(
  companyId: string,
  clientId: string
): UseClientDetailReturn {
  const { tokens } = useAuth();
  const { get, put, delete: del } = useApi();

  // Estados
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar cliente
    const fetchClient = useCallback(async () => {
      if (!companyId || !clientId || !tokens?.accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await get<Client>(
        `/companies/${companyId}/clients/${clientId}`,
        { showErrorToast: true }
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setClient(response.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar cliente";
      setError(errorMessage);
      console.error("Erro ao buscar cliente:", err);
    } finally {
      setIsLoading(false);
    }
    }, [companyId, clientId, tokens?.accessToken, get]);

  // Atualizar cliente
  const updateClient = useCallback(
      async (updateData: ClientUpdatePayload): Promise<boolean> => {
        if (!companyId || !clientId || !tokens?.accessToken) return false;

      setIsUpdating(true);
      setError(null);

      try {
        // Converter strings vazias para null conforme esperado pela API
        const apiPayload = Object.entries(updateData).reduce(
          (acc, [key, value]) => {
            acc[key] = value === "" ? null : value;
            return acc;
          },
          {} as Record<string, any>
        );

        const response = await put<Client>(
          `/companies/${companyId}/clients/${clientId}`,
          apiPayload,
          { showErrorToast: true }
        );

        if (response.error) {
          setError(response.error);
          return false;
        }

        if (response.data) {
          setClient(response.data);
          toast.success("Cliente atualizado com sucesso!");
          return true;
        }

        return false;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao atualizar cliente";
        setError(errorMessage);
        console.error("Erro ao atualizar cliente:", err);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
      [companyId, clientId, tokens?.accessToken, put]
    );

  // Excluir cliente
    const deleteClient = useCallback(async (): Promise<boolean> => {
      if (!companyId || !clientId || !tokens?.accessToken) return false;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await del(
        `/companies/${companyId}/clients/${clientId}`,
        undefined,
        { showErrorToast: true }
      );

      if (response.error) {
        setError(response.error);
        return false;
      }

      toast.success("Cliente excluído com sucesso!");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao excluir cliente";
      setError(errorMessage);
      console.error("Erro ao excluir cliente:", err);
      return false;
    } finally {
      setIsDeleting(false);
    }
    }, [companyId, clientId, tokens?.accessToken, del]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    client,
    isLoading,
    isUpdating,
    isDeleting,
    error,
    fetchClient,
    updateClient,
    deleteClient,
    clearError,
  };
}
