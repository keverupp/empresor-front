// src/hooks/useApi.ts
import { useAuth } from "../contexts/AuthContext";
import { useCallback, useRef } from "react";
import type { ApiOptions, ApiResponse } from "../types/auth";
import { appConfig } from "../config/app";
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
        responseType = "json",
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
          if (
            !(fetchOptions.body instanceof FormData) &&
            !headers.has("Content-Type")
          ) {
            headers.set("Content-Type", "application/json");
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

          const contentType = response.headers.get("content-type") ?? "";
          const hasBody = response.status !== 204 && response.status !== 205;

          if (response.ok) {
            let responseData: T | null = null;

            try {
              if (responseType === "blob") {
                responseData = (await response.blob()) as unknown as T;
              } else if (responseType === "arrayBuffer") {
                responseData = (await response.arrayBuffer()) as unknown as T;
              } else if (responseType === "text") {
                responseData = (await response.text()) as unknown as T;
              } else if (hasBody && contentType.includes("application/json")) {
                responseData = (await response.json()) as T;
              } else if (contentType.includes("application/pdf")) {
                responseData = (await response.blob()) as unknown as T;
              } else if (hasBody) {
                responseData = (await response.text()) as unknown as T;
              }
            } catch (parseError) {
              console.error("Failed to parse response:", parseError);
              responseData = null;
            }

            if (showSuccessToast && responseData) {
              const message =
                ((responseData as Record<string, unknown>)?.message as string) ??
                "Operação realizada com sucesso";
              toast.success("Sucesso", { description: message });
            }

            return {
              data: responseData,
              error: null,
              status: response.status,
              headers: response.headers,
            };
          }

          let errorBody: unknown = null;

          if (hasBody && contentType.includes("application/json")) {
            try {
              errorBody = await response.json();
            } catch (jsonError) {
              console.error("Failed to parse error response as JSON:", jsonError);
              errorBody = null;
            }
          } else if (hasBody) {
            try {
              errorBody = await response.text();
            } catch (textError) {
              console.error("Failed to parse error response as text:", textError);
              errorBody = null;
            }
          }

          const errorData =
            typeof errorBody === "string" ? null : (errorBody as Record<string, unknown> | null);

          const errorMessage =
            (errorData?.message as string) ||
            (errorData?.error as string) ||
            (typeof errorBody === "string" && errorBody.trim()
              ? errorBody.trim()
              : undefined) ||
            `Erro ${response.status}: ${response.statusText}`;

          const shouldToast =
            showErrorToast &&
            !(response.status === 401 && !latestTokens?.accessToken);

          if (shouldToast) {
            toast.error("Erro na operação", { description: errorMessage });
          }

          return {
            error: errorMessage,
            data: null,
            status: response.status,
            headers: response.headers,
          };
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
              headers: undefined,
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
        headers: undefined,
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
