import { getSupabaseClient } from "@/lib/supabase";
import type { AdminUserRow } from "./shared";

export const getAdminMembership = async (userId: string) => {
  const { data, error } = await getSupabaseClient()
    .from("admin_users")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data satisfies AdminUserRow | null;
};
