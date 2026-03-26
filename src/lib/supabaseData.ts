import type { PostgrestError } from "@supabase/supabase-js";
import { formatGBP, parseGBPValue } from "./commerce";
import { getSupabaseClient } from "./supabase";
import type { Database } from "./supabase.types";

type ReminderRow = Database["public"]["Tables"]["reminders"]["Row"];
type AdminUserRow = Database["public"]["Tables"]["admin_users"]["Row"];
type AdminProductRow = Database["public"]["Tables"]["admin_products"]["Row"];
type AdminPromotionRow = Database["public"]["Tables"]["admin_promotions"]["Row"];
type AdminContentBlockRow = Database["public"]["Tables"]["admin_content_blocks"]["Row"];
type AdminOrderRow = Database["public"]["Tables"]["admin_orders"]["Row"];
type AdminCustomerRow = Database["public"]["Tables"]["admin_customers"]["Row"];

export interface ReminderRecord {
  createdAt: string;
  date: string;
  id: string;
  name: string;
  notes: string;
  occasion: string;
  updatedAt: string;
}

export interface ReminderInput {
  date: string;
  id?: string;
  name: string;
  notes: string;
  occasion: string;
}

export interface AdminProductRecord {
  active: boolean;
  category: string;
  createdAt: string;
  description: string;
  id: string;
  name: string;
  price: string;
  pricePence: number;
  updatedAt: string;
}

export interface AdminProductInput {
  category: string;
  description: string;
  name: string;
  price: string;
}

export interface AdminPromotionRecord {
  active: boolean;
  code: string;
  createdAt: string;
  discount: string;
  expiresAt: string;
  id: string;
  type: string;
  updatedAt: string;
}

export interface AdminPromotionInput {
  code: string;
  discount: string;
  expiresAt: string;
  type: string;
}

export interface AdminContentBlockRecord {
  body: string;
  createdAt: string;
  id: string;
  section: string;
  sortOrder: number;
  title: string;
  updatedAt: string;
}

export interface AdminOrderRecord {
  createdAt: string;
  customerEmail: string;
  customerId: string | null;
  customerName: string;
  id: string;
  items: string;
  orderDate: string;
  orderNumber: string;
  personalised: boolean;
  status: string;
  total: string;
  totalPence: number;
  updatedAt: string;
}

export interface AdminCustomerRecord {
  createdAt: string;
  dateJoined: string;
  email: string;
  fullName: string;
  id: string;
  lastOrderAt: string | null;
  ordersCount: number;
  totalSpent: string;
  totalSpentPence: number;
  updatedAt: string;
}

const toPence = (value: string) => Math.round(parseGBPValue(value) * 100);

const mapReminder = (row: ReminderRow): ReminderRecord => ({
  createdAt: row.created_at,
  date: row.reminder_date,
  id: row.id,
  name: row.recipient_name,
  notes: row.notes,
  occasion: row.occasion,
  updatedAt: row.updated_at,
});

const mapAdminProduct = (row: AdminProductRow): AdminProductRecord => ({
  active: row.is_active,
  category: row.category,
  createdAt: row.created_at,
  description: row.description,
  id: row.id,
  name: row.name,
  price: formatGBP(row.price_pence / 100),
  pricePence: row.price_pence,
  updatedAt: row.updated_at,
});

const mapAdminPromotion = (row: AdminPromotionRow): AdminPromotionRecord => ({
  active: row.active,
  code: row.code,
  createdAt: row.created_at,
  discount: row.discount_label,
  expiresAt: row.expires_at,
  id: row.id,
  type: row.promo_type,
  updatedAt: row.updated_at,
});

const mapAdminContentBlock = (row: AdminContentBlockRow): AdminContentBlockRecord => ({
  body: row.body,
  createdAt: row.created_at,
  id: row.id,
  section: row.section,
  sortOrder: row.sort_order,
  title: row.title,
  updatedAt: row.updated_at,
});

