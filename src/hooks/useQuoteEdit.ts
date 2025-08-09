// src/hooks/useQuoteEdit.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/hooks/useApi";

import type { Quote, Product } from "@/types/apiInterfaces";
import type { QuoteFormData } from "@/lib/quote-schemas";
import { formatDateForInput } from "@/lib/quote-utils";

/** API -> Form */
function hydrateFormFromApi(q: Quote): QuoteFormData {
  return {
    client_id: q.client_id,
    quote_number: q.quote_number,
    issue_date: q.issue_date ?? formatDateForInput(new Date()),
    expiry_date: q.expiry_date ?? "",
    notes: q.notes ?? "",
    internal_notes: q.internal_notes ?? "",
    terms_and_conditions_content: q.terms_and_conditions_content ?? "",
    discount_type: (q as any).discount_type ?? "",
    discount_value: ((q as any).discount_value_cents ?? 0) / 100,
    tax_amount: ((q as any).tax_amount_cents ?? 0) / 100,
    items: (q.items ?? []).map((it: any) => ({
      id: it.id,
      product_id: it.product_id ?? undefined,
      description: it.description,
      quantity: it.quantity,
      unit_price: (it.unit_price_cents ?? 0) / 100,
    })),
  };
}

/** subtotal simples com base nos itens do form (R$ -> cents) */
function calcSubtotalCents(items: QuoteFormData["items"]) {
  const sum = (items ?? []).reduce(
    (acc, it) => acc + Number(it.quantity || 0) * Number(it.unit_price || 0),
    0
  );
  return Math.max(0, Math.round(sum * 100));
}

