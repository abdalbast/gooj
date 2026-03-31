import { getSupabaseClient } from "@/lib/supabase";
import { mapReminder } from "./shared";
import type { ReminderInput } from "./types";

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
