import { format } from "date-fns";
import { Gift, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseStoredReminderDate } from "@/lib/reminders";
import type { ReminderRecord } from "@/lib/supabaseData";

interface ReminderListProps {
  deletingId: string | null;
  isAdding: boolean;
  isLoading: boolean;
  onDelete: (id: string) => void;
  onEdit: (reminder: ReminderRecord) => void;
  reminders: ReminderRecord[];
}

export const ReminderList = ({
  deletingId,
  isAdding,
  isLoading,
  onDelete,
  onEdit,
  reminders,
}: ReminderListProps) => {
  if (isLoading) {
    return (
      <div className="border border-border p-6 text-sm font-light text-muted-foreground">
        Loading reminders from Supabase...
      </div>
    );
  }

  if (reminders.length === 0 && !isAdding) {
    return (
      <div className="space-y-4 py-16 text-center">
        <Gift className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <p className="font-light text-muted-foreground">
          No dates saved yet. Add your first reminder to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => {
        const reminderDate = parseStoredReminderDate(reminder.date);

        return (
          <div
            className="group flex items-center justify-between border border-border p-4"
            key={reminder.id}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-foreground">{reminder.name}</h3>
                <span className="bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                  {reminder.occasion}
                </span>
              </div>
              <p className="mt-1 text-sm font-light text-muted-foreground">
                {format(reminderDate, "d MMMM")}
              </p>
              {reminder.notes ? (
                <p className="mt-1 truncate text-xs text-muted-foreground/70">{reminder.notes}</p>
              ) : null}
            </div>
            <div className="flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
              <Button
                aria-label={`Edit reminder for ${reminder.name}`}
                className="h-11 w-11 p-0 md:h-8 md:w-8"
                onClick={() => onEdit(reminder)}
                size="sm"
                variant="ghost"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                aria-label={`Delete reminder for ${reminder.name}`}
                className="h-11 w-11 p-0 text-destructive md:h-8 md:w-8"
                disabled={deletingId === reminder.id}
                onClick={() => onDelete(reminder.id)}
                size="sm"
                variant="ghost"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
