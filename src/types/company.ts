// src/types/company.ts

export interface Company {
  id: string;
  name: string;
  document_number: string;
  document_type: "CNPJ" | "CPF";
  status:
    | "pending"
    | "pending_validation"
    | "active"
    | "inactive"
    | "suspended";
  email: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  };
  owner_id: number;
  created_at: string;
  updated_at: string;
  verified_at?: string;
}

export interface CompanyCreatePayload {
  name: string;
  document_number: string;
  document_type: "CNPJ" | "CPF";
  email: string;
  phone?: string;
  website?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  };
}

export interface CompanyUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  };
}

export interface CompanyPermissions {
  can_view_clients: boolean;
  can_create_quotes: boolean;
  can_edit_settings: boolean;
  can_view_finance?: boolean;
  can_manage_products?: boolean;
  can_view_reports?: boolean;
}

export interface CompanyShare {
  share_id: number;
  user_id: number;
  name: string;
  email: string;
  permissions: CompanyPermissions;
  status: string;
  shared_at: string;
}

export interface CompanyListResponse {
  data: Company[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface CompanyListParams {
  page?: number;
  pageSize?: number;
  name?: string;
  status?: string;
  owner_id?: string;
  document_number?: string;
}

// Status colors para UI
export const COMPANY_STATUS_COLORS = {
  pending: "yellow",
  pending_validation: "yellow",
  active: "green",
  inactive: "gray",
  suspended: "red",
} as const;

// Labels para status
export const COMPANY_STATUS_LABELS = {
  pending: "Pendente",
  pending_validation: "Pendente",
  active: "Ativa",
  inactive: "Inativa",
  suspended: "Suspensa",
} as const;

// Menu items para cada empresa
export interface CompanyMenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  permission?: keyof CompanyPermissions;
  badge?: string | number;
}

// Context types
export interface CompanyContextType {
  // Estado das empresas
  companies: Company[];
  activeCompany: Company | null;
  activeCompanyId: string | null;

  // Estados de loading
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Ações
  switchCompany: (companyId: string) => void;
  refreshCompanies: () => Promise<void>;
  updateCompany: (id: string, data: Partial<Company>) => void;

  // Permissões da empresa ativa
  permissions: CompanyPermissions;
  hasPermission: (permission: keyof CompanyPermissions) => boolean;

  // Utilitários
  getCompanyById: (id: string) => Company | undefined;
  isOwner: (company: Company) => boolean;
}
