"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import {
  AuthState,
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
} from "@/types/auth";
import { toast } from "sonner";

interface AuthContextType extends AuthState {
  login: (credentials?: LoginCredentials) => Promise<void>;
  register: (data?: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  validateSession: () => Promise<void>;
  activePlan: User["active_plan"] | null;
  hasCatalog: boolean;
}

type Action =
  | { type: "SESSION_LOADING" }
  | { type: "SESSION_READY"; payload: { user: User; tokens: AuthTokens } }
  | { type: "SESSION_CLEAR" }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: AuthState = {
  user: null,
  tokens: null,
  isLoading: true,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const computeHasCatalog = (user: User | null): boolean => {
  const plan = user?.active_plan;
  if (!plan) return false;
  const eligibleStatuses = new Set(["active", "trialing"]);
  return eligibleStatuses.has(plan.status) &&
    plan.plan_name?.toLowerCase() !== "gratuito";
};

const reducer = (state: AuthState, action: Action): AuthState => {
  switch (action.type) {
    case "SESSION_LOADING":
      return { ...state, isLoading: true };
    case "SESSION_READY":
      return {
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
      };
    case "SESSION_CLEAR":
      return {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

interface RawSessionResponse {
  user: Record<string, unknown> | null;
  tokens: { accessToken?: string; refreshToken?: string | null } | null;
}

const mapAuth0UserToUser = (payload: Record<string, unknown>): User => {
  const customPlan = payload["https://empresor.com.br/active_plan"] as
    | User["active_plan"]
    | undefined;

  return {
    id: (payload.sub as string) ?? "",
    name:
      (payload.name as string) ||
      (payload.nickname as string) ||
      (payload.email as string) ||
      "Usuário",
    email: (payload.email as string) ?? "",
    role:
      (payload["https://empresor.com.br/roles"] as string[] | undefined)?.[0] ??
      "user",
    active_plan: customPlan ?? null,
  };
};

const fetchSession = async (): Promise<{ user: User; tokens: AuthTokens } | null> => {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Não foi possível carregar a sessão atual");
  }

  const body = (await response.json()) as RawSessionResponse;
  if (!body.user || !body.tokens?.accessToken) {
    return null;
  }

  return {
    user: mapAuth0UserToUser(body.user),
    tokens: {
      accessToken: body.tokens.accessToken,
      refreshToken: body.tokens.refreshToken ?? null,
    },
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadSession = useCallback(async () => {
    dispatch({ type: "SESSION_LOADING" });
    try {
      const session = await fetchSession();
      if (!session) {
        dispatch({ type: "SESSION_CLEAR" });
        return;
      }
      dispatch({ type: "SESSION_READY", payload: session });
    } catch (error) {
      console.error("Erro ao carregar sessão Auth0:", error);
      dispatch({ type: "SESSION_CLEAR" });
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const login = useCallback(async () => {
    const loginUrl = new URL("/api/auth/login", window.location.origin);
    const returnTo = `${window.location.pathname}${window.location.search}`;
    loginUrl.searchParams.set("returnTo", returnTo);
    window.location.assign(loginUrl.toString());
  }, []);

  const register = useCallback(async () => {
    const signupUrl = new URL("/api/auth/login", window.location.origin);
    signupUrl.searchParams.set("screen_hint", "signup");
    signupUrl.searchParams.set("returnTo", "/dashboard");
    window.location.assign(signupUrl.toString());
  }, []);

  const logout = useCallback(async () => {
    window.location.assign("/api/auth/logout");
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const message = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;
      throw new Error(message?.message ?? "Não foi possível enviar o e-mail");
    }

    toast.success("E-mail enviado!", {
      description: "Verifique sua caixa de entrada para redefinir sua senha.",
    });
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const message = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;
      throw new Error(
        message?.message ?? "Não foi possível redefinir a senha agora"
      );
    }

    toast.success("Senha atualizada", {
      description: "Sua senha foi redefinida com sucesso.",
    });
  }, []);

  const refreshToken = useCallback(async () => {
    if (!state.tokens?.refreshToken) {
      await loadSession();
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Falha ao renovar a sessão");
      }

      const session = await fetchSession();
      if (!session) {
        dispatch({ type: "SESSION_CLEAR" });
        return;
      }

      dispatch({ type: "SESSION_READY", payload: session });
    } catch (error) {
      console.error("Erro ao atualizar tokens:", error);
      dispatch({ type: "SESSION_CLEAR" });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [loadSession, state.tokens?.refreshToken]);

  const validateSession = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  const activePlan = state.user?.active_plan ?? null;
  const hasCatalog = computeHasCatalog(state.user);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      ...state,
      login,
      logout,
      register,
      forgotPassword,
      resetPassword,
      refreshToken,
      validateSession,
      activePlan,
      hasCatalog,
    }),
    [
      state,
      login,
      logout,
      register,
      forgotPassword,
      resetPassword,
      refreshToken,
      validateSession,
      activePlan,
      hasCatalog,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de AuthProvider");
  }
  return context;
};
