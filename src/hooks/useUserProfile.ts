// src/hooks/useUserProfile.ts
import { useApi } from "./useApi";
import { useAuth } from "../contexts/AuthContext";
import { useState, useCallback } from "react";
import { UpdateProfileData } from "../types/auth";
import { appConfig } from "../config/app";

interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  active_plan?: {
    plan_name: string;
    status: string;
    trial_ends_at?: string;
    current_period_ends_at?: string;
  } | null;
}

export const useUserProfile = () => {
  const { get, put } = useApi();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(
    async (data: UpdateProfileData) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await put<UserProfileResponse>(
          appConfig.urls.api.endpoints.users.me,
          data
        );
        if (response.error) {
          throw new Error(response.error);
        }
        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update profile";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [put]
  );

  const getProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await get<UserProfileResponse>(
        appConfig.urls.api.endpoints.users.me
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch profile";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      return updateProfile({ currentPassword, newPassword });
    },
    [updateProfile]
  );

  const updateEmail = useCallback(
    async (email: string, currentPassword: string) => {
      return updateProfile({ email, currentPassword });
    },
    [updateProfile]
  );

  const updateName = useCallback(
    async (name: string) => {
      return updateProfile({ name });
    },
    [updateProfile]
  );

  return {
    user,
    updateProfile,
    getProfile,
    changePassword,
    updateEmail,
    updateName,
    isLoading,
    error,
  };
};
