import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
}

const initialProducts: Product[] = [
  { id: "1", name: "The Birthday Box", category: "Gift Boxes", price: "£65", description: "A curated box of birthday treats" },
  { id: "2", name: "The Anniversary Box", category: "Gift Boxes", price: "£85", description: "Romantic indulgences for milestones" },
  { id: "3", name: "The Mum Box", category: "Gift Boxes", price: "£55", description: "Pampering essentials for mum" },
  { id: "4", name: "The Just Because Box", category: "Gift Boxes", price: "£45", description: "No occasion needed" },
  { id: "5", name: "The Luxury Box", category: "Luxury Boxes", price: "£120", description: "Premium indulgence" },
  { id: "6", name: "The Partner Box", category: "Gift Boxes", price: "£75", description: "For the woman in your life" },
];

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", category: "Gift Boxes", price: "", description: "" });

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: "", category: "Gift Boxes", price: "", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({ name: p.name, category: p.category, price: p.price, description: p.description });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price) return;
    if (editingProduct) {
      setProducts(ps => ps.map(p => p.id === editingProduct.id ? { ...p, ...form } : p));
    } else {
      setProducts(ps => [...ps, { id: Date.now().toString(), ...form }]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setProducts(ps => ps.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light text-foreground">Products</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="rounded-none bg-foreground text-background hover:bg-foreground/90">
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-light">{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Product name" className="rounded-none" />
              <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Category" className="rounded-none" />
              <Input value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="Price (e.g. £65)" className="rounded-none" />
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="rounded-none" />
              <Button onClick={handleSave} className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left p-3 text-sm font-normal">Name</th>
              <th className="text-left p-3 text-sm font-normal">Category</th>
              <th className="text-left p-3 text-sm font-normal">Price</th>
              <th className="text-left p-3 text-sm font-normal hidden md:table-cell">Description</th>
              <th className="text-right p-3 text-sm font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                <td className="p-3 text-sm font-light">{p.name}</td>
                <td className="p-3 text-sm font-light text-muted-foreground">{p.category}</td>
                <td className="p-3 text-sm font-light">{p.price}</td>
                <td className="p-3 text-sm font-light text-muted-foreground hidden md:table-cell truncate max-w-[200px]">{p.description}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="h-8 w-8 p-0">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {p.name}?</AlertDialogTitle>
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

export default AdminProducts;
