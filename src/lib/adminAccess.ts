import type { Session } from "@supabase/supabase-js";

export const ADMIN_ROLES = [
  "admin",
  "catalog_manager",
  "content_manager",
  "support_viewer",
] as const;

export type AdminRole = typeof ADMIN_ROLES[number];

export type AdminPermission =
  | "dashboard"
  | "products"
  | "promotions"
  | "content"
  | "orders"
  | "customers";

export type AdminPermissions = Record<AdminPermission, boolean>;

export const ALLOWED_ADMIN_ORIGINS = new Set([
  "https://gooj.vercel.app",
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
]);

const noPermissions: AdminPermissions = {
  content: false,
  customers: false,
  dashboard: false,
  orders: false,
  products: false,
  promotions: false,
};

const rolePermissions: Record<AdminRole, AdminPermissions> = {
  admin: {
    content: true,
    customers: true,
    dashboard: true,
    orders: true,
    products: true,
    promotions: true,
  },
  catalog_manager: {
    content: false,
    customers: false,
    dashboard: false,
    orders: false,
    products: true,
    promotions: true,
  },
  content_manager: {
    content: true,
    customers: false,
    dashboard: false,
    orders: false,
    products: false,
    promotions: false,
  },
  support_viewer: {
    content: false,
    customers: true,
    dashboard: false,
    orders: true,
    products: false,
    promotions: false,
  },
};

export const isKnownAdminRole = (role: string | null | undefined): role is AdminRole => {
  return ADMIN_ROLES.includes(role as AdminRole);
};

export const getAdminPermissions = (role: string | null | undefined): AdminPermissions => {
  if (!isKnownAdminRole(role)) {
    return noPermissions;
  }

  return rolePermissions[role];
};

export const hasAnyAdminPermission = (permissions: AdminPermissions) => {
  return Object.values(permissions).some(Boolean);
};

export const isAllowedAdminOrigin = (origin: string) => {
  return ALLOWED_ADMIN_ORIGINS.has(origin);
};

export const isAdminMfaVerified = (session: Session | null) => {
  return getAuthenticatorAssuranceLevel(session) === "aal2";
};

export const getAuthenticatorAssuranceLevel = (session: Session | null) => {
  const rawLevel = session?.user?.aal;
  return rawLevel === "aal2" ? "aal2" : "aal1";
};
