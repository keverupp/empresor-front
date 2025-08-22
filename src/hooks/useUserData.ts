// src/hooks/useUserData.ts
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ExtendedUserData {
  name: string;
  email: string;
  avatar?: string | null; // Avatar opcional
  role?: string;
  status?: string;
  active_plan?: {
    plan_name: string;
    status: string;
    trial_ends_at?: string;
    current_period_ends_at?: string;
  } | null;
}

export const useUserData = () => {
  const { user, isAuthenticated } = useAuth();
  const { getProfile } = useUserProfile();
  const [userData, setUserData] = useState<ExtendedUserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const profile = await getProfile();

      setUserData({
        name: profile.name,
        email: profile.email,
        // Só define avatar se existir e não for vazio
        avatar:
          profile.avatar_url && profile.avatar_url.trim() !== ""
            ? profile.avatar_url
            : null,
        role: profile.role,
        status: profile.status,
        active_plan: profile.active_plan,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados do usuário";
      setError(errorMessage);

      // Em caso de erro, usa dados básicos do contexto de auth SEM avatar
      if (user) {
        setUserData({
          name: user.name,
          email: user.email,
          avatar: null, // Não define avatar padrão
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [getProfile, isAuthenticated, user]);

  useEffect(() => {
    loadUserData();
  }, [isAuthenticated, user, loadUserData]);

  return {
    userData,
    isLoading,
    error,
    refreshUserData: loadUserData,
  };
};
