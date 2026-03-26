import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Gift, Pencil, Plus, Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import EmailAuthCard from "@/components/auth/EmailAuthCard";
import SupabaseSetupCard from "@/components/auth/SupabaseSetupCard";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  deleteReminder,
  getSupabaseErrorMessage,
  listReminders,
  saveReminder,
  type ReminderRecord,
} from "@/lib/supabaseData";

const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Mother's Day",
  "Valentine's Day",
  "Christmas",
  "Just Because",
  "Other",
];

const parseStoredDate = (value: string) => new Date(`${value}T00:00:00`);

const DateReminders = () => {
  const { hash } = useLocation();
  const { toast } = useToast();
  const { hasConfig, isAuthLoading, signOut, user } = useAuth();
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date>();
  const [occasion, setOccasion] = useState("");
  const [notes, setNotes] = useState("");
  const [pageError, setPageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (hash === "#add-date" && user) {
      setIsAdding(true);
    }
  }, [hash, user]);

  useEffect(() => {
    if (!user) {
      setReminders([]);
      setPageError(null);
      return;
    }

    let active = true;
    setIsLoading(true);
    setPageError(null);

    void listReminders(user.id)
      .then((data) => {
        if (!active) {
          return;
        }

        setReminders(data);
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setPageError(getSupabaseErrorMessage(error, "Could not load your reminders."));
      })
      .finally(() => {
        if (!active) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const resetForm = () => {
    setName("");
    setDate(undefined);
    setOccasion("");
    setNotes("");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!user || !name.trim() || !date || !occasion) {
      return;
    }

    setSaving(true);
    setPageError(null);

    try {
      const savedReminder = await saveReminder(user.id, {
        date: format(date, "yyyy-MM-dd"),
        id: editingId ?? undefined,
        name,
        notes,
        occasion,
      });

      setReminders((current) => {
        if (editingId) {
          return current.map((reminder) => (reminder.id === editingId ? savedReminder : reminder));
        }

        return [savedReminder, ...current];
      });

      toast({
        description: `${savedReminder.name}'s ${savedReminder.occasion.toLowerCase()} reminder is saved in Supabase.`,
        title: editingId ? "Reminder updated" : "Reminder created",
      });

      resetForm();
    } catch (error) {
      const message = getSupabaseErrorMessage(error, "Could not save the reminder.");
      setPageError(message);
      toast({
        description: message,
        title: "Save failed",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (reminder: ReminderRecord) => {
    setName(reminder.name);
    setDate(parseStoredDate(reminder.date));
    setOccasion(reminder.occasion);
    setNotes(reminder.notes);
    setEditingId(reminder.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) {
      return;
    }

    setDeletingId(id);
    setPageError(null);

    try {
      await deleteReminder(user.id, id);
      setReminders((current) => current.filter((reminder) => reminder.id !== id));
      toast({
        description: "The reminder has been removed from Supabase.",
        title: "Reminder deleted",
      });
    } catch (error) {
      const message = getSupabaseErrorMessage(error, "Could not delete the reminder.");
      setPageError(message);
      toast({
        description: message,
        title: "Delete failed",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();

    if (error) {
      toast({
        description: error.message,
        title: "Could not sign out",
        variant: "destructive",
      });
      return;
    }

    resetForm();
  };

  const sortedReminders = [...reminders].sort((left, right) => {
    const now = new Date();
    const getNextOccurrence = (dateValue: string) => {
      const nextDate = parseStoredDate(dateValue);
      nextDate.setFullYear(now.getFullYear());

      if (nextDate < now) {
        nextDate.setFullYear(now.getFullYear() + 1);
      }

      return nextDate.getTime();
    };

    return getNextOccurrence(left.date) - getNextOccurrence(right.date);
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-light text-foreground mb-2">Date Reminders</h1>
              <p className="text-muted-foreground font-light">
                Never forget an important date again. Reminders are now stored in Supabase and tied to your account.
              </p>
            </div>
            {user && (
              <div className="space-y-2 text-left sm:text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Signed in</p>
                <p className="text-sm font-light text-foreground">{user.email}</p>
                <Button className="rounded-none" onClick={handleSignOut} size="sm" variant="outline">
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </div>

        {!hasConfig && (
          <SupabaseSetupCard
            body="This page now reads and writes reminders through Supabase. Add the frontend Supabase variables locally and in Vercel before using it."
            title="Supabase Configuration Required"
          />
        )}

        {hasConfig && isAuthLoading && (
          <div className="border border-border p-6 text-sm font-light text-muted-foreground">
            Checking your Supabase session...
          </div>
        )}

        {hasConfig && !isAuthLoading && !user && (
          <EmailAuthCard
            body="Sign in with your email to load and manage your reminders. We use a Supabase magic link so there is no password flow in the app."
            redirectPath="/reminders#add-date"
            submitLabel="Email me a sign-in link"
            title="Sign In To Save Reminders"
          />
        )}

        {hasConfig && !isAuthLoading && user && (
          <>
            {pageError && (
              <Alert className="mb-8" variant="destructive">
                <AlertTitle>Supabase request failed</AlertTitle>
                <AlertDescription>{pageError}</AlertDescription>
              </Alert>
            )}

            <section className="scroll-mt-24" id="add-date">
              {!isAdding && (
                <Button
                  className="mb-8 rounded-none bg-foreground text-background hover:bg-foreground/90"
                  onClick={() => setIsAdding(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add a Date
                </Button>
              )}

              {isAdding && (
                <div className="border border-border p-6 mb-8 space-y-4">
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
                      onChange={(event) => setName(event.target.value)}
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
                          onSelect={setDate}
                          selected={date}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-light text-foreground" htmlFor="reminder-occasion">
                      Occasion
                    </label>
                    <Select onValueChange={setOccasion} value={occasion}>
                      <SelectTrigger className="rounded-none min-h-11" id="reminder-occasion">
                        <SelectValue placeholder="Select occasion" />
                      </SelectTrigger>
                      <SelectContent>
                        {OCCASIONS.map((item) => (
                          <SelectItem key={item} value={item}>
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
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="e.g. She likes candles and chocolate"
                      value={notes}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="rounded-none bg-foreground text-background hover:bg-foreground/90 min-h-11"
                      disabled={saving}
                      onClick={handleSave}
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button className="rounded-none min-h-11" onClick={resetForm} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </section>

            {isLoading ? (
              <div className="border border-border p-6 text-sm font-light text-muted-foreground">
                Loading reminders from Supabase...
              </div>
            ) : sortedReminders.length === 0 && !isAdding ? (
              <div className="text-center py-16 space-y-4">
                <Gift className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                <p className="text-muted-foreground font-light">
                  No dates saved yet. Add your first reminder to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedReminders.map((reminder) => {
                  const reminderDate = parseStoredDate(reminder.date);

                  return (
                    <div
                      className="border border-border p-4 flex items-center justify-between group"
                      key={reminder.id}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-medium text-foreground">{reminder.name}</h3>
                          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5">
                            {reminder.occasion}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-light mt-1">
                          {format(reminderDate, "d MMMM")}
                        </p>
                        {reminder.notes && (
                          <p className="text-xs text-muted-foreground/70 mt-1 truncate">{reminder.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                        <Button
                          aria-label={`Edit reminder for ${reminder.name}`}
                          className="h-11 w-11 p-0 md:h-8 md:w-8"
                          onClick={() => handleEdit(reminder)}
                          size="sm"
                          variant="ghost"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          aria-label={`Delete reminder for ${reminder.name}`}
                          className="h-11 w-11 p-0 text-destructive md:h-8 md:w-8"
                          disabled={deletingId === reminder.id}
                          onClick={() => handleDelete(reminder.id)}
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
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DateReminders;
