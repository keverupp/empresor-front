// src/hooks/useCompanyDashboardData.ts
import { useCallback, useEffect, useState } from "react";
import { buildApiUrl } from "@/config/app";
import { useApi } from "@/hooks/useApi";
import type { DashboardQuote, DashboardSummary } from "@/hooks/useDashboard";

interface CompanyStatsItem extends DashboardSummary {
  company_id: string;
  company_name: string;
}

export function useCompanyDashboardData(companyId: string) {
  const { get } = useApi();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [quotations, setQuotations] = useState<DashboardQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    const [statsRes, quotesRes] = await Promise.all([
      get<CompanyStatsItem[]>(buildApiUrl.dashboard.companiesStats()),
      get<{ data: DashboardQuote[] }>(
        `${buildApiUrl.dashboard.quotations()}?company_id=${companyId}`
      ),
    ]);

    if (!statsRes.error && statsRes.data) {
      const stats = statsRes.data.find(
        (item) => item.company_id === companyId
      );
      if (stats) {
        const { company_id, company_name, ...rest } = stats;
        void company_id;
        void company_name;
        setSummary(rest);
      }
    }

    if (!quotesRes.error && quotesRes.data) {
      setQuotations(quotesRes.data.data);
    }

    setIsLoading(false);
  }, [companyId, get]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { summary, quotations, isLoading, refetch: fetchData };
}
