// src/types/auth.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
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
}

export interface ApiOptions extends Omit<RequestInit, "body"> {
  skipAuth?: boolean;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  body?: BodyInit | null; // explicitando body para não conflitar
}
