// src/hooks/useQuotes.ts
import { useState, useCallback, useEffect } from "react";
import { useApi } from "./useApi";
import type {
  Quote,
  QuoteListParams,
  QuoteListResponse,
  QuoteCreatePayload,
  QuoteUpdatePayload,
  QuoteStats,
  ExpiringQuote,
  QuoteGenerateNumberResponse,
} from "@/types/quote";

interface UseQuotesOptions {
  companyId: string;
  autoFetch?: boolean;
  params?: QuoteListParams;
}

interface UseQuotesReturn {
  quotes: Quote[];
  pagination: QuoteListResponse["pagination"] | null;
  stats: QuoteStats | null;
  expiringQuotes: ExpiringQuote[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;

  // Actions
  fetchQuotes: (params?: QuoteListParams) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchExpiringQuotes: (days?: number) => Promise<void>;
  createQuote: (data: QuoteCreatePayload) => Promise<Quote>;
  updateQuote: (quoteId: string, data: QuoteUpdatePayload) => Promise<Quote>;
  updateQuoteStatus: (
    quoteId: string,
    status: Quote["status"]
  ) => Promise<Quote>;
  deleteQuote: (quoteId: string) => Promise<void>;
  generateQuoteNumber: () => Promise<string>;
  getQuoteById: (quoteId: string) => Promise<Quote>;

  // Utility functions for filtering
  getQuotesExpiringBetween: (fromDate: string, toDate: string) => Promise<void>;
  getQuotesExpiringToday: () => Promise<void>;
  getQuotesExpiringThisWeek: () => Promise<void>;

  // Utility
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useQuotes = ({
  companyId,
  autoFetch = true,
  params = {},
}: UseQuotesOptions): UseQuotesReturn => {
  const { get, post, put, delete: del } = useApi();

  // Estados
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [pagination, setPagination] = useState<
    QuoteListResponse["pagination"] | null
  >(null);
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [expiringQuotes, setExpiringQuotes] = useState<ExpiringQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar lista de orçamentos
  const fetchQuotes = useCallback(
    async (fetchParams: QuoteListParams = {}) => {
      if (!companyId) return;

      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();

        // Adicionar parâmetros de busca
        const allParams = { ...params, ...fetchParams };
        Object.entries(allParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
          }
        });

        const endpoint = `/companies/${companyId}/quotes`;
        const finalUrl = queryParams.toString()
          ? `${endpoint}?${queryParams.toString()}`
          : endpoint;

        const response = await get<QuoteListResponse>(finalUrl);

        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data) {
          setQuotes(response.data.data || []);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao carregar orçamentos";
        setError(errorMessage);
        console.error("Erro ao buscar orçamentos:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [companyId, get, params]
  );

  // Buscar estatísticas
  const fetchStats = useCallback(async () => {
    if (!companyId) return;

    try {
      const endpoint = `/companies/${companyId}/quotes/stats`;
      const response = await get<QuoteStats>(endpoint);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err);
    }
  }, [companyId, get]);

  // Buscar orçamentos próximos ao vencimento
  const fetchExpiringQuotes = useCallback(
    async (days: number = 7) => {
      if (!companyId) return;

      try {
        // Calcular a data limite (hoje + X dias)
        const today = new Date();
        const limitDate = new Date();
        limitDate.setDate(today.getDate() + days);

        // Formatar datas no padrão ISO (YYYY-MM-DD)
        const todayString = today.toISOString().split("T")[0];
        const limitDateString = limitDate.toISOString().split("T")[0];

        // Usar a rota principal com filtros de data
        const queryParams = new URLSearchParams({
          expiry_date_from: todayString,
          expiry_date_to: limitDateString,
        });

        const endpoint = `/companies/${companyId}/quotes?${queryParams.toString()}`;
        const response = await get<QuoteListResponse>(endpoint);

        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data) {
          // Mapear para o formato ExpiringQuote se necessário
          const expiringData = response.data.data.map((quote) => ({
            id: quote.id,
            quote_number: quote.quote_number,
            expiry_date: quote.expiry_date || "",
            total_amount_cents: quote.total_amount_cents,
            client_name: quote.client.name,
            client_email: quote.client.email || null,
          }));
          setExpiringQuotes(expiringData);
        }
      } catch (err) {
        console.error("Erro ao buscar orçamentos vencendo:", err);
      }
    },
    [companyId, get]
  );

