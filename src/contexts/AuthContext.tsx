import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import {
  getAdminPermissions,
  hasAnyAdminPermission,
  isAllowedAdminOrigin,
} from "@/lib/adminAccess";
import { hasSupabaseConfig, maybeGetSupabaseClient } from "@/lib/supabase";
import { getAdminMembership, getSupabaseErrorMessage } from "@/lib/supabaseData";
import {
  AuthContext,
  type AdminMembership,
  type AuthContextValue,
} from "./auth-context";

const CONFIG_ERROR_MESSAGE =
  "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.";

const RECOVERY_HASH_PATTERN = /(?:^|&)type=recovery(?:&|$)/;

const getConfigError = () => new Error(CONFIG_ERROR_MESSAGE);

const buildRedirectUrl = (redirectPath: string) => new URL(redirectPath, window.location.origin);

const hasRecoveryHash = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return RECOVERY_HASH_PATTERN.test(window.location.hash.replace(/^#/, ""));
};

const clearRecoveryHash = () => {
  if (typeof window === "undefined" || !hasRecoveryHash()) {
    return;
  }

  const nextUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState({}, document.title, nextUrl);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const client = maybeGetSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(hasSupabaseConfig());
  const [adminMembership, setAdminMembership] = useState<AdminMembership | null>(null);
  const [adminCheckError, setAdminCheckError] = useState<string | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminAssuranceLevel, setAdminAssuranceLevel] = useState<"aal1" | "aal2">("aal1");
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(hasRecoveryHash());
  const userId = session?.user?.id ?? null;

  const clearPasswordRecovery = useCallback(() => {
    setIsPasswordRecovery(false);
    clearRecoveryHash();
  }, []);

  const reloadSession = useCallback(async () => {
    if (!client) {
      setSession(null);
      setIsPasswordRecovery(hasRecoveryHash());
      return;
    }

    const { data } = await client.auth.getSession();
    setSession(data.session ?? null);
    setIsPasswordRecovery(hasRecoveryHash());
  }, [client]);

  useEffect(() => {
    if (!client) {
      setIsPasswordRecovery(hasRecoveryHash());
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
        setIsPasswordRecovery(hasRecoveryHash());
        setIsAuthLoading(false);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setSession(null);
        setIsPasswordRecovery(hasRecoveryHash());
        setIsAuthLoading(false);
      });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event: AuthChangeEvent, nextSession) => {
      setSession(nextSession);
      setIsAuthLoading(false);

      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
        return;
      }

      if (event === "SIGNED_OUT") {
        clearPasswordRecovery();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [clearPasswordRecovery, client]);

  useEffect(() => {
    if (!client || !session?.access_token) {
      setAdminAssuranceLevel("aal1");
      return;
    }

    let active = true;

    void client.auth.mfa
      .getAuthenticatorAssuranceLevel(session.access_token)
      .then(({ data, error }) => {
        if (!active) {
          return;
        }

        if (error) {
          setAdminAssuranceLevel("aal1");
          return;
        }

        setAdminAssuranceLevel(data.currentLevel === "aal2" ? "aal2" : "aal1");
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setAdminAssuranceLevel("aal1");
      });

    return () => {
      active = false;
    };
  }, [client, session?.access_token]);

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

        const adminPermissions = getAdminPermissions(membership.role);

        setAdminCheckError(
          hasAnyAdminPermission(adminPermissions)
            ? null
            : `Admin role "${membership.role}" is not recognized by this app.`,
        );
        setAdminMembership({
          active: membership.active,
          email: membership.email,
          fullName: membership.full_name,
          role: membership.role,
          userId: membership.user_id,
        });
      })
      .catch((error) => {
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

  const adminPermissions = useMemo(
    () => getAdminPermissions(adminMembership?.role),
    [adminMembership?.role],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      adminAssuranceLevel,
      adminCheckError,
      adminMembership,
      adminPermissions,
      clearPasswordRecovery,
      hasConfig: hasSupabaseConfig(),
      isAdmin: Boolean(adminMembership?.active) && hasAnyAdminPermission(adminPermissions),
      isAdminLoading,
      isAdminMfaVerified: adminAssuranceLevel === "aal2",
      isAuthLoading,
      isPasswordRecovery,
      reloadSession,
      requestPasswordReset: async (email, redirectPath = "/reminders") => {
        if (!client) {
          return {
            error: getConfigError(),
          };
        }

        try {
          const emailRedirectUrl = buildRedirectUrl(redirectPath);
          const { error } = await client.auth.resetPasswordForEmail(email, {
            redirectTo: emailRedirectUrl.toString(),
          });

          return {
            error: error ? new Error(error.message) : null,
          };
        } catch (error) {
          return {
            error:
              error instanceof Error ? error : new Error("Failed to send the password reset email."),
          };
        }
      },
      session,
      signInWithGoogle: async (redirectPath = "/reminders") => {
        if (!client) {
          return {
            error: getConfigError(),
          };
        }

        try {
          const redirectUrl = buildRedirectUrl(redirectPath);
          const { error } = await client.auth.signInWithOAuth({
            options: {
              redirectTo: redirectUrl.toString(),
            },
            provider: "google",
          });

          return {
            error: error ? new Error(error.message) : null,
          };
        } catch (error) {
          return {
            error:
              error instanceof Error ? error : new Error("Failed to start the Google sign-in flow."),
          };
        }
      },
      signInWithMagicLink: async (email, redirectPath = "/", options) => {
        if (!client) {
          return {
            error: getConfigError(),
          };
        }

        try {
          const emailRedirectUrl = buildRedirectUrl(redirectPath);

          if (options?.admin) {
            if (!isAllowedAdminOrigin(window.location.origin)) {
              return {
                error: new Error("Admin sign-in is only allowed on approved origins."),
              };
            }

            if (!isAllowedAdminOrigin(emailRedirectUrl.origin)) {
              return {
                error: new Error("Admin sign-in redirects must stay on an approved origin."),
              };
            }
          }

          const { error } = await client.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: emailRedirectUrl.toString(),
              shouldCreateUser: options?.admin ? false : true,
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
      signInWithPassword: async (email, password) => {
        if (!client) {
          return {
            error: getConfigError(),
          };
        }

        try {
          const { error } = await client.auth.signInWithPassword({
            email,
            password,
          });

          return {
            error: error ? new Error(error.message) : null,
          };
        } catch (error) {
          return {
            error: error instanceof Error ? error : new Error("Failed to sign in."),
          };
        }
      },
      signOut: async () => {
        if (!client) {
          return { error: null };
        }

        try {
          const { error } = await client.auth.signOut();
          setAdminAssuranceLevel("aal1");
          setAdminMembership(null);
          setAdminCheckError(null);
          clearPasswordRecovery();

          return {
            error: error ? new Error(error.message) : null,
          };
        } catch (error) {
          return {
            error: error instanceof Error ? error : new Error("Failed to sign out."),
          };
        }
      },
      signUpWithPassword: async (email, password, redirectPath = "/reminders") => {
        if (!client) {
          return {
            error: getConfigError(),
            needsEmailConfirmation: false,
          };
        }

        try {
          const emailRedirectUrl = buildRedirectUrl(redirectPath);
          const { data, error } = await client.auth.signUp({
            email,
            options: {
              emailRedirectTo: emailRedirectUrl.toString(),
            },
            password,
          });

          return {
            error: error ? new Error(error.message) : null,
            needsEmailConfirmation: !data.session,
          };
        } catch (error) {
          return {
            error: error instanceof Error ? error : new Error("Failed to create your account."),
            needsEmailConfirmation: false,
          };
        }
      },
      updatePassword: async (password) => {
        if (!client) {
          return {
            error: getConfigError(),
          };
        }

        try {
          const { error } = await client.auth.updateUser({ password });

          if (!error) {
            clearPasswordRecovery();
            await reloadSession();
          }

          return {
            error: error ? new Error(error.message) : null,
          };
        } catch (error) {
          return {
            error: error instanceof Error ? error : new Error("Failed to update your password."),
          };
        }
      },
      user: session?.user ?? null,
    }),
    [
      adminAssuranceLevel,
      adminCheckError,
      adminMembership,
      adminPermissions,
      clearPasswordRecovery,
      client,
      isAdminLoading,
      isAuthLoading,
      isPasswordRecovery,
      reloadSession,
      session,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
