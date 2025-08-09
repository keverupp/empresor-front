// src/lib/quote-schemas.ts

import { z } from "zod";

/**
 * Schema para item do orçamento
 */
export const quoteItemSchema = z.object({
  id: z.number().optional(),
  product_id: z.string().optional().nullable(),
  description: z.string().min(1, "Descrição é obrigatória"),
  quantity: z.number().min(0.01, "Quantidade deve ser maior que zero"),
  unit_price_cents: z.number().min(0, "Preço unitário deve ser positivo"),
  total_price_cents: z.number().optional(),
  item_order: z.number().optional(),
});

/**
 * Schema para criar orçamento
 */
export const createQuoteSchema = z.object({
  client_id: z.string().min(1, "Cliente é obrigatório"),
  quote_number: z
    .string()
    .min(1, "Número do orçamento é obrigatório")
    .max(50, "Número muito longo"),
  issue_date: z.string().min(1, "Data de emissão é obrigatória"),
  expiry_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable(),
  terms_and_conditions_content: z.string().optional().nullable(),
  discount_type: z.enum(["percentage", "fixed_amount"]).optional().nullable(),
  discount_value_cents: z.number().min(0).optional().nullable(),
  tax_amount_cents: z.number().min(0).optional().nullable(),
  currency: z.string().default("BRL"),
  items: z.array(quoteItemSchema).min(1, "Pelo menos um item é obrigatório"),
});

/**
 * Schema para atualizar orçamento
 */
export const updateQuoteSchema = z.object({
  client_id: z.string().min(1, "Cliente é obrigatório"),
  quote_number: z
    .string()
    .min(1, "Número do orçamento é obrigatório")
    .max(50, "Número muito longo"),
  status: z
    .enum([
      "draft",
      "sent",
      "viewed",
      "accepted",
      "rejected",
      "expired",
      "invoiced",
    ])
    .optional(),
  issue_date: z.string().min(1, "Data de emissão é obrigatória"),
  expiry_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable(),
  terms_and_conditions_content: z.string().optional().nullable(),
  discount_type: z.enum(["percentage", "fixed_amount"]).optional().nullable(),
  discount_value_cents: z.number().min(0).optional().nullable(),
  tax_amount_cents: z.number().min(0).optional().nullable(),
  currency: z.string().default("BRL"),
  items: z.array(quoteItemSchema).min(1, "Pelo menos um item é obrigatório"),
});

/**
 * Schema simplificado para formulário (com valores em reais)
 */
export const quoteFormSchema = z.object({
  client_id: z.string().min(1, "Cliente é obrigatório"),
  quote_number: z
    .string()
    .min(1, "Número do orçamento é obrigatório")
    .max(50, "Número muito longo"),
  issue_date: z.string().min(1, "Data de emissão é obrigatória"),
  expiry_date: z.string().optional(),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  terms_and_conditions_content: z.string().optional(),
  discount_type: z.enum(["percentage", "fixed_amount", ""]).optional(),
  discount_value: z.number().min(0).optional(),
  tax_amount: z.number().min(0).optional(),
  items: z
    .array(
      z.object({
        id: z.number().optional(),
        product_id: z.string().optional(),
        description: z.string().min(1, "Descrição é obrigatória"),
        quantity: z.number().min(0.01, "Quantidade deve ser maior que zero"),
        unit_price: z.number().min(0, "Preço unitário deve ser positivo"),
      })
    )
    .min(1, "Pelo menos um item é obrigatório"),
});

/**
 * Tipos inferidos dos schemas
 */
export type QuoteItem = z.infer<typeof quoteItemSchema>;
export type CreateQuoteData = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteData = z.infer<typeof updateQuoteSchema>;
export type QuoteFormData = z.infer<typeof quoteFormSchema>;

/**
 * Converte dados do formulário para API
 */
export function transformQuoteFormToApi(data: QuoteFormData): CreateQuoteData {
  return {
    ...data,
    expiry_date: data.expiry_date || null,
    notes: data.notes || null,
    internal_notes: data.internal_notes || null,
    terms_and_conditions_content: data.terms_and_conditions_content || null,
    discount_type:
      data.discount_type === "" ? null : data.discount_type || null,
    discount_value_cents: data.discount_value
      ? Math.round(data.discount_value * 100)
      : null,
    tax_amount_cents: data.tax_amount
      ? Math.round(data.tax_amount * 100)
      : null,
    items: data.items.map((item) => ({
      ...item,
      product_id: item.product_id || null,
      unit_price_cents: Math.round(item.unit_price * 100),
      total_price_cents: Math.round(item.quantity * item.unit_price * 100),
    })),
  };
}
