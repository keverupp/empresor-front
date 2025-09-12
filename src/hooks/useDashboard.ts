// src/hooks/useDashboard.ts
import { useEffect, useState, useCallback } from "react";
import { buildApiUrl } from "@/config/app";
import { useApi } from "@/hooks/useApi";
import type { QuoteStatus } from "@/types/quote";

export interface DashboardSummary {
  total_quotations: number;
  draft_quotations: number;
  sent_quotations: number;
  viewed_quotations: number;
  accepted_quotations: number;
  rejected_quotations: number;
  expired_quotations: number;
  invoiced_quotations: number;
  total_value: number;
  accepted_value: number;
}

export interface TimelineItem {
  period: string;
  sent: number;
  accepted: number;
}

export interface DashboardQuote {
  id: string;
  quote_number: string;
  status: QuoteStatus;
  total_amount_cents: number;
  issue_date: string;
  expiry_date?: string | null;
  company: { id: string; name: string };
  client?: { name: string; email?: string | null };
}

export function useDashboard() {
  const { get } = useApi();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [quotations, setQuotations] = useState<DashboardQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    const [summaryRes, timelineRes, quotesRes] = await Promise.all([
      get<DashboardSummary>(buildApiUrl.dashboard.summary()),
      get<TimelineItem[]>(buildApiUrl.dashboard.timeline()),
      get<{ data: DashboardQuote[] }>(buildApiUrl.dashboard.quotations()),
    ]);

    if (!summaryRes.error && summaryRes.data) {
      setSummary(summaryRes.data);
    }

    if (!timelineRes.error && timelineRes.data) {
      setTimeline(timelineRes.data);
    }

    if (!quotesRes.error && quotesRes.data) {
      setQuotations(quotesRes.data.data);
    }

    setIsLoading(false);
  }, [get]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { summary, timeline, quotations, isLoading, refetch: fetchData };
}

