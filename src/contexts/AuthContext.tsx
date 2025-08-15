// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import {
  AuthState,
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
} from "../types/auth";
import { storage } from "../utils/storage";
import { appConfig } from "../config/app";
import { toast } from "sonner";

// ============================
// Types do Contexto
// ============================
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  validateSession: () => Promise<void>;

  // Derivados
  activePlan: User["active_plan"] | null;
  hasCatalog: boolean;
}

// ============================
// Actions & Reducer
// ============================
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; tokens: AuthTokens } }
  | { type: "AUTH_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "UPDATE_TOKENS"; payload: AuthTokens }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_LOADING"; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true };
    case "AUTH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        tokens: action.payload.tokens,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        tokens: null,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        tokens: null,
        isLoading: false,
      };
    case "UPDATE_TOKENS":
      return { ...state, tokens: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

// ============================
// Utils
// ============================

// Verificar se o JWT está expirado
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true; // Se não conseguir decodificar, considera expirado
  }
};

// Endpoint helper para /users/me
const getMeUrl = (): string => {
  const base = appConfig.development.api.baseURL;
  // Usa endpoint do appConfig se existir; fallback para /api/users/me

  const pathFromConfig = appConfig?.urls?.api?.endpoints?.users?.me as
    | string
    | undefined;
  return pathFromConfig ? `${base}${pathFromConfig}` : `${base}/api/users/me`;
};

