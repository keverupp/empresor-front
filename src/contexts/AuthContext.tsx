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

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  validateSession: () => Promise<void>;
}

// Actions
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; tokens: AuthTokens } }
  | { type: "AUTH_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "UPDATE_TOKENS"; payload: AuthTokens }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_LOADING"; payload: boolean };

// Reducer
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
      return {
        ...state,
        tokens: action.payload,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Função para verificar se o JWT está expirado
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true; // Se não conseguir decodificar, considera expirado
  }
};

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isLoading: true, // Inicia como true para validar sessão
  isAuthenticated: false,
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Função para validar sessão atual
  const validateSession = async (): Promise<void> => {
    const tokens = storage.getTokens();
    const user = storage.getUser();

    if (!tokens || !user) {
      dispatch({ type: "AUTH_FAILURE" });
      return;
    }

    // Verificar se o access token não está expirado
    if (!isTokenExpired(tokens.accessToken)) {
      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user, tokens },
      });
      return;
    }

    // Se access token expirou, tentar renovar com refresh token
    if (tokens.refreshToken && !isTokenExpired(tokens.refreshToken)) {
      try {
        await refreshTokenInternal(tokens.refreshToken);
      } catch (error) {
        console.error("Token refresh failed during validation:", error);
        storage.clear();
        dispatch({ type: "AUTH_FAILURE" });
      }
    } else {
      // Refresh token também expirado, limpar sessão
      storage.clear();
      dispatch({ type: "AUTH_FAILURE" });
    }
  };

  // Função interna para refresh token (sem loops)
  const refreshTokenInternal = async (refreshToken: string): Promise<void> => {
    const apiUrl = `${appConfig.development.api.baseURL}${appConfig.urls.api.endpoints.auth.refresh}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    const user = storage.getUser();

    if (user) {
      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user, tokens: data },
      });
    }
  };

  // Inicializar estado ao carregar a aplicação
  useEffect(() => {
    validateSession();
  }, []);

  // Salvar no localStorage quando state mudar
  useEffect(() => {
    if (state.tokens && state.user) {
      storage.setTokens(state.tokens);
      storage.setUser(state.user);
    }
  }, [state.tokens, state.user]);

  const login = async ({
    email,
    password,
  }: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: "AUTH_START" });

      const apiUrl = `${appConfig.development.api.baseURL}${appConfig.urls.api.endpoints.auth.login}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: data.user,
          tokens: data.tokens,
        },
      });

      toast.success(`Bem-vindo, ${data.user.name}!`, {
        description: "Login realizado com sucesso.",
      });
    } catch (error) {
      dispatch({ type: "AUTH_FAILURE" });
      const errorMessage =
        error instanceof Error ? error.message : "Falha no login";
      toast.error("Erro no login", {
        description: errorMessage,
      });
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: data.user,
          tokens: data.tokens,
        },
      });

      toast.success("Conta criada com sucesso!", {
        description: `Bem-vindo ao Empresor, ${data.user.name}!`,
      });
    } catch (error) {
      dispatch({ type: "AUTH_FAILURE" });
      const errorMessage =
        error instanceof Error ? error.message : "Falha no registro";
      toast.error("Erro ao criar conta", {
        description: errorMessage,
      });
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Forgot password failed");
      }

      toast.success("E-mail enviado!", {
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao enviar e-mail";
      toast.error("Erro na recuperação", {
        description: errorMessage,
      });
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Reset password failed");
      }

      toast.success("Senha redefinida!", {
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao redefinir senha";
      toast.error("Erro na redefinição", {
        description: errorMessage,
      });
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
      // Se falhar o refresh, deslogar o usuário
      storage.clear();
      dispatch({ type: "LOGOUT" });
      toast.error("Sessão expirada", {
        description: "Você precisa fazer login novamente.",
      });
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshToken,
    validateSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Hook para usar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
