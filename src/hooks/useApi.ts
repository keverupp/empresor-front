// src/hooks/useApi.ts
import { useAuth } from "../contexts/AuthContext";
import { useCallback } from "react";
import { ApiOptions, ApiResponse } from "../types/auth";
import { appConfig } from "../config/app";
import { toast } from "sonner";

export const useApi = () => {
  const { tokens, refreshToken, logout } = useAuth();

  const apiCall = useCallback(
    async <T = any>(
      endpoint: string,
      options: ApiOptions = {}
    ): Promise<ApiResponse<T>> => {
      const {
        skipAuth = false,
        showErrorToast = true,
        showSuccessToast = false,
        ...fetchOptions
      } = options;

      // Construir URL completa
      const fullUrl = endpoint.startsWith("http")
        ? endpoint
        : `${appConfig.development.api.baseURL}${endpoint}`;

      // Configurar headers padrão
      const headers = new Headers(fetchOptions.headers);
      headers.set("Content-Type", "application/json");

      // Adicionar token de autorização se não for skipAuth
      if (!skipAuth && tokens?.accessToken) {
        headers.set("Authorization", `Bearer ${tokens.accessToken}`);
      }

      const config: RequestInit = {
        ...fetchOptions,
        headers,
        signal: AbortSignal.timeout(appConfig.development.api.timeout),
      };

      let retries = 0;
      const maxRetries = appConfig.development.api.retries;

      while (retries <= maxRetries) {
        try {
          let response = await fetch(fullUrl, config);

          // Se receber 401 e tiver refresh token, tentar renovar
          if (
            response.status === 401 &&
            !skipAuth &&
            tokens?.refreshToken &&
            retries === 0
          ) {
            try {
              await refreshToken();

              // Tentar novamente com o novo token
              if (tokens?.accessToken) {
                headers.set("Authorization", `Bearer ${tokens.accessToken}`);
                response = await fetch(fullUrl, { ...config, headers });
              }
            } catch (refreshError) {
              // Se o refresh falhar, deslogar
              await logout();
              return {
                error: "Session expired. Please login again.",
                status: 401,
              };
            }
          }

          const data = await response.json();

          if (!response.ok) {
            const errorMessage = data.message || "Request failed";

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

          // Mostrar toast de sucesso se solicitado
          if (showSuccessToast) {
            toast.success("Operação realizada com sucesso!");
          }

          return {
            data,
            status: response.status,
          };
        } catch (error) {
          retries++;

          if (retries > maxRetries) {
            const errorMessage =
              error instanceof Error ? error.message : "Network error";

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

          // Aguardar antes de tentar novamente
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
        }
      }

      const errorMessage = "Max retries exceeded";

      if (showErrorToast) {
        toast.error("Erro de conexão", {
          description: "Máximo de tentativas excedido. Verifique sua conexão.",
        });
      }

      return {
        error: errorMessage,
        status: 0,
      };
    },
    [tokens, refreshToken, logout]
  );

  return {
    apiCall,
    // Métodos de conveniência
    get: <T = any>(endpoint: string, options?: ApiOptions) =>
      apiCall<T>(endpoint, { method: "GET", ...options }),

    post: <T = any>(endpoint: string, data?: any, options?: ApiOptions) =>
      apiCall<T>(endpoint, {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
        showSuccessToast: true, // Por padrão, mostrar sucesso em posts
        ...options,
      }),

    put: <T = any>(endpoint: string, data?: any, options?: ApiOptions) =>
      apiCall<T>(endpoint, {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
        showSuccessToast: true, // Por padrão, mostrar sucesso em puts
        ...options,
      }),

    patch: <T = any>(endpoint: string, data?: any, options?: ApiOptions) =>
      apiCall<T>(endpoint, {
        method: "PATCH",
        body: data ? JSON.stringify(data) : undefined,
        showSuccessToast: true, // Por padrão, mostrar sucesso em patches
        ...options,
      }),

    delete: <T = any>(endpoint: string, options?: ApiOptions) =>
      apiCall<T>(endpoint, {
        method: "DELETE",
        showSuccessToast: true, // Por padrão, mostrar sucesso em deletes
        ...options,
      }),
  };
};
