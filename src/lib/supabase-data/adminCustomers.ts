import { getSupabaseClient } from "@/lib/supabase";
import { mapAdminCustomer } from "./shared";

export const listAdminCustomers = async () => {
  const { data, error } = await getSupabaseClient()
    .from("admin_customers")
    .select("*")
    .order("last_order_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapAdminCustomer);
};
