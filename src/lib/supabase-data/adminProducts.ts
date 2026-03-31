import { getSupabaseClient } from "@/lib/supabase";
import { mapAdminProduct, toPence } from "./shared";
import type { AdminProductInput } from "./types";

export const listAdminProducts = async () => {
  const { data, error } = await getSupabaseClient()
    .from("admin_products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapAdminProduct);
};

export const saveAdminProduct = async (product: AdminProductInput, productId?: string) => {
  const client = getSupabaseClient();
  const payload = {
    category: product.category.trim(),
    description: product.description.trim(),
    is_active: true,
    name: product.name.trim(),
    price_pence: toPence(product.price),
  };

  const query = productId
    ? client.from("admin_products").update(payload).eq("id", productId).select("*").single()
    : client.from("admin_products").insert(payload).select("*").single();

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return mapAdminProduct(data);
};

export const deleteAdminProduct = async (productId: string) => {
  const { error } = await getSupabaseClient().from("admin_products").delete().eq("id", productId);

  if (error) {
    throw error;
  }
};
