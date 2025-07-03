// src/hooks/useApi.ts
import { useAuth } from "../contexts/AuthContext";
import { useCallback, useRef } from "react";
import type { ApiOptions, ApiResponse } from "../types/auth";
import { appConfig } from "../config/app";
import { toast } from "sonner";

export const useApi = () => {
  const { tokens, refreshToken, logout } = useAuth();

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
      const maxRetries = appConfig.development.api.retries;

      while (retries <= maxRetries) {
        try {
          const currentTokens = tokensRef.current;

          const headers = new Headers(fetchOptions.headers);
          headers.set("Content-Type", "application/json");

          if (!skipAuth && currentTokens?.accessToken) {
            headers.set("Authorization", `Bearer ${currentTokens.accessToken}`);
          }

          const config: RequestInit = {
            ...fetchOptions,
            headers,
            // fallback para evitar erro em alguns browsers / node
            signal:
              AbortSignal.timeout?.(appConfig.development.api.timeout) ??
              undefined,
          };

          let response = await fetch(fullUrl, config);

          if (
            response.status === 401 &&
            !skipAuth &&
            currentTokens?.refreshToken &&
            retries === 0
          ) {
            try {
              await refreshToken();
              await new Promise((resolve) => setTimeout(resolve, 100));
              const refreshedTokens = tokensRef.current;

              if (
                refreshedTokens?.accessToken &&
                refreshedTokens.accessToken !== currentTokens.accessToken
              ) {
                headers.set(
                  "Authorization",
                  `Bearer ${refreshedTokens.accessToken}`
                );

                const retryConfig: RequestInit = {
                  ...fetchOptions,
                  headers,
                  signal:
                    AbortSignal.timeout?.(appConfig.development.api.timeout) ??
                    undefined,
                };

                response = await fetch(fullUrl, retryConfig);
              }
            } catch {
              await logout();
              return {
                error: "Session expired. Please login again.",
                status: 401,
              };
            }
          }

          const data = (await response.json()) as T;

          if (!response.ok) {
            const errorMessage =
              typeof data === "object" && data !== null && "message" in data
                ? (data as { message: string }).message
                : "Request failed";

            if (showErrorToast) {
              toast.error("Erro na requisição", {
                description: errorMessage,
              });
            }

            return {
              error: errorMessage,
              status: response.status,
            };
          }

          if (showSuccessToast) {
            toast.success("Operação realizada com sucesso!");
          }

          return {
            data,
            status: response.status,
          };
        } catch (err: unknown) {
          retries++;

          const errorMessage =
            err instanceof Error ? err.message : "Network error";

          if (retries > maxRetries) {
            if (showErrorToast) {
              toast.error("Erro de conexão", {
                description: errorMessage,
              });
            }

            return {
              error: errorMessage,
              status: 0,
            };
          }

          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
        }
      }

      if (showErrorToast) {
        toast.error("Erro de conexão", {
          description: "Máximo de tentativas excedido. Verifique sua conexão.",
        });
      }

      return {
        error: "Max retries exceeded",
        status: 0,
      };
    },
    [refreshToken, logout] // tokens removidos corretamente
  );

  return {
    apiCall,
    get: <T = unknown>(endpoint: string, options?: ApiOptions) =>
      apiCall<T>(endpoint, { method: "GET", ...options }),

    post: <T = unknown>(
      endpoint: string,
      data?: unknown,
      options?: ApiOptions
    ) =>
      apiCall<T>(endpoint, {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
        showSuccessToast: true,
        ...options,
      }),

    put: <T = unknown>(
      endpoint: string,
      data?: unknown,
      options?: ApiOptions
    ) =>
      apiCall<T>(endpoint, {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
        showSuccessToast: true,
        ...options,
      }),

    patch: <T = unknown>(
      endpoint: string,
      data?: unknown,
      options?: ApiOptions
    ) =>
      apiCall<T>(endpoint, {
        method: "PATCH",
        body: data ? JSON.stringify(data) : undefined,
        showSuccessToast: true,
        ...options,
      }),

    delete: <T = unknown>(endpoint: string, options?: ApiOptions) =>
      apiCall<T>(endpoint, {
        method: "DELETE",
        showSuccessToast: true,
        ...options,
      }),
  };
};
