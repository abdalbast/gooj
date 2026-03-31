import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminFieldError } from "@/components/admin/AdminFieldError";
import { AdminPageAlert } from "@/components/admin/AdminPageAlert";
import { AdminPageLoadingState } from "@/components/admin/AdminPageLoadingState";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAdminEntityDialog } from "@/hooks/use-admin-entity-dialog";
import {
  getSupabaseErrorMessage,
  listAdminContentBlocks,
  updateAdminContentBlock,
  type AdminContentBlockRecord,
} from "@/lib/supabaseData";

const createDefaultForm = () => ({
  body: "",
  title: "",
});

const toContentForm = (block: AdminContentBlockRecord) => ({
  body: block.body,
  title: block.title,
});

const AdminContent = () => {
  const { toast } = useToast();
  const [content, setContent] = useState<AdminContentBlockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const {
    closeDialog,
    dialogOpen,
    editingRecord: editing,
    errors,
    form,
    handleDialogOpenChange,
    openEditDialog,
    setErrors,
    setForm,
  } = useAdminEntityDialog<AdminContentBlockRecord, { body: string; title: string }>({
    createDefaultForm,
    toForm: toContentForm,
  });

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

  const updateFormField = (field: "body" | "title", value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
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
      closeDialog();
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

      {pageError ? <AdminPageAlert title="Content query failed">{pageError}</AdminPageAlert> : null}

      {loading ? (
        <AdminPageLoadingState message="Loading content blocks from Supabase..." />
      ) : (
        <div className="space-y-4">
          {content.map((block) => (
            <div className="border border-border p-5 space-y-2" key={block.id}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5">
                  {block.section}
                </span>
                <Button
                  className="h-8 w-8 p-0"
                  onClick={() => openEditDialog(block)}
                  size="sm"
                  variant="ghost"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
              <h2 className="text-sm font-medium text-foreground">{block.title}</h2>
              <p className="text-sm font-light text-muted-foreground">{block.body}</p>
            </div>
          ))}
          {content.length === 0 ? (
            <AdminEmptyState message="No content blocks found in Supabase." />
          ) : null}
        </div>
      )}

      <Dialog onOpenChange={handleDialogOpenChange} open={dialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-light">Edit {editing?.section}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Input
                className="rounded-none"
                onChange={(event) => updateFormField("title", event.target.value)}
                placeholder="Title *"
                value={form.title}
              />
              <AdminFieldError message={errors.title} />
            </div>
            <div>
              <Textarea
                className="rounded-none min-h-[120px]"
                onChange={(event) => updateFormField("body", event.target.value)}
                placeholder="Body text *"
                value={form.body}
              />
              <AdminFieldError message={errors.body} />
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
