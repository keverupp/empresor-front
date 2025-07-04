// src/hooks/useCompanyDashboard.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { appConfig } from "@/config/app";
import type { Company } from "@/types/company";

// Interfaces específicas para o dashboard (complementando os types existentes)
export interface CompanyStats {
  total_quotes: number;
  draft_count: number;
  sent_count: number;
  accepted_count: number;
  rejected_count: number;
  total_accepted_value_cents: number;
  avg_accepted_value_cents: number;
  acceptance_rate: number;
}

export interface DashboardQuote {
  id: string;
  quote_number: string;
  status:
    | "draft"
    | "sent"
    | "viewed"
    | "accepted"
    | "rejected"
    | "expired"
    | "invoiced";
  total_amount_cents: number;
  issue_date: string;
  expiry_date?: string | null;
  created_at: string;
  client?: {
    name: string;
    email?: string | null;
  };
}

export interface ExpiringQuote {
  id: string;
  quote_number: string;
  expiry_date: string;
  total_amount_cents: number;
  client_name: string;
  client_email?: string | null;
}

export interface UseCompanyDashboardReturn {
  company: Company | null;
  stats: CompanyStats | null;
  recentQuotes: DashboardQuote[];
  expiringQuotes: ExpiringQuote[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCompanyDashboard(
  companyId: string
): UseCompanyDashboardReturn {
  const { tokens } = useAuth();

  // Estados
  const [company, setCompany] = useState<Company | null>(null);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [recentQuotes, setRecentQuotes] = useState<DashboardQuote[]>([]);
  const [expiringQuotes, setExpiringQuotes] = useState<ExpiringQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

    try {
      const response = await fetch(
        `${appConfig.development.api.baseURL}/api/companies/${companyId}`,
        { headers: getHeaders() }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar dados da empresa");
      }

      const data: Company = await response.json();
      setCompany(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    }
  }, [companyId, tokens?.accessToken, getHeaders]);

  // Fetch company stats
  const fetchStats = useCallback(async () => {
    if (!tokens?.accessToken) return;

    try {
      const response = await fetch(
        `${appConfig.development.api.baseURL}/api/companies/${companyId}/quotes/stats`,
        { headers: getHeaders() }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar estatísticas");
      }

      const data: CompanyStats = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  }, [companyId, tokens?.accessToken, getHeaders]);

  // Fetch recent quotes
  const fetchRecentQuotes = useCallback(async () => {
    if (!tokens?.accessToken) return;

    try {
      const response = await fetch(
        `${appConfig.development.api.baseURL}/api/companies/${companyId}/quotes?limit=5&page=1`,
        { headers: getHeaders() }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar orçamentos");
      }

      const data: DashboardQuote[] = await response.json();
      setRecentQuotes(data);
    } catch (err) {
      console.error("Erro ao carregar orçamentos:", err);
    }
  }, [companyId, tokens?.accessToken, getHeaders]);

  // Fetch expiring quotes
  const fetchExpiringQuotes = useCallback(async () => {
    if (!tokens?.accessToken) return;

    try {
      const response = await fetch(
        `${appConfig.development.api.baseURL}/api/companies/${companyId}/quotes/expiring?days=7`,
        { headers: getHeaders() }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar orçamentos vencendo");
      }

      const data: ExpiringQuote[] = await response.json();
      setExpiringQuotes(data);
    } catch (err) {
      console.error("Erro ao carregar orçamentos vencendo:", err);
    }
  }, [companyId, tokens?.accessToken, getHeaders]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchCompany(),
        fetchStats(),
        fetchRecentQuotes(),
        fetchExpiringQuotes(),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  }, [fetchCompany, fetchStats, fetchRecentQuotes, fetchExpiringQuotes]);

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  // Effect para carregar dados iniciais
  useEffect(() => {
    if (companyId && tokens?.accessToken) {
      fetchAllData();
    }
  }, [companyId, tokens?.accessToken, fetchAllData]);

  return {
    company,
    stats,
    recentQuotes,
    expiringQuotes,
    isLoading,
    error,
    refetch,
  };
}
