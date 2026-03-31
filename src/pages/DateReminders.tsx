import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useLocation } from "react-router-dom";
import CustomerAuthPanel from "@/components/auth/CustomerAuthPanel";
import SupabaseSetupCard from "@/components/auth/SupabaseSetupCard";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import { ReminderFormCard } from "@/components/reminders/ReminderFormCard";
import { ReminderList } from "@/components/reminders/ReminderList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";
import { useToast } from "@/hooks/use-toast";
import { parseStoredReminderDate, sortRemindersByUpcomingDate } from "@/lib/reminders";
import { cn } from "@/lib/utils";
import {
  deleteReminder,
  getSupabaseErrorMessage,
  listReminders,
  saveReminder,
  type ReminderRecord,
} from "@/lib/supabaseData";

const DateReminders = () => {
  const { hash, search } = useLocation();
  const { toast } = useToast();
  const { hasConfig, isAuthLoading, isPasswordRecovery, signOut, user } = useAuth();
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
  const intent = new URLSearchParams(search).get("intent");

  useEffect(() => {
    if ((hash === "#add-date" || intent === "add-date") && user && !isPasswordRecovery) {
      setIsAdding(true);
    }
  }, [hash, intent, isPasswordRecovery, user]);

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
    setDate(parseStoredReminderDate(reminder.date));
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

  const sortedReminders = sortRemindersByUpcomingDate(reminders);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main
        className={cn(
          "mx-auto px-6 py-12",
          user && !isPasswordRecovery ? "max-w-2xl" : "max-w-6xl",
        )}
      >
        <div className="mb-10 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-light text-foreground mb-2">Date Reminders</h1>
              <p className="text-muted-foreground font-light">
                Keep birthdays, anniversaries, and key gifting dates attached to your GOOJ account.
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

        {hasConfig && !isAuthLoading && (!user || isPasswordRecovery) && (
          <CustomerAuthPanel redirectPath="/reminders?intent=add-date" />
        )}

        {hasConfig && !isAuthLoading && user && !isPasswordRecovery && (
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

              <ReminderFormCard
                date={date}
                editingId={editingId}
                isAdding={isAdding}
                name={name}
                notes={notes}
                occasion={occasion}
                onCancel={resetForm}
                onDateChange={setDate}
                onNameChange={setName}
                onNotesChange={setNotes}
                onOccasionChange={setOccasion}
                onSave={() => void handleSave()}
                saving={saving}
              />
            </section>

            <ReminderList
              deletingId={deletingId}
              isAdding={isAdding}
              isLoading={isLoading}
              onDelete={(reminderId) => void handleDelete(reminderId)}
              onEdit={handleEdit}
              reminders={sortedReminders}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DateReminders;
