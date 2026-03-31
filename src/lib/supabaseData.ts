export type {
  AdminContentBlockRecord,
  AdminCustomerRecord,
  AdminOrderRecord,
  AdminProductInput,
  AdminProductRecord,
  AdminPromotionInput,
  AdminPromotionRecord,
  ReminderInput,
  ReminderRecord,
} from "./supabase-data/types";
export { getAdminMembership } from "./supabase-data/auth";
export { listReminders, saveReminder, deleteReminder } from "./supabase-data/reminders";
export {
  listAdminProducts,
  saveAdminProduct,
  deleteAdminProduct,
} from "./supabase-data/adminProducts";
export {
  listAdminPromotions,
  saveAdminPromotion,
  setAdminPromotionActive,
  deleteAdminPromotion,
} from "./supabase-data/adminPromotions";
export {
  listAdminContentBlocks,
  updateAdminContentBlock,
} from "./supabase-data/adminContent";
export { listAdminOrders } from "./supabase-data/adminOrders";
export { listAdminCustomers } from "./supabase-data/adminCustomers";
export {
  getSupabaseErrorMessage,
  isMissingSupabaseTableError,
} from "./supabase-data/shared";
