// src/hooks/useApi.ts
import { useAuth } from "../contexts/AuthContext";
import { useCallback, useRef } from "react";
import type { ApiOptions, ApiResponse } from "../types/auth";
import { appConfig } from "../config/app";
import { storage } from "../utils/storage";
import { toast } from "sonner";

export const useApi = () => {
  const { tokens, refreshToken, logout } = useAuth();
  const isRefreshingRef = useRef(false);
  const tokensRef = useRef(tokens);
  tokensRef.current = tokens;

  const apiCall = useCallback(
    async <T = unknown>(
      endpoint: string,
      options: ApiOptions = {}
    ): Promise<ApiResponse<T>> => {
      const {
        skipAuth = false,
        showErrorToast = true,
        showSuccessToast = false,
        ...fetchOptions
      } = options;

      const fullUrl = endpoint.startsWith("http")
        ? endpoint
        : `${appConfig.development.api.baseURL}${endpoint}`;

      let retries = 0;
      const maxRetries = appConfig.development.api.retries ?? 1;

      while (retries <= maxRetries) {
        try {
          const headers = new Headers(fetchOptions.headers);
          headers.set("Content-Type", "application/json");

          if (
            !skipAuth &&
            storage.needsTokenRefresh() &&
            !isRefreshingRef.current
          ) {
            try {
              isRefreshingRef.current = true;
              await refreshToken();
              await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (error) {
              console.error("Pre-request token refresh failed:", error);
            } finally {
              isRefreshingRef.current = false;
            }
          }

          const latestTokens = tokensRef.current;
          if (!skipAuth && latestTokens?.accessToken) {
            headers.set("Authorization", `Bearer ${latestTokens.accessToken}`);
          }

          const config: RequestInit = {
            ...fetchOptions,
            headers,
            signal: AbortSignal.timeout?.(
              appConfig.development.api.timeout ?? 30000
            ),
          };

          let response = await fetch(fullUrl, config);
          if (
            response.status === 401 &&
            !skipAuth &&
            latestTokens?.refreshToken &&
            !isRefreshingRef.current &&
            retries === 0
          ) {
            try {
              isRefreshingRef.current = true;
              await refreshToken();
              await new Promise((resolve) => setTimeout(resolve, 100));

              const refreshedTokens = tokensRef.current;
              if (
                refreshedTokens?.accessToken &&
                refreshedTokens.accessToken !== latestTokens.accessToken
              ) {
                headers.set(
                  "Authorization",
                  `Bearer ${refreshedTokens.accessToken}`
                );
                response = await fetch(fullUrl, {
                  ...fetchOptions,
                  headers,
                  signal: AbortSignal.timeout?.(
                    appConfig.development.api.timeout ?? 30000
                  ),
                });
              }
            } catch (refreshError) {
              console.error(
                "Token refresh failed during API call:",
                refreshError
              );
              storage.clear();
              await logout();
              return {
                error: "Sessão expirada. Faça login novamente.",
                data: null,
                status: 401,
              };
            } finally {
              isRefreshingRef.current = false;
            }
          }

          let responseData: T | null = null;
          const contentType = response.headers.get("content-type");

          if (contentType?.includes("application/json")) {
            responseData = (await response.json()) as T;
          } else if (response.ok) {
            responseData = (await response.text()) as unknown as T;
          }

          if (response.ok) {
            if (showSuccessToast && responseData) {
              const message =
                ((responseData as Record<string, unknown>)
                  ?.message as string) ?? "Operação realizada com sucesso";
              toast.success("Sucesso", { description: message });
            }

            return {
              data: responseData,
              error: null,
              status: response.status,
            };
          } else {
            const errorData = responseData as Record<string, unknown> | null;
            const errorMessage =
              (errorData?.message as string) ||
              (errorData?.error as string) ||
              `Erro ${response.status}: ${response.statusText}`;

            if (showErrorToast && (response.status !== 401 || latestTokens?.accessToken)) {
              toast.error("Erro na operação", { description: errorMessage });
            }

            return {
              error: errorMessage,
              data: null,
              status: response.status,
            };
          }
        } catch (err: unknown) {
          console.error(`API call error (retry ${retries}):`, err);

          if (retries >= maxRetries) {
            const errorMessage =
              err instanceof Error
                ? err.message
                : "Erro de rede. Verifique sua conexão.";

            if (showErrorToast) {
              toast.error("Erro de conexão", { description: errorMessage });
            }

            return {
              error: errorMessage,
              data: null,
              status: 0,
            };
          }

          retries++;
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
        }
      }

      return {
        error: "Falha após múltiplas tentativas",
        data: null,
        status: 0,
      };
    },
    [refreshToken, logout]
  );

  const get = useCallback(
    <T = unknown>(endpoint: string, options?: Omit<ApiOptions, "method">) =>
      apiCall<T>(endpoint, { ...options, method: "GET" }),
    [apiCall]
  );

  const post = useCallback(
    <T = unknown>(
      endpoint: string,
      data?: unknown,
      options?: Omit<ApiOptions, "method" | "body">
    ) =>
      apiCall<T>(endpoint, {
        ...options,
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [apiCall]
  );

  const put = useCallback(
    <T = unknown>(
      endpoint: string,
      data?: unknown,
      options?: Omit<ApiOptions, "method" | "body">
    ) =>
      apiCall<T>(endpoint, {
        ...options,
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [apiCall]
  );

  const patch = useCallback(
    <T = unknown>(
      endpoint: string,
      data?: unknown,
      options?: Omit<ApiOptions, "method" | "body">
    ) =>
      apiCall<T>(endpoint, {
        ...options,
        method: "PATCH",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [apiCall]
  );

  const del = useCallback(
    <T = unknown>(
      endpoint: string,
      data?: unknown,
      options?: Omit<ApiOptions, "method" | "body">
    ) =>
      apiCall<T>(endpoint, {
        ...options,
        method: "DELETE",
        body: data ? JSON.stringify(data) : JSON.stringify({}),
      }),
    [apiCall]
  );

  return {
    apiCall,
    get,
    post,
    put,
    patch,
    delete: del,
  };
};
