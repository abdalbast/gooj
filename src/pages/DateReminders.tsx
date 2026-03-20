import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Pencil, Trash2, Gift } from "lucide-react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Reminder {
  id: string;
  name: string;
  date: string;
  occasion: string;
  notes: string;
}

const OCCASIONS = ["Birthday", "Anniversary", "Mother's Day", "Valentine's Day", "Christmas", "Just Because", "Other"];

const DateReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date>();
  const [occasion, setOccasion] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("gooj-reminders");
    if (saved) setReminders(JSON.parse(saved));
  }, []);

  const saveReminders = (updated: Reminder[]) => {
    setReminders(updated);
    localStorage.setItem("gooj-reminders", JSON.stringify(updated));
  };

  const resetForm = () => {
    setName(""); setDate(undefined); setOccasion(""); setNotes("");
    setIsAdding(false); setEditingId(null);
  };

  const handleSave = () => {
    if (!name || !date || !occasion) return;
    const reminder: Reminder = {
      id: editingId || Date.now().toString(),
      name, date: date.toISOString(), occasion, notes
    };
    if (editingId) {
      saveReminders(reminders.map(r => r.id === editingId ? reminder : r));
    } else {
      saveReminders([...reminders, reminder]);
    }
    resetForm();
  };

  const handleEdit = (r: Reminder) => {
    setName(r.name); setDate(new Date(r.date)); setOccasion(r.occasion); setNotes(r.notes);
    setEditingId(r.id); setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    saveReminders(reminders.filter(r => r.id !== id));
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    const now = new Date();
    const getNextOccurrence = (dateStr: string) => {
      const d = new Date(dateStr);
      d.setFullYear(now.getFullYear());
      if (d < now) d.setFullYear(now.getFullYear() + 1);
      return d.getTime();
    };
    return getNextOccurrence(a.date) - getNextOccurrence(b.date);
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-light text-foreground mb-2">Date Reminders</h1>
          <p className="text-muted-foreground font-light">
            Never forget an important date again. Save birthdays, anniversaries, and other occasions — we'll remind you when it's time to Gooj it.
          </p>
        </div>

        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="mb-8 rounded-none bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4 mr-2" /> Add a Date
          </Button>
        )}

        {isAdding && (
          <div className="border border-border p-6 mb-8 space-y-4">
            <h3 className="text-lg font-light text-foreground">{editingId ? "Edit Reminder" : "New Reminder"}</h3>
            <div className="space-y-2">
              <label className="text-sm font-light text-foreground">Recipient Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah" className="rounded-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-light text-foreground">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-none", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-light text-foreground">Occasion</label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger className="rounded-none"><SelectValue placeholder="Select occasion" /></SelectTrigger>
                <SelectContent>
                  {OCCASIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-light text-foreground">Notes (optional)</label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. She likes candles and chocolate" className="rounded-none" />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} className="rounded-none bg-foreground text-background hover:bg-foreground/90">Save</Button>
              <Button variant="outline" onClick={resetForm} className="rounded-none">Cancel</Button>
            </div>
          </div>
        )}

        {sortedReminders.length === 0 && !isAdding ? (
          <div className="text-center py-16 space-y-4">
            <Gift className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground font-light">No dates saved yet. Add your first reminder to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedReminders.map(r => {
              const d = new Date(r.date);
              return (
                <div key={r.id} className="border border-border p-4 flex items-center justify-between group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-medium text-foreground">{r.name}</h4>
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5">{r.occasion}</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-light mt-1">{format(d, "d MMMM")}</p>
                    {r.notes && <p className="text-xs text-muted-foreground/70 mt-1 truncate">{r.notes}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(r)} className="h-8 w-8 p-0">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)} className="h-8 w-8 p-0 text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DateReminders;
