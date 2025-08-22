// src/types/product.ts

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

export interface ProductPayload {
  name: string;
  description?: string | null;
  sku?: string | null;
  unit_price_cents: number;
  unit?: string | null;
  is_active?: boolean;
}