  // Criar orçamento
  const createQuote = useCallback(
    async (data: QuoteCreatePayload): Promise<Quote> => {
      if (!companyId) throw new Error("Company ID é obrigatório");

      setIsCreating(true);
      setError(null);

      try {
        const endpoint = `/companies/${companyId}/quotes`;
        const response = await post<Quote>(endpoint, data);

        if (response.error) {
          throw new Error(response.error);
        }

        if (!response.data) {
          throw new Error("Erro ao criar orçamento");
        }

        // Atualizar lista local
        await fetchQuotes();

        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao criar orçamento";
        setError(errorMessage);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [companyId, post, fetchQuotes]
  );

  // Atualizar orçamento
  const updateQuote = useCallback(
    async (quoteId: string, data: QuoteUpdatePayload): Promise<Quote> => {
      if (!companyId) throw new Error("Company ID é obrigatório");

      setIsUpdating(true);
      setError(null);

      try {
        const endpoint = `/companies/${companyId}/quotes/${quoteId}`;
        const response = await put<Quote>(endpoint, data);

        if (response.error) {
          throw new Error(response.error);
        }

        if (!response.data) {
          throw new Error("Erro ao atualizar orçamento");
        }

        // Atualizar lista local
        await fetchQuotes();

        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao atualizar orçamento";
        setError(errorMessage);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [companyId, put, fetchQuotes]
  );

  // Atualizar apenas status do orçamento
  const updateQuoteStatus = useCallback(
    async (quoteId: string, status: Quote["status"]): Promise<Quote> => {
      if (!companyId) throw new Error("Company ID é obrigatório");

      setIsUpdating(true);
      setError(null);

      try {
        const endpoint = `/companies/${companyId}/quotes/${quoteId}/status`;
        const response = await put<Quote>(endpoint, { status });

        if (response.error) {
          throw new Error(response.error);
        }

        if (!response.data) {
          throw new Error("Erro ao atualizar status do orçamento");
        }

        // Atualizar lista local
        await fetchQuotes();

        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao atualizar status";
        setError(errorMessage);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [companyId, put, fetchQuotes]
  );

  // Deletar orçamento
  const deleteQuote = useCallback(
    async (quoteId: string): Promise<void> => {
      if (!companyId) throw new Error("Company ID é obrigatório");

      setIsDeleting(true);
      setError(null);

      try {
        const endpoint = `/companies/${companyId}/quotes/${quoteId}`;
        const response = await del(endpoint);

        if (response.error) {
          throw new Error(response.error);
        }

        // Atualizar lista local
        await fetchQuotes();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao deletar orçamento";
        setError(errorMessage);
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    [companyId, del, fetchQuotes]
  );

  // Gerar número do orçamento
  const generateQuoteNumber = useCallback(async (): Promise<string> => {
    if (!companyId) throw new Error("Company ID é obrigatório");

    try {
      const endpoint = `/companies/${companyId}/quotes/generate-number`;
      const response = await get<QuoteGenerateNumberResponse>(endpoint);

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error("Erro ao gerar número do orçamento");
      }

      return response.data.quote_number;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao gerar número";
      setError(errorMessage);
      throw err;
    }
  }, [companyId, get]);

  // Buscar orçamento por ID
  const getQuoteById = useCallback(
    async (quoteId: string): Promise<Quote> => {
      if (!companyId) throw new Error("Company ID é obrigatório");

      try {
        const endpoint = `/companies/${companyId}/quotes/${quoteId}`;
        const response = await get<Quote>(endpoint);

        if (response.error) {
          throw new Error(response.error);
        }

        if (!response.data) {
          throw new Error("Orçamento não encontrado");
        }

        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao buscar orçamento";
        setError(errorMessage);
        throw err;
      }
    },
    [companyId, get]
  );

  // Buscar orçamentos em período específico de vencimento
  const getQuotesExpiringBetween = useCallback(
    async (fromDate: string, toDate: string) => {
      await fetchQuotes({
        expiry_date_from: fromDate,
        expiry_date_to: toDate,
      });
    },
    [fetchQuotes]
  );

  // Buscar orçamentos que vencem hoje
  const getQuotesExpiringToday = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    await fetchQuotes({
      expiry_date_from: today,
      expiry_date_to: today,
    });
  }, [fetchQuotes]);

  // Buscar orçamentos que vencem esta semana
  const getQuotesExpiringThisWeek = useCallback(async () => {
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);

    const todayString = today.toISOString().split("T")[0];
    const weekString = weekFromNow.toISOString().split("T")[0];

    await fetchQuotes({
      expiry_date_from: todayString,
      expiry_date_to: weekString,
    });
  }, [fetchQuotes]);

  // Função para recarregar dados
  const refetch = useCallback(async () => {
    await Promise.all([fetchQuotes(), fetchStats(), fetchExpiringQuotes()]);
  }, [fetchQuotes, fetchStats, fetchExpiringQuotes]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto fetch na inicialização
  useEffect(() => {
    if (autoFetch && companyId) {
      refetch();
    }
  }, [autoFetch, companyId, refetch]);

  return {
    quotes,
    pagination,
    stats,
    expiringQuotes,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,

    fetchQuotes,
    fetchStats,
    fetchExpiringQuotes,
    createQuote,
    updateQuote,
    updateQuoteStatus,
    deleteQuote,
    generateQuoteNumber,
    getQuoteById,

    // Utility functions for date filtering
    getQuotesExpiringBetween,
    getQuotesExpiringToday,
    getQuotesExpiringThisWeek,

    refetch,
    clearError,
  };
};
