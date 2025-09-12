// src/hooks/useQuotes.ts
"use client";

import { useState, useCallback, useRef } from "react";
import { useApi } from "@/hooks/useApi";
import { type Quote, type Client, type Product } from "@/types/apiInterfaces";
import {
  type CreateQuoteData,
  type UpdateQuoteData,
} from "@/lib/quote-schemas";

interface UseQuotesOptions {
  companyId: string;
}

interface QuotesListResponse {
  data: Quote[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

interface QuotesFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  client_id?: string;
  quote_number?: string;
  issue_date_from?: string;
  issue_date_to?: string;
  expiry_date_from?: string;
  expiry_date_to?: string;
}

interface QuoteStatsResponse {
  total_quotes: number;
  draft_count: number;
  sent_count: number;
  accepted_count: number;
  rejected_count: number;
  total_accepted_value_cents: number;
  avg_accepted_value_cents: number;
  acceptance_rate: number;
}

interface GenerateNumberResponse {
  quote_number: string;
}

/** Normaliza diferentes formatos de retorno (Axios vs fetch vs array) */
function normalizeQuotesList(payload: any): QuotesListResponse {
  if (payload?.data && Array.isArray(payload.data)) {
    return { data: payload.data, pagination: payload.pagination };
  }
  if (Array.isArray(payload)) {
    return { data: payload };
  }
  if (payload?.data?.data && Array.isArray(payload.data.data)) {
    return { data: payload.data.data, pagination: payload.data.pagination };
  }
  return { data: [], pagination: undefined };
}

export function useQuotes({ companyId }: UseQuotesOptions) {
  const { apiCall } = useApi();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
  });

  // Guarda o último filtro usado para refetch após criar/atualizar/excluir
  const lastFiltersRef = useRef<QuotesFilters>({ page: 1, pageSize: 10 });

  const fetchQuotes = useCallback(
    async (filters: QuotesFilters = {}) => {
      if (!companyId) return;

      setIsLoading(true);
      setError(null);

      try {
        lastFiltersRef.current = { page: 1, pageSize: 10, ...filters };

        const params = new URLSearchParams();
        Object.entries(lastFiltersRef.current).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") {
            params.append(k, String(v));
          }
        });

        const endpoint = `/companies/${companyId}/quotes${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        const raw = await apiCall(endpoint, { method: "GET" });
        const normalized = normalizeQuotesList(raw);

        const list = normalized.data ?? [];
        const pag = normalized.pagination ?? {
          totalItems: list.length,
          totalPages: Math.max(
            1,
            Math.ceil(list.length / (lastFiltersRef.current.pageSize ?? 10))
          ),
          currentPage: lastFiltersRef.current.page ?? 1,
          pageSize: lastFiltersRef.current.pageSize ?? 10,
        };

        setQuotes(list);
        setPagination(pag);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao buscar orçamentos";
        setError(msg);
        setQuotes([]);
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall, companyId]
  );

  const refetchAfterMutation = useCallback(async () => {
    try {
      await fetchQuotes(lastFiltersRef.current);
    } catch {
      // erros já tratados no fetchQuotes
    }
  }, [fetchQuotes]);

  const fetchQuoteById = useCallback(
    async (quoteId: string): Promise<Quote | null> => {
      if (!companyId || !quoteId) return null;
      try {
        const endpoint = `/companies/${companyId}/quotes/${quoteId}`;
        const res = await apiCall<Quote>(endpoint, { method: "GET" });
        return res.data;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao buscar orçamento";
        setError(msg);
        return null;
      }
    },
    [apiCall, companyId]
  );

  const createQuote = useCallback(
    async (data: CreateQuoteData): Promise<Quote | null> => {
      if (!companyId) return null;

      setIsCreating(true);
      setError(null);

      try {
        const endpoint = `/companies/${companyId}/quotes`;
        const res = await apiCall<Quote>(endpoint, {
          method: "POST",
          body: JSON.stringify(data),
        });
        await refetchAfterMutation();
        return res.data;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao criar orçamento";
        setError(msg);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [apiCall, companyId, refetchAfterMutation]
  );

  const updateQuote = useCallback(
    async (quoteId: string, data: UpdateQuoteData): Promise<Quote | null> => {
      if (!companyId || !quoteId) return null;

      setIsUpdating(true);
      setError(null);

      try {
        const endpoint = `/companies/${companyId}/quotes/${quoteId}`;
        const res = await apiCall<Quote>(endpoint, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        await refetchAfterMutation();
        return res.data;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao atualizar orçamento";
        setError(msg);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [apiCall, companyId, refetchAfterMutation]
  );

  const updateQuoteStatus = useCallback(
    async (quoteId: string, status: Quote["status"]): Promise<boolean> => {
      if (!companyId || !quoteId) return false;

      // Atualiza otimisticamente o estado local
      setQuotes((prev) =>
        prev.map((q) => (q.id === quoteId ? { ...q, status } : q)),
      );

      try {
        const endpoint = `/companies/${companyId}/quotes/${quoteId}/status`;
        await apiCall(endpoint, {
          method: "PUT",
          body: JSON.stringify({ status }),
        });

        await refetchAfterMutation();
        return true;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao atualizar status";
        setError(msg);
        // Recarrega lista para desfazer alteração otimista
        await refetchAfterMutation();
        return false;
      }
    },
    [apiCall, companyId, refetchAfterMutation]
  );

  const deleteQuote = useCallback(
    async (quoteId: string): Promise<boolean> => {
      if (!companyId || !quoteId) return false;

      setIsDeleting(true);
      setError(null);

      try {
        const endpoint = `/companies/${companyId}/quotes/${quoteId}`;
        await apiCall(endpoint, {
          method: "DELETE",
          body: JSON.stringify({}), // body vazio para compatibilidade com content-type json
        });

        await refetchAfterMutation();
        return true;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao excluir orçamento";
        setError(msg);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [apiCall, companyId, refetchAfterMutation]
  );

  const generateQuoteNumber = useCallback(async (): Promise<string> => {
    if (!companyId) return "";

    try {
      const endpoint = `/companies/${companyId}/quotes/generate-number`;
      const res = await apiCall<GenerateNumberResponse>(endpoint, {
        method: "GET",
      });
      return res.data?.quote_number ?? "";
    } catch {
      // Fallback local
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      const t = String(now.getTime()).slice(-4);
      return `ORC-${y}${m}${d}-${t}`;
    }
  }, [apiCall, companyId]);

  const fetchClients = useCallback(async (): Promise<Client[]> => {
    if (!companyId) return [];
    try {
      const endpoint = `/companies/${companyId}/clients`;
      const res = await apiCall<Client[]>(endpoint, { method: "GET" });
      return res.data ?? [];
    } catch {
      return [];
    }
  }, [apiCall, companyId]);

  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    if (!companyId) return [];
    try {
      const endpoint = `/companies/${companyId}/products/active`;
      const res = await apiCall<Product[]>(endpoint, { method: "GET" });
      return res.data ?? [];
    } catch {
      return [];
    }
  }, [apiCall, companyId]);

  const fetchQuoteStats =
    useCallback(async (): Promise<QuoteStatsResponse | null> => {
      if (!companyId) return null;
      try {
        const endpoint = `/companies/${companyId}/quotes/stats`;
        const res = await apiCall<QuoteStatsResponse>(endpoint, {
          method: "GET",
        });
        return res.data;
      } catch {
        return null;
      }
    }, [apiCall, companyId]);

  const fetchExpiringQuotes = useCallback(
    async (days: number = 7) => {
      if (!companyId) return [];
      try {
        const endpoint = `/companies/${companyId}/quotes/expiring?days=${days}`;
        const res = await apiCall<Quote[]>(endpoint, { method: "GET" });
        return res.data ?? [];
      } catch {
        return [];
      }
    },
    [apiCall, companyId]
  );

  const generatePdf = useCallback(
    async (quoteId: string) => {
      if (!companyId || !quoteId) return;

      try {
        const pdfResponse = await apiCall<{
          title: string;
          data: Record<string, unknown>;
        }>(
          `/companies/${companyId}/quotes/${quoteId}/pdf-data`,
          { method: "GET" }
        );

        const { title, data } = pdfResponse.data ?? {};
        if (!title || !data) {
          throw new Error("Dados do PDF não retornados");
        }

        const payload = {
          type: "budget-premium",
          title,
          data,
          config: {
            format: "A4",
            orientation: "portrait",
            margin: {
              top: "1cm",
              right: "1cm",
              bottom: "1cm",
              left: "1cm",
            },
          },
        };

        const pdfRes = await apiCall<{ url?: string }>(
          process.env.PDF_API_URL ?? "https://pdf.empresor.com.br/pdf",
          {
            method: "POST",
            skipAuth: true,
            headers: {
              "x-api-key":
                process.env.PDF_API_KEY ??
                "9dbfce7254de4aa79dd6224df978d83c1cfced4092d2bf8a098c520aa20f25de",
            },
            body: JSON.stringify(payload),
          }
        );

        const url = pdfRes.data?.url;
        if (url) {
          window.open(url, "_blank");
        } else {
          throw new Error("URL do PDF não retornada");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao gerar PDF";
        setError(msg);
      }
    },
    [apiCall, companyId]
  );

  return {
    // Estado
    quotes,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    pagination,

    // Ações CRUD
    fetchQuotes,
    fetchQuoteById,
    createQuote,
    updateQuote,
    updateQuoteStatus,
    deleteQuote,

    // Utilitários
    generateQuoteNumber,
    fetchClients,
    fetchProducts,
    fetchQuoteStats,
    fetchExpiringQuotes,
    generatePdf,
  };
}
