import { getSupabaseClient } from "@/lib/supabase";
import { mapAdminOrder } from "./shared";

export const listAdminOrders = async () => {
  const { data, error } = await getSupabaseClient()
    .from("admin_orders")
    .select("*")
    .order("order_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapAdminOrder);
};
