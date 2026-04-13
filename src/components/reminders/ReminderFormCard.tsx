import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  REMINDER_NAME_MAX_LENGTH,
  REMINDER_NOTES_MAX_LENGTH,
  REMINDER_OCCASION_MAX_LENGTH,
  REMINDER_OCCASIONS,
} from "@/lib/reminders";
import { cn } from "@/lib/utils";

interface ReminderFormCardProps {
  date: Date | undefined;
  editingId: string | null;
  isAdding: boolean;
  name: string;
  notes: string;
  occasion: string;
  onCancel: () => void;
  onDateChange: (date: Date | undefined) => void;
  onNameChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onOccasionChange: (occasion: string) => void;
  onSave: () => void;
  saving: boolean;
}

export const ReminderFormCard = ({
  date,
  editingId,
  isAdding,
  name,
  notes,
  occasion,
  onCancel,
  onDateChange,
  onNameChange,
  onNotesChange,
  onOccasionChange,
  onSave,
  saving,
}: ReminderFormCardProps) => {
  if (!isAdding) {
    return null;
  }

  return (
    <div className="mb-8 space-y-4 border border-border p-6">
      <h2 className="text-lg font-light text-foreground">
        {editingId ? "Edit Reminder" : "New Reminder"}
      </h2>
      <div className="space-y-2">
        <label className="text-sm font-light text-foreground" htmlFor="reminder-name">
          Recipient Name
        </label>
        <Input
          className="rounded-none"
          id="reminder-name"
          maxLength={REMINDER_NAME_MAX_LENGTH}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="e.g. Sarah"
          value={name}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-light text-foreground" htmlFor="reminder-date">
          Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className={cn(
                "w-full justify-start text-left font-normal rounded-none min-h-11",
                !date && "text-muted-foreground",
              )}
              id="reminder-date"
              variant="outline"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              className="p-3 pointer-events-auto"
              initialFocus
              mode="single"
              onSelect={onDateChange}
              selected={date}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-light text-foreground" htmlFor="reminder-occasion">
          Occasion
        </label>
        <Select onValueChange={onOccasionChange} value={occasion}>
          <SelectTrigger className="rounded-none min-h-11" id="reminder-occasion">
            <SelectValue placeholder="Select occasion" />
          </SelectTrigger>
          <SelectContent>
            {REMINDER_OCCASIONS.map((item) => (
              <SelectItem key={item} value={item.slice(0, REMINDER_OCCASION_MAX_LENGTH)}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-light text-foreground" htmlFor="reminder-notes">
          Notes (optional)
        </label>
        <Textarea
          className="rounded-none"
          id="reminder-notes"
          maxLength={REMINDER_NOTES_MAX_LENGTH}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="e.g. She likes candles and chocolate"
          value={notes}
        />
      </div>
      <div className="flex gap-3">
        <Button
          className="min-h-11 rounded-none bg-foreground text-background hover:bg-foreground/90"
          disabled={saving}
          onClick={onSave}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button className="min-h-11 rounded-none" onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  );
};
