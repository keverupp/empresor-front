// src/hooks/useUserData.ts
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ExtendedUserData {
  name: string;
  email: string;
  avatar: string;
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

  const loadUserData = async () => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const profile = await getProfile();

      setUserData({
        name: profile.name,
        email: profile.email,
        avatar: `/avatars/${profile.name.toLowerCase().replace(" ", "")}.jpg`,
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

      // Em caso de erro, usa dados básicos do contexto de auth
      if (user) {
        setUserData({
          name: user.name,
          email: user.email,
          avatar: `/avatars/default.jpg`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [isAuthenticated, user]);

  return {
    userData,
    isLoading,
    error,
    refreshUserData: loadUserData,
  };
};