const mapAdminOrder = (row: AdminOrderRow): AdminOrderRecord => ({
  createdAt: row.created_at,
  customerEmail: row.customer_email,
  customerId: row.customer_id,
  customerName: row.customer_name,
  id: row.id,
  items: row.items,
  orderDate: row.order_date,
  orderNumber: row.order_number,
  personalised: row.personalised,
  status: row.status,
  total: formatGBP(row.total_pence / 100),
  totalPence: row.total_pence,
  updatedAt: row.updated_at,
});

const mapAdminCustomer = (row: AdminCustomerRow): AdminCustomerRecord => ({
  createdAt: row.created_at,
  dateJoined: row.date_joined,
  email: row.email,
  fullName: row.full_name,
  id: row.id,
  lastOrderAt: row.last_order_at,
  ordersCount: row.orders_count,
  totalSpent: formatGBP(row.total_spent_pence / 100),
  totalSpentPence: row.total_spent_pence,
  updatedAt: row.updated_at,
});

export const getSupabaseErrorMessage = (
  error: unknown,
  fallback = "Something went wrong while talking to Supabase.",
) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  const postgrestError = error as PostgrestError | null;
  if (postgrestError?.message) {
    return postgrestError.message;
  }

  return fallback;
};

export const isMissingSupabaseTableError = (error: unknown) => {
  const message = getSupabaseErrorMessage(error, "");
  return /relation .* does not exist/i.test(message);
};

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

export const listReminders = async (userId: string) => {
  const { data, error } = await getSupabaseClient()
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .order("reminder_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapReminder);
};

export const saveReminder = async (userId: string, reminder: ReminderInput) => {
  const client = getSupabaseClient();
  const payload = {
    notes: reminder.notes.trim(),
    occasion: reminder.occasion,
    recipient_name: reminder.name.trim(),
    reminder_date: reminder.date,
    user_id: userId,
  };

  const query = reminder.id
    ? client
        .from("reminders")
        .update(payload)
        .eq("id", reminder.id)
        .eq("user_id", userId)
        .select("*")
        .single()
    : client.from("reminders").insert(payload).select("*").single();

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return mapReminder(data);
};

export const deleteReminder = async (userId: string, reminderId: string) => {
  const { error } = await getSupabaseClient()
    .from("reminders")
    .delete()
    .eq("id", reminderId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
};

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

export const listAdminPromotions = async () => {
  const { data, error } = await getSupabaseClient()
    .from("admin_promotions")
    .select("*")
    .order("expires_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data.map(mapAdminPromotion);
};

export const saveAdminPromotion = async (
  promotion: AdminPromotionInput,
  promotionId?: string,
) => {
  const client = getSupabaseClient();
  const payload = {
    code: promotion.code.trim().toUpperCase(),
    discount_label: promotion.discount.trim(),
    expires_at: promotion.expiresAt,
    promo_type: promotion.type.trim(),
  };

  const query = promotionId
    ? client.from("admin_promotions").update(payload).eq("id", promotionId).select("*").single()
    : client
        .from("admin_promotions")
        .insert({
          ...payload,
          active: true,
        })
        .select("*")
        .single();

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return mapAdminPromotion(data);
};

export const setAdminPromotionActive = async (promotionId: string, active: boolean) => {
  const { data, error } = await getSupabaseClient()
    .from("admin_promotions")
    .update({ active })
    .eq("id", promotionId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapAdminPromotion(data);
};

export const deleteAdminPromotion = async (promotionId: string) => {
  const { error } = await getSupabaseClient()
    .from("admin_promotions")
    .delete()
    .eq("id", promotionId);

  if (error) {
    throw error;
  }
};

export const listAdminContentBlocks = async () => {
  const { data, error } = await getSupabaseClient()
    .from("admin_content_blocks")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data.map(mapAdminContentBlock);
};

export const updateAdminContentBlock = async (
  blockId: string,
  block: Pick<AdminContentBlockRecord, "body" | "title">,
) => {
  const { data, error } = await getSupabaseClient()
    .from("admin_content_blocks")
    .update({
      body: block.body.trim(),
      title: block.title.trim(),
    })
    .eq("id", blockId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapAdminContentBlock(data);
};

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
