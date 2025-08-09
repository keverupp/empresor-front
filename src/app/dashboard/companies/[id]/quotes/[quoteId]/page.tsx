"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  DashboardLayout,
  useDashboardLayout,
} from "@/components/layouts/DashboardLayout";
import { useQuotes } from "@/hooks/useQuotes";
import { useAuth } from "@/contexts/AuthContext";
import type { Quote } from "@/types/apiInterfaces";

import { QuoteViewHeader } from "@/components/quotes/view/QuoteViewHeader";
import { QuoteViewClient } from "@/components/quotes/view/QuoteViewClient";
import { QuoteViewItems } from "@/components/quotes/view/QuoteViewItems";
import { QuoteViewTotals } from "@/components/quotes/view/QuoteViewTotals";

export default function QuoteViewPage() {
  const params = useParams();
  const router = useRouter();

  // Aceita ambos os padrões: [companyId] OU [id]
  const companyId = (params.companyId ?? params.id) as string | undefined;
  const quoteId = params.quoteId as string | undefined;

  const { tokens } = useAuth() as any;
  const { createBreadcrumbs } = useDashboardLayout();
  const { fetchQuoteById } = useQuotes({ companyId: companyId ?? "" });

  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    // Valida pré-condições e não deixa o loading travado
    if (!companyId || !quoteId) {
      setError("Parâmetros inválidos.");
      setQuote(null);
      setLoading(false);
      return;
    }

    // Se sua API exige token para esta rota, mantenha a checagem:
    if (!tokens?.accessToken) {
      setError("Token de autenticação inválido, expirado ou ausente.");
      setQuote(null);
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setError(null);

    try {
      const q = await fetchQuoteById(quoteId);
      if (!alive) return;
      if (!q) {
        setError("Orçamento não encontrado.");
        setQuote(null);
      } else {
        setQuote(q);
      }
    } catch (e) {
      if (!alive) return;
      setError(e instanceof Error ? e.message : "Erro ao carregar orçamento.");
      setQuote(null);
    } finally {
      if (alive) setLoading(false);
    }

    return () => {
      alive = false;
    };
  }, [companyId, quoteId, tokens?.accessToken, fetchQuoteById]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!quote || !companyId) return;
    createBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Empresas", href: "/dashboard/companies" },
      { label: "Orçamentos", href: `/dashboard/companies/${companyId}/quotes` },
      { label: quote.quote_number, href: "#" },
    ]);
  }, [quote, companyId, createBreadcrumbs]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] grid place-items-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando orçamento...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !quote) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] grid place-items-center">
          <div className="text-center">
            <p className="text-destructive mb-2">Erro ao carregar orçamento</p>
            <p className="text-sm text-muted-foreground">
              {error ?? "Tente novamente mais tarde."}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => void load()}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
        <QuoteViewHeader
          companyId={companyId!}
          quote={quote}
          onEdit={() =>
            router.push(
              `/dashboard/companies/${companyId}/quotes/${quote.id}/edit`
            )
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <QuoteViewClient client={quote.client} quote={quote} />
            <QuoteViewItems
              items={quote.items ?? []}
              currency={quote.currency ?? "BRL"}
            />
          </div>

          <div className="lg:col-span-1">
            <QuoteViewTotals quote={quote} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
