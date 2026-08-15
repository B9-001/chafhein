import { useCallback } from "react";
import { trpc } from "@/lib/trpc";

// Admin dashboard session — a lightweight email/password login backed by the
// `adminAuth` tRPC router, separate from the Manus-OAuth-based `useAuth` hook
// which has no working login portal outside the Manus platform.
export function useAdminAuth() {
  const utils = trpc.useUtils();

  const meQuery = trpc.adminAuth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = trpc.adminAuth.login.useMutation({
    onSuccess: () => {
      utils.adminAuth.me.invalidate();
    },
  });

  const logoutMutation = trpc.adminAuth.logout.useMutation({
    onSuccess: () => {
      utils.adminAuth.me.setData(undefined, null);
    },
  });

  const login = useCallback(
    (email: string, password: string) => loginMutation.mutateAsync({ email, password }),
    [loginMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    await utils.adminAuth.me.invalidate();
  }, [logoutMutation, utils]);

  return {
    admin: meQuery.data ?? null,
    isAuthenticated: Boolean(meQuery.data),
    loading: meQuery.isLoading,
    login,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
  };
}
