import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Promotion {
  id: string;
  code: string;
  discount: string;
  type: string;
  expiresAt: string;
  active: boolean;
}

const initialPromotions: Promotion[] = [
  { id: "1", code: "GOOJIT20", discount: "20%", type: "Percentage", expiresAt: "2026-04-30", active: true },
  { id: "2", code: "FREEDELIVERY", discount: "Free Delivery", type: "Shipping", expiresAt: "2026-06-30", active: true },
  { id: "3", code: "SPRING10", discount: "£10 off", type: "Fixed", expiresAt: "2026-03-31", active: false },
  { id: "4", code: "WELCOME15", discount: "15%", type: "Percentage", expiresAt: "2026-12-31", active: true },
  { id: "5", code: "MUM5", discount: "£5 off", type: "Fixed", expiresAt: "2026-03-30", active: false },
];

const AdminPromotions = () => {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [form, setForm] = useState({ code: "", discount: "", type: "Percentage", expiresAt: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return promotions.filter(p => {
      const matchesSearch = p.code.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? p.active : !p.active);
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, promotions]);

  const openAdd = () => {
    setEditingPromo(null);
    setForm({ code: "", discount: "", type: "Percentage", expiresAt: "" });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditingPromo(p);
    setForm({ code: p.code, discount: p.discount, type: p.type, expiresAt: p.expiresAt });
    setErrors({});
    setDialogOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.code.trim()) errs.code = "Promo code is required";
    else if (/\s/.test(form.code)) errs.code = "Code cannot contain spaces";
    else if (form.code !== form.code.toUpperCase()) errs.code = "Code must be uppercase";
    if (!form.discount.trim()) errs.discount = "Discount is required";
    if (!form.expiresAt) errs.expiresAt = "Expiry date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingPromo) {
      setPromotions(ps => ps.map(p => p.id === editingPromo.id ? { ...p, ...form, active: p.active } : p));
      toast({ title: "Promotion updated", description: `${form.code} has been saved.` });
    } else {
      setPromotions(ps => [...ps, { id: Date.now().toString(), ...form, active: true }]);
      toast({ title: "Promotion created", description: `${form.code} is now active.` });
    }
    setDialogOpen(false);
  };

  const toggleActive = (id: string) => {
    setPromotions(ps => ps.map(p => {
      if (p.id === id) {
        const updated = { ...p, active: !p.active };
        toast({ title: updated.active ? "Promotion activated" : "Promotion deactivated", description: p.code });
        return updated;
      }
      return p;
    }));
  };

  const handleDelete = (p: Promotion) => {
    setPromotions(ps => ps.filter(pr => pr.id !== p.id));
    toast({ title: "Promotion deleted", description: `${p.code} has been removed.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light text-foreground">Promotions</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="rounded-none bg-foreground text-background hover:bg-foreground/90">
              <Plus className="h-4 w-4 mr-2" /> Add Promotion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-light">{editingPromo ? "Edit Promotion" : "New Promotion"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase().replace(/\s/g, "")})} placeholder="Discount code *" className="rounded-none font-mono" />
                {errors.code && <p className="text-xs text-destructive mt-1">{errors.code}</p>}
              </div>
              <div>
                <Input value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} placeholder="Discount (e.g. 20% or £10 off) *" className="rounded-none" />
                {errors.discount && <p className="text-xs text-destructive mt-1">{errors.discount}</p>}
              </div>
              <Input value={form.type} onChange={e => setForm({...form, type: e.target.value})} placeholder="Type (Percentage, Fixed, Shipping)" className="rounded-none" />
              <div>
                <Input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} className="rounded-none" />
                {errors.expiresAt && <p className="text-xs text-destructive mt-1">{errors.expiresAt}</p>}
              </div>
              <Button onClick={handleSave} className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code..." className="rounded-none pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                <td className="p-3 text-sm font-mono">{p.code}</td>
                <td className="p-3 text-sm font-light">{p.discount}</td>
                <td className="p-3 text-sm font-light text-muted-foreground hidden md:table-cell">{p.expiresAt}</td>
                <td className="p-3">
                  <button onClick={() => toggleActive(p.id)} className={`text-xs px-2 py-1 cursor-pointer ${p.active ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {p.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="h-8 w-8 p-0"><Pencil className="h-3.5 w-3.5" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete promotion {p.code}?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(p)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">No promotions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPromotions;
