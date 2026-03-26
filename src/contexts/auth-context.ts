import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export interface AdminMembership {
  active: boolean;
  email: string;
  fullName: string | null;
  role: string;
  userId: string;
}

export interface AuthContextValue {
  adminCheckError: string | null;
  adminMembership: AdminMembership | null;
  hasConfig: boolean;
  isAdmin: boolean;
  isAdminLoading: boolean;
  isAuthLoading: boolean;
  session: Session | null;
  signInWithMagicLink: (email: string, redirectPath?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  user: User | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
