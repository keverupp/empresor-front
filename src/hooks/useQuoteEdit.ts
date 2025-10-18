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
  const discountType = (q as unknown as { discount_type?: string })
    ?.discount_type;
  const discountValueCents =
    (q as unknown as { discount_value_cents?: number })?.discount_value_cents ??
    0;

  let discount_value = 0;
  if (discountType === "percentage") {
    if (q.subtotal_cents > 0) {
      discount_value = (discountValueCents * 100) / q.subtotal_cents;
    }
  } else {
    discount_value = discountValueCents / 100;
  }

  return {
    client_id: q.client_id,
    quote_number: q.quote_number,
    issue_date: q.issue_date ?? formatDateForInput(new Date()),
    expiry_date: q.expiry_date ?? "",
    notes: q.notes ?? "",
    internal_notes: q.internal_notes ?? "",
    terms_and_conditions_content: q.terms_and_conditions_content ?? "",
    discount_type:
      discountType === "percentage" || discountType === "fixed_amount"
        ? discountType
        : "",
    discount_value,
    tax_amount:
      ((q as unknown as { tax_amount_cents?: number })?.tax_amount_cents ?? 0) /
      100,
    items: (q.items ?? []).map((it) => ({
      id: it.id,
      product_id: it.product_id ?? undefined,
      description: it.description,
      quantity: it.quantity,
      unit_price: (it.unit_price_cents ?? 0) / 100,
      complement: it.complement ?? "",
      images: Array.isArray(it.images) ? it.images : [],
    })),
  };
}

/** subtotal simples com base nos itens do form (R$ -> cents) */
function calcSubtotalCents(items: QuoteFormData["items"]) {
  const sum = (items ?? []).reduce((acc, it) => {
    const qty = Number(it.quantity || 0);
    const unit = Number(it.unit_price || 0);
    return acc + qty * unit;
  }, 0);
  return Math.max(0, Math.round(sum * 100));
}

export function useQuoteEdit() {
  const params = useParams();
  const router = useRouter();

  // ✅ Fonte única de verdade para catálogo e tokens
  const { tokens, hasCatalog } = useAuth();

  const { get, put, post, delete: del } = useApi();

  // Aceita [companyId] OU [id] na rota
  const companyId = (params.companyId ?? params.id) as string | undefined;
  const quoteId = (params.quoteId ?? params.qid) as string | undefined;

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
      const values = hydrateFormFromApi(q);
      form.reset(values, { keepDefaultValues: false });
    },
    [form]
  );

  const fetchQuote = useCallback(async () => {
    if (!companyId || !quoteId) {
      setError("Parâmetros ausentes na rota.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: qData, error: qErr } = await get<Quote>(
        `/companies/${companyId}/quotes/${quoteId}`
      );
      if (qErr) {
        setError(qErr);
        return;
      }
      if (qData) applyQuoteFromApi(qData);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Erro ao carregar orçamento"
      );
    } finally {
      setLoading(false);
    }
  }, [applyQuoteFromApi, companyId, get, quoteId]);

  const fetchProducts = useCallback(async () => {
    if (!companyId) return;
    const { data: pData } = await get<Product[]>(
      `/companies/${companyId}/products/active`
    );
    setProducts(Array.isArray(pData) ? pData : []);
  }, [companyId, get]);

  // Aguarda token + params válidos para buscar (evita 401 e toasts precoces)
  useEffect(() => {
    if (!companyId || !quoteId) {
      setError("Parâmetros ausentes na rota.");
      setLoading(false);
      return;
    }
    if (!tokens?.accessToken) {
      setLoading(true);
      return;
    }
    void fetchQuote();
  }, [tokens?.accessToken, companyId, quoteId, fetchQuote]);

  useEffect(() => {
    if (!hasCatalog) {
      setProducts([]);
      return;
    }
    if (!companyId || !tokens?.accessToken) return;
    void fetchProducts();
  }, [hasCatalog, companyId, tokens?.accessToken, fetchProducts]);

  /** Salvar campos gerais (sem itens) */
  const onSubmit = useCallback(
    async (values: QuoteFormData) => {
      if (!quote || !companyId) return;
      setSaving(true);
      setError(null);

      try {
        const payload = {
          client_id: values.client_id,
          quote_number: values.quote_number,
          // Remova issue_date se o backend realmente não aceitar
          issue_date: values.issue_date,
          expiry_date: values.expiry_date || null,
          notes: values.notes || null,
          internal_notes: values.internal_notes || null,
          terms_and_conditions_content:
            values.terms_and_conditions_content || null,
          discount_type: values.discount_type || null,
          discount_value_cents:
            values.discount_type === "percentage"
              ? values.discount_value
              : values.discount_value
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
    [applyQuoteFromApi, companyId, put, quote]
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
    [applyQuoteFromApi, companyId, put, quote]
  );

  /** Itens — novas rotas */
  const addItem = useCallback(
    async (payload: {
      description: string;
      quantity: number;
      unit_price: number; // R$
      product_id?: string | null;
      complement?: string;
      images?: string[];
    }) => {
      if (!quote || !companyId) return;
      setError(null);

      const body = {
        description: payload.description,
        quantity: Number(payload.quantity),
        unit_price_cents: Math.round(Number(payload.unit_price) * 100),
        product_id: payload.product_id ?? null,
        complement: payload.complement,
        images: payload.images,
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
    [applyQuoteFromApi, companyId, post, quote]
  );

  const updateItem = useCallback(
    async (
      itemId: number,
      patch: {
        description?: string;
        quantity?: number;
        unit_price?: number; // R$
        product_id?: string | null;
        complement?: string;
        images?: string[];
      }
    ) => {
      if (!quote || !companyId) return;
      setError(null);

      const body: Record<string, unknown> = {};
      if (patch.description !== undefined) body.description = patch.description;
      if (patch.quantity !== undefined) body.quantity = Number(patch.quantity);
      if (patch.unit_price !== undefined)
        body.unit_price_cents = Math.round(Number(patch.unit_price) * 100);
      if (patch.product_id !== undefined) body.product_id = patch.product_id;
      if (patch.complement !== undefined) body.complement = patch.complement;
      if (patch.images !== undefined) body.images = patch.images;

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
    [applyQuoteFromApi, companyId, put, quote]
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
    [applyQuoteFromApi, companyId, del, quote]
  );

  // ===== Totais (observando os campos do form) =====
  const watchedItems = form.watch("items");
  const watchedDiscountType = form.watch("discount_type");
  const watchedDiscountValue = form.watch("discount_value");
  const watchedTax = form.watch("tax_amount");

  const subtotalCents = useMemo(
    () => calcSubtotalCents(watchedItems ?? []),
    [watchedItems]
  );

  const discountCents = useMemo(() => {
    const value = Number(watchedDiscountValue || 0);
    if (watchedDiscountType === "percentage") {
      // Valor percentual sobre o subtotal
      return Math.round((subtotalCents * value) / 100);
    }
    // Valor fixo em R$
    return Math.round(value * 100);
  }, [watchedDiscountType, watchedDiscountValue, subtotalCents]);

  const taxCents = useMemo(
    () => Math.max(0, Math.round(Number(watchedTax || 0) * 100)),
    [watchedTax]
  );

  const totalCents = useMemo(
    () => Math.max(0, subtotalCents - discountCents + taxCents),
    [discountCents, subtotalCents, taxCents]
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
    hasCatalog, // vindo do AuthContext
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
