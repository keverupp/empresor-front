/**
 * API interfaces generated from Empresor API spec
 */

// Client based on schema def-4 (ClientResponse) fileciteturn0file0
export interface Client {
  id: string;
  company_id: string;
  name: string;
  email: string | null;
  phone_number: string | null;
  document_number: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Product based on schema def-26 (ProductResponse) fileciteturn0file0
export interface Product {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  sku: string | null;
  unit_price_cents: number;
  unit: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Quote item based on schema def-30 (QuoteItem) fileciteturn0file0
export interface QuoteItem {
  id: number | null;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
  item_order: number | null;
}

// Quote based on schema def-31 (QuoteResponse) fileciteturn0file0
export interface Quote {
  id: string;
  company_id: string;
  client_id: string;
  created_by_user_id: string | null;
  quote_number: string;
  status:
    | "draft"
    | "sent"
    | "viewed"
    | "accepted"
    | "rejected"
    | "expired"
    | "invoiced";
  issue_date: string;
  expiry_date: string | null;
  notes: string | null;
  internal_notes: string | null;
  terms_and_conditions_content: string | null;
  subtotal_cents: number;
  discount_type: "percentage" | "fixed_amount" | null;
  discount_value_cents: number | null;
  tax_amount_cents: number | null;
  total_amount_cents: number;
  currency: string;
  pdf_url: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  client: {
    id: string;
    name: string;
    email: string | null;
    phone_number: string | null;
    document_number: string | null;
  };
  items: QuoteItem[];
}