export function useQuoteEdit() {
  const params = useParams();
  const router = useRouter();
  const { tokens, user } = useAuth() as any;
  const { get, put, post, delete: del } = useApi();

  // Aceita [companyId] OU [id] na rota
  const companyId = (params.companyId ?? params.id) as string | undefined;
  const quoteId = (params.quoteId ?? params.qid) as string | undefined;

  // Catálogo via plano do usuário (ou você pode manter sua lógica atual)
  const hasCatalog = (() => {
    const plan = user?.active_plan as
      | { plan_name?: string; status?: string }
      | undefined;
    if (!plan) return false;
    if (plan.status !== "active" && plan.status !== "trialing") return false;
    return plan.plan_name === "Profissional" || plan.plan_name === "Premium";
  })();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<QuoteFormData>({
    defaultValues: {
      client_id: "",
      quote_number: "",
      issue_date: formatDateForInput(new Date()),
      expiry_date: "",
      notes: "",
      internal_notes: "",
      terms_and_conditions_content: "",
      discount_type: "",
      discount_value: 0,
      tax_amount: 0,
      items: [],
    },
  });

  const applyQuoteFromApi = useCallback(
    (q: Quote) => {
      setQuote(q);
      form.reset(hydrateFormFromApi(q), { keepDefaultValues: false });
    },
    [form]
  );


  const fetchAll = useCallback(async () => {
    if (!companyId || !quoteId) {
      setError("Parâmetros ausentes na rota.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Orçamento
      const { data: qData, error: qErr } = await get<Quote>(
        `/companies/${companyId}/quotes/${quoteId}`
      );
      if (qErr) {
        setError(qErr);
        setLoading(false);
        return;
      }
      if (qData) applyQuoteFromApi(qData);

      // Produtos ativos (para combobox, se plano permitir)
      if (hasCatalog) {
        const { data: pData } = await get<Product[]>(
          `/companies/${companyId}/products/active`
        );
        setProducts(Array.isArray(pData) ? pData : []);
      } else {
        setProducts([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar orçamento");
    } finally {
      setLoading(false);
    }
  }, [companyId, quoteId, get, applyQuoteFromApi, hasCatalog]);

  // Aguarda token + params válidos para buscar (evita 401 e toasts precoces)
  useEffect(() => {
    // Sem params -> erro explícito e encerra loading
    if (!companyId || !quoteId) {
      setError("Parâmetros ausentes na rota.");
      setLoading(false);
      return;
    }
    // Sem token ainda -> mostra loading, mas não busca
    if (!tokens?.accessToken) {
      setLoading(true);
      return;
    }
    fetchAll();
  }, [companyId, quoteId, tokens?.accessToken, fetchAll]);

  /** Salvar campos gerais (sem itens) */
  const onSubmit = useCallback(
    async (values: QuoteFormData) => {
      if (!quote || !companyId) return;
      setSaving(true);
      setError(null);

      try {
        const payload: any = {
          client_id: values.client_id,
          quote_number: values.quote_number,
          issue_date: values.issue_date, // remova se backend não aceitar
          expiry_date: values.expiry_date || null,
          notes: values.notes || null,
          internal_notes: values.internal_notes || null,
          terms_and_conditions_content:
            values.terms_and_conditions_content || null,
          discount_type: values.discount_type || null,
          discount_value_cents: values.discount_value
            ? Math.round(values.discount_value * 100)
            : null,
          tax_amount_cents: values.tax_amount
            ? Math.round(values.tax_amount * 100)
            : null,
        };

        const { data, error: apiErr } = await put<Quote>(
          `/companies/${companyId}/quotes/${quote.id}`,
          payload
        );
        if (apiErr) {
          setError(apiErr);
          return;
        }
        if (data) applyQuoteFromApi(data);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Erro ao salvar alterações do orçamento"
        );
      } finally {
        setSaving(false);
      }
    },
    [companyId, quote, put, applyQuoteFromApi]
  );

  /** Alterar status */
  const handleStatus = useCallback(
    async (status: Quote["status"]) => {
      if (!quote || !companyId) return;
      setUpdatingStatus(true);
      setError(null);

      try {
        const { data, error: apiErr } = await put<Quote>(
          `/companies/${companyId}/quotes/${quote.id}/status`,
          { status }
        );
        if (apiErr) {
          setError(apiErr);
          return;
        }
        if (data) applyQuoteFromApi(data);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Erro ao atualizar status do orçamento"
        );
      } finally {
        setUpdatingStatus(false);
      }
    },
    [companyId, quote, put, applyQuoteFromApi]
  );

  /** Itens — novas rotas */

  const addItem = useCallback(
    async (payload: {
      description: string;
      quantity: number;
      unit_price: number; // R$
      product_id?: string | null;
    }) => {
      if (!quote || !companyId) return;
      setError(null);
      const body = {
        description: payload.description,
        quantity: Number(payload.quantity),
        unit_price_cents: Math.round(Number(payload.unit_price) * 100),
        product_id: payload.product_id ?? null,
      };
      const { data, error: apiErr } = await post<Quote>(
        `/companies/${companyId}/quotes/${quote.id}/items`,
        body
      );
      if (apiErr) {
        setError(apiErr);
        return;
      }
      if (data) applyQuoteFromApi(data);
    },
    [companyId, quote, post, applyQuoteFromApi]
  );

  const updateItem = useCallback(
    async (
      itemId: number,
      patch: {
        description?: string;
        quantity?: number;
        unit_price?: number; // R$
        product_id?: string | null;
      }
    ) => {
      if (!quote || !companyId) return;
      setError(null);

      const body: any = {};
      if (patch.description !== undefined) body.description = patch.description;
      if (patch.quantity !== undefined) body.quantity = Number(patch.quantity);
      if (patch.unit_price !== undefined)
        body.unit_price_cents = Math.round(Number(patch.unit_price) * 100);
      if (patch.product_id !== undefined) body.product_id = patch.product_id;

      const { data, error: apiErr } = await put<Quote>(
        `/companies/${companyId}/quotes/${quote.id}/items/${itemId}`,
        body
      );
      if (apiErr) {
        setError(apiErr);
        return;
      }
      if (data) applyQuoteFromApi(data);
    },
    [companyId, quote, put, applyQuoteFromApi]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      if (!quote || !companyId) return;
      setError(null);

      const { data, error: apiErr } = await del<Quote>(
        `/companies/${companyId}/quotes/${quote.id}/items/${itemId}`
      );
      if (apiErr) {
        setError(apiErr);
        return;
      }
      if (data) applyQuoteFromApi(data);
    },
    [companyId, quote, del, applyQuoteFromApi]
  );

  // Totais básicos para footer/financeiro
  const subtotalCents = useMemo(
    () => calcSubtotalCents(form.getValues("items") ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.watch("items")]
  );
  const discountCents = useMemo(
    () =>
      Math.max(0, Math.round((form.getValues("discount_value") || 0) * 100)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.watch("discount_value")]
  );
  const totalCents = useMemo(
    () =>
      Math.max(
        0,
        subtotalCents -
          discountCents +
          Math.max(0, Math.round((form.getValues("tax_amount") || 0) * 100))
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subtotalCents, discountCents, form.watch("tax_amount")]
  );

  return {
    // env
    router,
    companyId,
    quote,

    // estado
    loading,
    saving,
    updatingStatus,
    error,

    // catálogo
    hasCatalog,
    products,

    // form
    form,

    // totais
    subtotalCents,
    discountCents,
    totalCents,

    // ações gerais
    onSubmit,
    handleStatus,

    // itens (novas rotas)
    addItem,
    updateItem,
    removeItem,
  };
}
