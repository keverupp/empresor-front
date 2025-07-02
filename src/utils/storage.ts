// src/utils/storage.ts
import { AuthTokens, User } from "../types/auth";

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "empresor_access_token",
  REFRESH_TOKEN: "empresor_refresh_token",
  USER: "empresor_user",
} as const;

// Storage utilities
export const storage = {
  setTokens: (tokens: AuthTokens): void => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  },

  getTokens: (): AuthTokens | null => {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }
    return null;
  },

  setUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getUser: (): User | null => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Verificar se tem dados salvos
  hasStoredAuth: (): boolean => {
    const tokens = storage.getTokens();
    const user = storage.getUser();
    return !!(tokens && user);
  },
};
