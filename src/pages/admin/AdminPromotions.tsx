import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  deleteAdminPromotion,
  getSupabaseErrorMessage,
  listAdminPromotions,
  saveAdminPromotion,
  setAdminPromotionActive,
  type AdminPromotionRecord,
} from "@/lib/supabaseData";

const defaultForm = {
  code: "",
  discount: "",
  expiresAt: "",
  type: "Percentage",
};

const AdminPromotions = () => {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<AdminPromotionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<AdminPromotionRecord | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPageError(null);

    void listAdminPromotions()
      .then((rows) => {
        if (!active) {
          return;
        }

        setPromotions(rows);
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setPageError(getSupabaseErrorMessage(error, "Could not load promotions."));
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

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return promotions.filter((promotion) => {
      const matchesSearch = promotion.code.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? promotion.active : !promotion.active);
      return matchesSearch && matchesStatus;
    });
  }, [promotions, search, statusFilter]);

  const openAdd = () => {
    setEditingPromotion(null);
    setForm(defaultForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (promotion: AdminPromotionRecord) => {
    setEditingPromotion(promotion);
    setForm({
      code: promotion.code,
      discount: promotion.discount,
      expiresAt: promotion.expiresAt,
      type: promotion.type,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.code.trim()) {
      nextErrors.code = "Promo code is required";
    } else if (/\s/.test(form.code)) {
      nextErrors.code = "Code cannot contain spaces";
    } else if (form.code !== form.code.toUpperCase()) {
      nextErrors.code = "Code must be uppercase";
    }

    if (!form.discount.trim()) {
      nextErrors.discount = "Discount is required";
    }

    if (!form.expiresAt) {
      nextErrors.expiresAt = "Expiry date is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setSaving(true);
    setPageError(null);

    try {
      const savedPromotion = await saveAdminPromotion(form, editingPromotion?.id);

      setPromotions((current) => {
        if (editingPromotion) {
          return current.map((promotion) =>
            promotion.id === editingPromotion.id ? savedPromotion : promotion,
          );
        }

        return [...current, savedPromotion];
      });

      toast({
        description: `${savedPromotion.code} has been synced to Supabase.`,
        title: editingPromotion ? "Promotion updated" : "Promotion created",
      });

      setDialogOpen(false);
      setEditingPromotion(null);
      setForm(defaultForm);
    } catch (error) {
      const message = getSupabaseErrorMessage(error, "Could not save the promotion.");
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

  const toggleActive = async (promotion: AdminPromotionRecord) => {
    setTogglingId(promotion.id);
    setPageError(null);

    try {
      const updatedPromotion = await setAdminPromotionActive(promotion.id, !promotion.active);
      setPromotions((current) =>
        current.map((item) => (item.id === promotion.id ? updatedPromotion : item)),
      );
      toast({
        description: updatedPromotion.code,
        title: updatedPromotion.active ? "Promotion activated" : "Promotion deactivated",
      });
    } catch (error) {
      const message = getSupabaseErrorMessage(error, "Could not update the promotion.");
      setPageError(message);
      toast({
        description: message,
        title: "Update failed",
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (promotion: AdminPromotionRecord) => {
    setDeletingId(promotion.id);
    setPageError(null);

    try {
      await deleteAdminPromotion(promotion.id);
      setPromotions((current) => current.filter((item) => item.id !== promotion.id));
      toast({
        description: `${promotion.code} has been removed from Supabase.`,
        title: "Promotion deleted",
      });
    } catch (error) {
      const message = getSupabaseErrorMessage(error, "Could not delete the promotion.");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light text-foreground">Promotions</h1>
        <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="rounded-none bg-foreground text-background hover:bg-foreground/90"
              onClick={openAdd}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Promotion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-light">
                {editingPromotion ? "Edit Promotion" : "New Promotion"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Input
                  className="rounded-none font-mono"
                  onChange={(event) =>
                    setForm({
                      ...form,
                      code: event.target.value.toUpperCase().replace(/\s/g, ""),
                    })
                  }
                  placeholder="Discount code *"
                  value={form.code}
                />
                {errors.code && <p className="text-xs text-destructive mt-1">{errors.code}</p>}
              </div>
              <div>
                <Input
                  className="rounded-none"
                  onChange={(event) => setForm({ ...form, discount: event.target.value })}
                  placeholder="Discount (e.g. 20% or £10 off) *"
                  value={form.discount}
                />
                {errors.discount && (
                  <p className="text-xs text-destructive mt-1">{errors.discount}</p>
                )}
              </div>
              <Input
                className="rounded-none"
                onChange={(event) => setForm({ ...form, type: event.target.value })}
                placeholder="Type (Percentage, Fixed, Shipping)"
                value={form.type}
              />
              <div>
                <Input
                  className="rounded-none"
                  onChange={(event) => setForm({ ...form, expiresAt: event.target.value })}
                  type="date"
                  value={form.expiresAt}
                />
                {errors.expiresAt && (
                  <p className="text-xs text-destructive mt-1">{errors.expiresAt}</p>
                )}
              </div>
              <Button
                className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90"
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {pageError && (
        <Alert variant="destructive">
          <AlertTitle>Promotions query failed</AlertTitle>
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="rounded-none pl-9"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by code..."
            value={search}
          />
        </div>
        <Select onValueChange={setStatusFilter} value={statusFilter}>
          <SelectTrigger className="rounded-none w-[140px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="border border-border p-6 text-sm font-light text-muted-foreground">
          Loading promotions from Supabase...
        </div>
      ) : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left p-3 text-sm font-normal">Code</th>
                <th className="text-left p-3 text-sm font-normal">Discount</th>
                <th className="text-left p-3 text-sm font-normal hidden md:table-cell">Expires</th>
                <th className="text-left p-3 text-sm font-normal">Status</th>
                <th className="text-right p-3 text-sm font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((promotion) => (
                <tr className="border-b border-border last:border-0 hover:bg-muted/10" key={promotion.id}>
                  <td className="p-3 text-sm font-mono">{promotion.code}</td>
                  <td className="p-3 text-sm font-light">{promotion.discount}</td>
                  <td className="p-3 text-sm font-light text-muted-foreground hidden md:table-cell">
                    {promotion.expiresAt}
                  </td>
                  <td className="p-3">
                    <button
                      className={`text-xs px-2 py-1 cursor-pointer ${
                        promotion.active ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"
                      }`}
                      disabled={togglingId === promotion.id}
                      onClick={() => void toggleActive(promotion)}
                    >
                      {promotion.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        className="h-8 w-8 p-0"
                        onClick={() => openEdit(promotion)}
                        size="sm"
                        variant="ghost"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className="h-8 w-8 p-0 text-destructive"
                            disabled={deletingId === promotion.id}
                            size="sm"
                            variant="ghost"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete promotion {promotion.code}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the promotion from Supabase.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => void handleDelete(promotion)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-sm text-muted-foreground" colSpan={5}>
                    No promotions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
