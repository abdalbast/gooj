import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { hasSupabaseConfig, maybeGetSupabaseClient } from "@/lib/supabase";
import { getAdminMembership, getSupabaseErrorMessage } from "@/lib/supabaseData";
import {
  AuthContext,
  type AdminMembership,
  type AuthContextValue,
} from "./auth-context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const client = maybeGetSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(hasSupabaseConfig());
  const [adminMembership, setAdminMembership] = useState<AdminMembership | null>(null);
  const [adminCheckError, setAdminCheckError] = useState<string | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!client) {
      setIsAuthLoading(false);
      return;
    }

    let active = true;

    void client.auth
      .getSession()
      .then(({ data }) => {
        if (!active) {
          return;
        }

        setSession(data.session ?? null);
        setIsAuthLoading(false);
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setSession(null);
        setIsAuthLoading(false);
      });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client]);

  useEffect(() => {
    if (!client || !userId) {
      setAdminMembership(null);
      setAdminCheckError(null);
      setIsAdminLoading(false);
      return;
    }

    let active = true;
    setIsAdminLoading(true);

    void getAdminMembership(userId)
      .then((membership) => {
        if (!active) {
          return;
        }

        if (!membership) {
          setAdminMembership(null);
          setAdminCheckError(null);
          return;
        }

        setAdminCheckError(null);
        setAdminMembership({
          active: membership.active,
          email: membership.email,
          fullName: membership.full_name,
          role: membership.role,
          userId: membership.user_id,
        });
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setAdminMembership(null);
        setAdminCheckError(getSupabaseErrorMessage(error, "Could not verify admin access."));
      })
      .finally(() => {
        if (!active) {
          return;
        }

        setIsAdminLoading(false);
      });

    return () => {
      active = false;
    };
  }, [client, userId]);

  const value = useMemo<AuthContextValue>(
    () => ({
      adminCheckError,
      adminMembership,
      hasConfig: hasSupabaseConfig(),
      isAdmin: Boolean(adminMembership?.active),
      isAdminLoading,
      isAuthLoading,
      session,
      signInWithMagicLink: async (email, redirectPath = "/") => {
        if (!client) {
          return {
            error: new Error(
              "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
            ),
          };
        }

        try {
          const emailRedirectTo = new URL(redirectPath, window.location.origin).toString();
          const { error } = await client.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo,
            },
          });

          return {
            error: error ? new Error(error.message) : null,
          };
        } catch (error) {
          return {
            error:
              error instanceof Error ? error : new Error("Failed to start the Supabase sign-in flow."),
          };
        }
      },
      signOut: async () => {
        if (!client) {
          return { error: null };
        }

        try {
          const { error } = await client.auth.signOut();
          setAdminMembership(null);
          setAdminCheckError(null);

          return {
            error: error ? new Error(error.message) : null,
          };
        } catch (error) {
          return {
            error: error instanceof Error ? error : new Error("Failed to sign out."),
          };
        }
      },
      user: session?.user ?? null,
    }),
    [adminCheckError, adminMembership, client, isAdminLoading, isAuthLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
