// src/lib/quote-utils.ts

/**
 * Utilitários para orçamentos - seguindo padrão do projeto
 */

/**
 * Converte centavos para reais
 */
export function centsToReais(cents: number): number {
  return cents / 100;
}

/**
 * Converte reais para centavos
 */
export function reaisToCents(reais: number): number {
  return Math.round(reais * 100);
}

/**
 * Formata valor em centavos para exibição em reais
 */
export function formatCurrency(cents: number): string {
  const reais = centsToReais(cents);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(reais);
}

/**
 * Formata valor em reais para input (sem símbolo de moeda)
 */
export function formatCurrencyInput(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Parse de string de valor para número (remove formatação)
 */
export function parseCurrencyInput(value: string): number {
  // Remove tudo que não é número, vírgula ou ponto
  const cleaned = value.replace(/[^\d,.-]/g, "");
  // Substitui vírgula por ponto
  const normalized = cleaned.replace(",", ".");
  return parseFloat(normalized) || 0;
}

/**
 * Calcula subtotal dos itens
 */
export function calculateSubtotal(
  items: Array<{ quantity: number; unit_price_cents: number }>
): number {
  return items.reduce((total, item) => {
    return total + item.quantity * item.unit_price_cents;
  }, 0);
}

/**
 * Calcula desconto em centavos
 */
export function calculateDiscount(
  subtotal: number,
  discountType: "percentage" | "fixed_amount" | null,
  discountValue: number | null
): number {
  if (!discountType || !discountValue) return 0;

  if (discountType === "percentage") {
    return Math.round((subtotal * discountValue) / 100);
  }

  return discountValue; // fixed_amount já em centavos
}

/**
 * Calcula total final
 */
export function calculateTotal(
  subtotal: number,
  discount: number,
  tax: number | null
): number {
  return subtotal - discount + (tax || 0);
}

/**
 * Valida se um item do orçamento está válido
 */
export function validateQuoteItem(item: {
  description: string;
  quantity: number;
  unit_price_cents: number;
}): boolean {
  return !!(
    item.description?.trim() &&
    item.quantity > 0 &&
    item.unit_price_cents >= 0
  );
}

/**
 * Gera um número de orçamento baseado em data (fallback)
 */
export function generateQuoteNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const time = String(now.getTime()).slice(-4);

  return `ORC-${year}${month}${day}-${time}`;
}

/**
 * Status do orçamento para exibição
 */
export const QUOTE_STATUS_LABELS = {
  draft: "Rascunho",
  sent: "Enviado",
  viewed: "Visualizado",
  accepted: "Aceito",
  rejected: "Rejeitado",
  expired: "Expirado",
  invoiced: "Faturado",
} as const;

/**
 * Status do orçamento com cores
 */
export const QUOTE_STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  sent: "bg-blue-100 text-blue-800 border-blue-200",
  viewed: "bg-yellow-100 text-yellow-800 border-yellow-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  expired: "bg-orange-100 text-orange-800 border-orange-200",
  invoiced: "bg-purple-100 text-purple-800 border-purple-200",
} as const;

/**
 * Formata data para input HTML
 */
export function formatDateForInput(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

/**
 * Formata data para exibição
 */
export function formatDateForDisplay(date: string | Date | null): string {
  if (!date) return "-";

  const d = new Date(date);
  return new Intl.DateTimeFormat("pt-BR").format(d);
}
