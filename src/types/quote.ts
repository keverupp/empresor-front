// src/types/quote.ts
export type QuoteStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired"
  | "invoiced";

export type DiscountType = "percentage" | "fixed_amount";

export interface QuoteItem {
  id?: string;
  product_id?: string | null;
  description: string;
  quantity: number;
  unit_price_cents: number;
  total_price_cents?: number;
}

export interface QuoteClient {
  id: string;
  name: string;
  email?: string | null;
  phone_number?: string | null;
  document_number?: string | null;
}

export interface Quote {
  id: string;
  company_id: string;
  client_id: string;
  created_by_user_id?: string | null;
  quote_number: string;
  status: QuoteStatus;
  issue_date: string;
  expiry_date?: string | null;
  notes?: string | null;
  internal_notes?: string | null;
  terms_and_conditions_content?: string | null;
  subtotal_cents: number;
  discount_type?: DiscountType | null;
  discount_value_cents?: number | null;
  tax_amount_cents?: number | null;
  total_amount_cents: number;
  currency: string;
  pdf_url?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  created_at: string;
  updated_at: string;
  client: QuoteClient;
  items: QuoteItem[];
}

export interface QuoteListParams {
  page?: number;
  pageSize?: number;
  status?: QuoteStatus;
  client_id?: string;
  quote_number?: string;
  issue_date_from?: string;
  issue_date_to?: string;
  expiry_date_from?: string;
  expiry_date_to?: string;
}

export interface QuoteListResponse {
  data: Quote[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface QuoteCreatePayload {
  client_id: string;
  quote_number: string;
  issue_date?: string;
  expiry_date?: string | null;
  notes?: string | null;
  internal_notes?: string | null;
  terms_and_conditions_content?: string | null;
  discount_type?: DiscountType | null;
  discount_value_cents?: number | null;
  tax_amount_cents?: number | null;
  currency?: string;
  items: Omit<QuoteItem, "id" | "total_price_cents">[];
}

export interface QuoteUpdatePayload extends Partial<QuoteCreatePayload> {
  status?: QuoteStatus;
}

export interface QuoteStats {
  total_quotes: number;
  draft_count: number;
  sent_count: number;
  accepted_count: number;
  rejected_count: number;
  total_accepted_value_cents: number;
  avg_accepted_value_cents: number;
  acceptance_rate: number;
}

export interface ExpiringQuote {
  id: string;
  quote_number: string;
  expiry_date: string;
  total_amount_cents: number;
  client_name: string;
  client_email?: string | null;
}

export interface QuoteGenerateNumberResponse {
  quote_number: string;
}

// Tipos para filtros e ações do DataTable
export interface QuoteFilters {
  status?: QuoteStatus[];
  client_id?: string;
  dateRange?: {
    from?: string;
    to?: string;
  };
  amountRange?: {
    min?: number;
    max?: number;
  };
}

// Status com cores para exibição
export const QUOTE_STATUS_CONFIG = {
  draft: { label: "Rascunho", color: "gray" },
  sent: { label: "Enviado", color: "blue" },
  viewed: { label: "Visualizado", color: "yellow" },
  accepted: { label: "Aceito", color: "green" },
  rejected: { label: "Rejeitado", color: "red" },
  expired: { label: "Expirado", color: "orange" },
  invoiced: { label: "Faturado", color: "purple" },
} as const;
