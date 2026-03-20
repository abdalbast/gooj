import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ContentBlock {
  id: string;
  section: string;
  title: string;
  body: string;
}

const initialContent: ContentBlock[] = [
  { id: "1", section: "Hero", title: "Gooj It!", body: "Thoughtful Made Easy. Curated gift boxes for every occasion." },
  { id: "2", section: "About Section", title: "Born From a Simple Idea", body: "Men want to give thoughtful gifts but don't always know where to start. GOOJ takes the guesswork out of gifting." },
  { id: "3", section: "Feature 1", title: "Curated with Care", body: "Every box is hand-selected to balance keepsake items with luxurious consumables." },
  { id: "4", section: "Feature 2", title: "The Unboxing Experience", body: "Premium packaging that makes the moment of opening as special as the gift itself." },
  { id: "5", section: "CTA", title: "Never Miss a Moment", body: "Set up date reminders and we'll make sure you're always the thoughtful one." },
];

const AdminContent = () => {
  const [content, setContent] = useState<ContentBlock[]>(initialContent);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ContentBlock | null>(null);
  const [form, setForm] = useState({ title: "", body: "" });

  const openEdit = (c: ContentBlock) => {
    setEditing(c);
    setForm({ title: c.title, body: c.body });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    setContent(cs => cs.map(c => c.id === editing.id ? { ...c, title: form.title, body: form.body } : c));
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-light text-foreground">Content Management</h1>
      <p className="text-sm text-muted-foreground font-light">Edit homepage and marketing content. Changes will be reflected on the live site.</p>

      <div className="space-y-4">
        {content.map(c => (
          <div key={c.id} className="border border-border p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5">{c.section}</span>
              <Button variant="ghost" size="sm" onClick={() => openEdit(c)} className="h-8 w-8 p-0">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
            <h3 className="text-sm font-medium text-foreground">{c.title}</h3>
            <p className="text-sm font-light text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-light">Edit {editing?.section}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" className="rounded-none" />
            <Textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="Body text" className="rounded-none min-h-[120px]" />
            <Button onClick={handleSave} className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContent;