// Buscar o usuário atual (inclui active_plan)
async function fetchCurrentUser(accessToken: string): Promise<User> {
  const res = await fetch(getMeUrl(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let message = "Falha ao carregar dados do usuário";
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return (await res.json()) as User;
}

// Regra simples: qualquer plano diferente de "Gratuito" tem catálogo
function computeHasCatalog(user: User | null): boolean {
  const plan = user?.active_plan;
  if (!plan) return false;

  const isEligibleStatus =
    plan.status === "active" || plan.status === "trialing";
  if (!isEligibleStatus) return false;

  return plan.plan_name.toLowerCase() !== "gratuito";
}

// ============================
// Initial state & Context
// ============================
const initialState: AuthState = {
  user: null,
  tokens: null,
  isLoading: true, // inicia validando sessão
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================
// Provider
// ============================
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ------- Internals -------
  const refreshTokenInternal = async (refreshToken: string): Promise<void> => {
    const apiUrl = `${appConfig.development.api.baseURL}${appConfig.urls.api.endpoints.auth.refresh}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const newTokens = (await response.json()) as AuthTokens;

    // Após renovar, sempre recarrega /me para garantir active_plan atualizado
    const me = await fetchCurrentUser(newTokens.accessToken);

    dispatch({
      type: "AUTH_SUCCESS",
      payload: { user: me, tokens: newTokens },
    });
  };

  const validateSession = async (): Promise<void> => {
    const tokens = storage.getTokens();

    if (!tokens) {
      dispatch({ type: "AUTH_FAILURE" });
      return;
    }

    // access token válido → busca /me (garante active_plan atualizado)
    if (!isTokenExpired(tokens.accessToken)) {
      try {
        const me = await fetchCurrentUser(tokens.accessToken);
        dispatch({ type: "AUTH_SUCCESS", payload: { user: me, tokens } });
        return;
      } catch (err) {
        // tenta refresh em seguida
        // eslint-disable-next-line no-console
        console.error("Falha ao carregar /me, tentando refresh:", err);
      }
    }

    // tenta refresh com refreshToken válido
    if (tokens.refreshToken && !isTokenExpired(tokens.refreshToken)) {
      try {
        await refreshTokenInternal(tokens.refreshToken);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Token refresh failed during validation:", error);
        storage.clear();
        dispatch({ type: "AUTH_FAILURE" });
      }
    } else {
      storage.clear();
      dispatch({ type: "AUTH_FAILURE" });
    }
  };

  // Inicializar estado ao carregar a aplicação
  useEffect(() => {
    void validateSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistir no storage quando tokens & user mudarem
  useEffect(() => {
    if (state.tokens && state.user) {
      storage.setTokens(state.tokens);
      storage.setUser(state.user);
    }
  }, [state.tokens, state.user]);

  // ------- API Pública (AuthContextType) -------
  const login = async ({
    email,
    password,
  }: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: "AUTH_START" });

      const apiUrl = `${appConfig.development.api.baseURL}${appConfig.urls.api.endpoints.auth.login}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let message = "Login failed";
        try {
          const errorData = await response.json();
          message = errorData?.message || message;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      const data = await response.json();
      const tokens: AuthTokens = data.tokens;

      // Busca /me com o accessToken recém-obtido (traz active_plan)
      const me = await fetchCurrentUser(tokens.accessToken);

      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user: me, tokens },
      });

      toast.success(`Bem-vindo, ${me.name}!`, {
        description: "Login realizado com sucesso.",
      });
    } catch (error) {
      dispatch({ type: "AUTH_FAILURE" });
      const errorMessage =
        error instanceof Error ? error.message : "Falha no login";
      toast.error("Erro no login", { description: errorMessage });
      throw error;
    }
  };

  const register = async ({
    name,
    email,
    password,
  }: RegisterData): Promise<void> => {
    try {
      dispatch({ type: "AUTH_START" });

      const apiUrl = `${appConfig.development.api.baseURL}${appConfig.urls.api.endpoints.auth.register}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        let message = "Registration failed";
        try {
          const errorData = await response.json();
          message = errorData?.message || message;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      const data = await response.json();
      const tokens: AuthTokens = data.tokens;

      // Após registrar, também carregue /me (já com active_plan se existir)
      const me = await fetchCurrentUser(tokens.accessToken);

      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user: me, tokens },
      });

      toast.success("Conta criada com sucesso!", {
        description: `Bem-vindo ao Empresor, ${me.name}!`,
      });
    } catch (error) {
      dispatch({ type: "AUTH_FAILURE" });
      const errorMessage =
        error instanceof Error ? error.message : "Falha no registro";
      toast.error("Erro ao criar conta", { description: errorMessage });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (state.tokens?.accessToken) {
        const apiUrl = `${appConfig.development.api.baseURL}${appConfig.urls.api.endpoints.auth.logout}`;

        await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${state.tokens.accessToken}`,
            "Content-Type": "application/json",
          },
        });
      }

      toast.success("Logout realizado", {
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Logout error:", error);
      toast.error("Erro no logout", {
        description: "Houve um problema ao desconectar.",
      });
    } finally {
      storage.clear();
      dispatch({ type: "LOGOUT" });
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      const apiUrl = `${appConfig.development.api.baseURL}${appConfig.urls.api.endpoints.auth.forgotPassword}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        let message = "Forgot password failed";
        try {
          const errorData = await response.json();
          message = errorData?.message || message;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      toast.success("E-mail enviado!", {
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao enviar e-mail";
      toast.error("Erro na recuperação", { description: errorMessage });
      throw error;
    }
  };

  const resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<void> => {
    try {
      const apiUrl = `${appConfig.development.api.baseURL}${appConfig.urls.api.endpoints.auth.resetPassword}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        let message = "Reset password failed";
        try {
          const errorData = await response.json();
          message = errorData?.message || message;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      toast.success("Senha redefinida!", {
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao redefinir senha";
      toast.error("Erro na redefinição", { description: errorMessage });
      throw error;
    }
  };

  const refreshToken = async (): Promise<void> => {
    if (!state.tokens?.refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      await refreshTokenInternal(state.tokens.refreshToken);
    } catch (error) {
      storage.clear();
      dispatch({ type: "LOGOUT" });
      toast.error("Sessão expirada", {
        description: "Você precisa fazer login novamente.",
      });
      throw error;
    }
  };

  // ------- Derivados expostos -------
  const activePlan = state.user?.active_plan ?? null;
  const hasCatalog = computeHasCatalog(state.user);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshToken,
    validateSession,

    // derivados
    activePlan,
    hasCatalog,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// ============================
// Hook
// ============================
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
