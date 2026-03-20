import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
];

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [form, setForm] = useState({ code: "", discount: "", type: "Percentage", expiresAt: "" });

  const openAdd = () => {
    setEditingPromo(null);
    setForm({ code: "", discount: "", type: "Percentage", expiresAt: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditingPromo(p);
    setForm({ code: p.code, discount: p.discount, type: p.type, expiresAt: p.expiresAt });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.code || !form.discount) return;
    if (editingPromo) {
      setPromotions(ps => ps.map(p => p.id === editingPromo.id ? { ...p, ...form, active: p.active } : p));
    } else {
      setPromotions(ps => [...ps, { id: Date.now().toString(), ...form, active: true }]);
    }
    setDialogOpen(false);
  };

  const toggleActive = (id: string) => {
    setPromotions(ps => ps.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const handleDelete = (id: string) => {
    setPromotions(ps => ps.filter(p => p.id !== id));
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
              <Input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="Discount code" className="rounded-none" />
              <Input value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} placeholder="Discount (e.g. 20% or £10 off)" className="rounded-none" />
              <Input value={form.type} onChange={e => setForm({...form, type: e.target.value})} placeholder="Type (Percentage, Fixed, Shipping)" className="rounded-none" />
              <Input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} className="rounded-none" />
              <Button onClick={handleSave} className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
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
            {promotions.map(p => (
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
                          <AlertDialogAction onClick={() => handleDelete(p.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPromotions;
