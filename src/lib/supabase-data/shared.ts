import type { PostgrestError } from "@supabase/supabase-js";
import { formatGBP, parseGBPValue } from "@/lib/commerce";
import type {
  AdminContentBlockRecord,
  AdminCustomerRecord,
  AdminOrderRecord,
  AdminProductRecord,
  AdminPromotionRecord,
  ReminderRecord,
} from "./types";
import type { Database } from "@/lib/supabase.types";

type ReminderRow = Database["public"]["Tables"]["reminders"]["Row"];
type AdminUserRow = Database["public"]["Tables"]["admin_users"]["Row"];
type AdminProductRow = Database["public"]["Tables"]["admin_products"]["Row"];
type AdminPromotionRow = Database["public"]["Tables"]["admin_promotions"]["Row"];
type AdminContentBlockRow = Database["public"]["Tables"]["admin_content_blocks"]["Row"];
type AdminOrderRow = Database["public"]["Tables"]["admin_orders"]["Row"];
type AdminCustomerRow = Database["public"]["Tables"]["admin_customers"]["Row"];

export type { AdminUserRow };

export const toPence = (value: string) => Math.round(parseGBPValue(value) * 100);

export const mapReminder = (row: ReminderRow): ReminderRecord => ({
  createdAt: row.created_at,
  date: row.reminder_date,
  id: row.id,
  name: row.recipient_name,
  notes: row.notes,
  occasion: row.occasion,
  updatedAt: row.updated_at,
});

export const mapAdminProduct = (row: AdminProductRow): AdminProductRecord => ({
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

export const mapAdminPromotion = (row: AdminPromotionRow): AdminPromotionRecord => ({
  active: row.active,
  code: row.code,
  createdAt: row.created_at,
  discount: row.discount_label,
  expiresAt: row.expires_at,
  id: row.id,
  type: row.promo_type,
  updatedAt: row.updated_at,
});

export const mapAdminContentBlock = (
  row: AdminContentBlockRow,
): AdminContentBlockRecord => ({
  body: row.body,
  createdAt: row.created_at,
  id: row.id,
  section: row.section,
  sortOrder: row.sort_order,
  title: row.title,
  updatedAt: row.updated_at,
});

export const mapAdminOrder = (row: AdminOrderRow): AdminOrderRecord => ({
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

export const mapAdminCustomer = (row: AdminCustomerRow): AdminCustomerRecord => ({
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
