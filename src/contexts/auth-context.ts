import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { AdminPermissions } from "@/lib/adminAccess";

export interface AdminMembership {
  active: boolean;
  email: string;
  fullName: string | null;
  role: string;
  userId: string;
}

export interface AuthContextValue {
  adminAssuranceLevel: "aal1" | "aal2";
  adminCheckError: string | null;
  adminMembership: AdminMembership | null;
  adminPermissions: AdminPermissions;
  clearPasswordRecovery: () => void;
  hasConfig: boolean;
  isAdmin: boolean;
  isAdminLoading: boolean;
  isAdminMfaVerified: boolean;
  isAuthLoading: boolean;
  isPasswordRecovery: boolean;
  requestPasswordReset: (email: string, redirectPath?: string) => Promise<{ error: Error | null }>;
  reloadSession: () => Promise<void>;
  session: Session | null;
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: Error | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithMagicLink: (
    email: string,
    redirectPath?: string,
    options?: { admin?: boolean },
  ) => Promise<{ error: Error | null }>;
  signUpWithPassword: (
    email: string,
    password: string,
    redirectPath?: string,
  ) => Promise<{ error: Error | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  user: User | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
