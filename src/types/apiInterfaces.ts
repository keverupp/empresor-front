import type { Product, ProductPayload } from "./product";
import type {
  DiscountType,
  ExpiringQuote,
  Quote,
  QuoteClient,
  QuoteCreatePayload,
  QuoteFilters,
  QuoteGenerateNumberResponse,
  QuoteItem,
  QuoteListParams,
  QuoteListResponse,
  QuoteStats,
  QuoteStatus,
  QuoteUpdatePayload,
} from "./quote";

export interface Client {
  id: string;
  company_id: string;
  name: string;
  email?: string | null;
  phone_number?: string | null;
  document_number?: string | null;
  address_street?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip_code?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type {
  Product,
  ProductPayload,
  Quote,
  QuoteClient,
  QuoteCreatePayload,
  QuoteFilters,
  QuoteItem,
  QuoteListParams,
  QuoteListResponse,
  QuoteStats,
  QuoteUpdatePayload,
  QuoteStatus,
  DiscountType,
  ExpiringQuote,
  QuoteGenerateNumberResponse,
};
