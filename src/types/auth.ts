// src/types/auth.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active_plan?: ActivePlan | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Aqui removemos o any e deixamos genérico com fallback para `unknown`
export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
  headers?: Headers;
}

export type ApiResponseType = "json" | "text" | "blob" | "arrayBuffer";

export interface ApiOptions extends Omit<RequestInit, "body"> {
  skipAuth?: boolean;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  body?: BodyInit | null; // explicitando body para não conflitar
  responseType?: ApiResponseType;
  retries?: number;
}

export interface ActivePlan {
  plan_name: string;
  status: "active" | "trialing" | "canceled" | "past_due" | string;
  trial_ends_at: string | null;
  current_period_ends_at: string | null;
}
