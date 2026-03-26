import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  getSupabaseErrorMessage,
  listAdminContentBlocks,
  updateAdminContentBlock,
  type AdminContentBlockRecord,
} from "@/lib/supabaseData";

const AdminContent = () => {
  const { toast } = useToast();
  const [content, setContent] = useState<AdminContentBlockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminContentBlockRecord | null>(null);
  const [form, setForm] = useState({ body: "", title: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPageError(null);

    void listAdminContentBlocks()
      .then((rows) => {
        if (!active) {
          return;
        }

        setContent(rows);
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setPageError(getSupabaseErrorMessage(error, "Could not load content blocks."));
      })
      .finally(() => {
        if (!active) {
          return;
        }

        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const openEdit = (block: AdminContentBlockRecord) => {
    setEditing(block);
    setForm({ body: block.body, title: block.title });
    setErrors({});
    setDialogOpen(true);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required";
    }

    if (!form.body.trim()) {
      nextErrors.body = "Body text is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!editing || !validate()) {
      return;
    }

    setSaving(true);
    setPageError(null);

    try {
      const savedBlock = await updateAdminContentBlock(editing.id, form);
      setContent((current) =>
        current.map((block) => (block.id === editing.id ? savedBlock : block)),
      );
      toast({
        description: `${savedBlock.section} has been synced to Supabase.`,
        title: "Content updated",
      });
      setDialogOpen(false);
      setEditing(null);
    } catch (error) {
      const message = getSupabaseErrorMessage(error, "Could not save the content block.");
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-light text-foreground">Content Management</h1>
        <p className="text-sm text-muted-foreground font-light">
          Edit homepage and marketing copy stored in Supabase.
        </p>
      </div>

      {pageError && (
        <Alert variant="destructive">
          <AlertTitle>Content query failed</AlertTitle>
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="border border-border p-6 text-sm font-light text-muted-foreground">
          Loading content blocks from Supabase...
        </div>
      ) : (
        <div className="space-y-4">
          {content.map((block) => (
            <div className="border border-border p-5 space-y-2" key={block.id}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5">
                  {block.section}
                </span>
                <Button className="h-8 w-8 p-0" onClick={() => openEdit(block)} size="sm" variant="ghost">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
              <h2 className="text-sm font-medium text-foreground">{block.title}</h2>
              <p className="text-sm font-light text-muted-foreground">{block.body}</p>
            </div>
          ))}
          {content.length === 0 && (
            <div className="border border-border p-6 text-sm text-muted-foreground">
              No content blocks found in Supabase.
            </div>
          )}
        </div>
      )}

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-light">Edit {editing?.section}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Input
                className="rounded-none"
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Title *"
                value={form.title}
              />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
            </div>
            <div>
              <Textarea
                className="rounded-none min-h-[120px]"
                onChange={(event) => setForm({ ...form, body: event.target.value })}
                placeholder="Body text *"
                value={form.body}
              />
              {errors.body && <p className="text-xs text-destructive mt-1">{errors.body}</p>}
            </div>
            <Button
              className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContent;
