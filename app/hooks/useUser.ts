"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { User } from "@/app/types";
import { get, post } from "@/app/lib/api";

export const useUser = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserProfile = useCallback(async (): Promise<User | null> => {
    if (!user) return null;

    setIsLoading(true);
    setError(null);

    try {
      // クライアントサイドからの直接アクセスの代わりに、サーバーAPIを使用
      const response = await get<{ data: User | null; error?: string }>(
        `/api/me`
      );

      if (response.error) {
        setError(response.error);
        return null;
      }

      if (!response.data?.data) {
        // ユーザープロファイルが存在しない場合、作成を試みる
        const createResponse = await post<{
          data: User | null;
          error?: string;
        }>("/api/me", {
          email: user.email,
          first_name: user.user_metadata?.first_name || "",
          last_name: user.user_metadata?.last_name || "",
          role: user.user_metadata?.role || "customer",
        });

        if (createResponse.error) {
          setError(createResponse.error);
          return null;
        }

        return createResponse.data?.data || null;
      }

      return response.data.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateUserProfile = useCallback(
    async (
      userData: Partial<User>
    ): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      setIsLoading(true);
      setError(null);

      try {
        // クライアントからの直接更新の代わりに、サーバーAPIを使用
        const response = await post<{ success: boolean; error?: string }>(
          "/api/me",
          userData
        );

        if (response.error) {
          setError(response.error);
          return { success: false, error: response.error };
        }

        return { success: true };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  return {
    getUserProfile,
    updateUserProfile,
    isLoading,
    error,
  };
};
