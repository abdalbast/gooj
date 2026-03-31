import type { ReminderRecord } from "@/lib/supabaseData";

export const REMINDER_OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Mother's Day",
  "Valentine's Day",
  "Christmas",
  "Just Because",
  "Other",
];

export const parseStoredReminderDate = (value: string) => new Date(`${value}T00:00:00`);

export const sortRemindersByUpcomingDate = (reminders: ReminderRecord[]) => {
  const now = new Date();
  const getNextOccurrence = (dateValue: string) => {
    const nextDate = parseStoredReminderDate(dateValue);
    nextDate.setFullYear(now.getFullYear());

    if (nextDate < now) {
      nextDate.setFullYear(now.getFullYear() + 1);
    }

    return nextDate.getTime();
  };

  return [...reminders].sort((left, right) => {
    return getNextOccurrence(left.date) - getNextOccurrence(right.date);
  });
};
