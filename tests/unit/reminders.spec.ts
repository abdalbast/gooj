import { afterEach, describe, expect, it, vi } from "vitest";
import { sortRemindersByUpcomingDate } from "@/lib/reminders";
import type { ReminderRecord } from "@/lib/supabaseData";

const createReminder = (id: string, date: string): ReminderRecord => ({
  createdAt: "2026-01-01T00:00:00.000Z",
  date,
  id,
  name: id,
  notes: "",
  occasion: "Birthday",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("sortRemindersByUpcomingDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("sorts reminders by their next occurrence in the current year", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-31T12:00:00.000Z"));

    const reminders = sortRemindersByUpcomingDate([
      createReminder("late", "2026-10-12"),
      createReminder("soon", "2026-04-02"),
      createReminder("middle", "2026-06-01"),
    ]);

    expect(reminders.map((reminder) => reminder.id)).toEqual(["soon", "middle", "late"]);
  });

  it("rolls past dates into the next year before sorting", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-30T12:00:00.000Z"));

    const reminders = sortRemindersByUpcomingDate([
      createReminder("january", "2026-01-05"),
      createReminder("new-year-eve", "2026-12-31"),
      createReminder("valentine", "2026-02-14"),
    ]);

    expect(reminders.map((reminder) => reminder.id)).toEqual([
      "new-year-eve",
      "january",
      "valentine",
    ]);
  });
});
