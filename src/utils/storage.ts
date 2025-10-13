// src/utils/storage.ts
import { AuthTokens, User } from "../types/auth";

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "empresor_access_token",
  REFRESH_TOKEN: "empresor_refresh_token",
  USER: "empresor_user",
  SESSION_VALID: "empresor_session_valid", // Flag para validação
} as const;

// Função para verificar se o JWT está expirado
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    // Adiciona buffer de 5 minutos para evitar expiração durante uso
    return payload.exp < currentTime + 300;
  } catch {
    return true;
  }
};

// Storage utilities
export const storage = {
  setTokens: (tokens: AuthTokens): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      } else {
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
      localStorage.setItem(STORAGE_KEYS.SESSION_VALID, "true");
    } catch (error) {
      console.error("Error saving tokens to localStorage:", error);
    }
  },

  getTokens: (): AuthTokens | null => {
    try {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (accessToken) {
        return { accessToken, refreshToken };
      }
    } catch (error) {
      console.error("Error reading tokens from localStorage:", error);
    }
    return null;
  },

  setUser: (user: User): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user to localStorage:", error);
    }
  },

  getUser: (): User | null => {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error reading user from localStorage:", error);
      return null;
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.SESSION_VALID);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },

  // Verificar se tem dados salvos e válidos
  hasStoredAuth: (): boolean => {
    try {
      const tokens = storage.getTokens();
      const user = storage.getUser();
      const sessionValid =
        localStorage.getItem(STORAGE_KEYS.SESSION_VALID) === "true";

      return !!(tokens && user && sessionValid);
    } catch {
      return false;
    }
  },

  // Verificar se os tokens são válidos (não expirados)
  hasValidTokens: (): boolean => {
    try {
      const tokens = storage.getTokens();

      if (!tokens) return false;

      // Verificar access token
      const accessTokenValid = !isTokenExpired(tokens.accessToken);

      // Se access token válido, sessão válida
      if (accessTokenValid) return true;

      // Se access token expirado, verificar refresh token
      if (!tokens.refreshToken) return false;

      const refreshTokenValid = !isTokenExpired(tokens.refreshToken);

      return refreshTokenValid;
    } catch {
      return false;
    }
  },

  // Marcar sessão como inválida sem limpar dados
  invalidateSession: (): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_VALID, "false");
    } catch (error) {
      console.error("Error invalidating session:", error);
    }
  },

  // Verificar se precisa renovar token
  needsTokenRefresh: (): boolean => {
    try {
      const tokens = storage.getTokens();

      if (!tokens) return false;

      // Se access token expirou mas refresh token válido
      return (
        isTokenExpired(tokens.accessToken) &&
        !!tokens.refreshToken && !isTokenExpired(tokens.refreshToken)
      );
    } catch {
      return false;
    }
  },

  // Função para debug/desenvolvimento
  getTokenInfo: () => {
    try {
      const tokens = storage.getTokens();

      if (!tokens) return null;

      const accessPayload = JSON.parse(atob(tokens.accessToken.split(".")[1]));
      const refreshPayload = tokens.refreshToken
        ? JSON.parse(atob(tokens.refreshToken.split(".")[1]))
        : null;

      return {
        accessToken: {
          exp: new Date(accessPayload.exp * 1000),
          expired: isTokenExpired(tokens.accessToken),
        },
        refreshToken: refreshPayload
          ? {
              exp: new Date(refreshPayload.exp * 1000),
              expired: isTokenExpired(tokens.refreshToken!),
            }
          : null,
      };
    } catch {
      return null;
    }
  },
};
