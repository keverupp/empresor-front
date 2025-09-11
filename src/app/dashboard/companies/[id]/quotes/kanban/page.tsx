"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout, useDashboardLayout } from "@/components/layouts/DashboardLayout";
import { QuoteKanbanBoard } from "@/components/quotes/kanban/QuoteKanbanBoard";
import { useQuotes } from "@/hooks/useQuotes";
import type { Quote } from "@/types/apiInterfaces";

export default function QuotesKanbanPage() {
  const params = useParams();
  const companyId = params.id as string;
  const { createBreadcrumbs } = useDashboardLayout();

  const { quotes, fetchQuotes, updateQuoteStatus } = useQuotes({ companyId });

  useEffect(() => {
    if (!companyId) return;
    fetchQuotes({ page: 1, pageSize: 15 });
  }, [companyId, fetchQuotes]);

  useEffect(() => {
    createBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Empresas", href: "/dashboard/companies" },
      { label: "Orçamentos", href: `/dashboard/companies/${companyId}/quotes` },
      { label: "Kanban", href: "#" },
    ]);
  }, [companyId, createBreadcrumbs]);

  const handleStatusChange = async (
    quoteId: string,
    newStatus: Quote["status"]
  ) => {
    await updateQuoteStatus(quoteId, newStatus);
  };

  return (
    <DashboardLayout>
      <QuoteKanbanBoard quotes={quotes} onStatusChange={handleStatusChange} />
    </DashboardLayout>
  );
}

