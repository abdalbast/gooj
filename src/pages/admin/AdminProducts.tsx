import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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
  { id: "7", name: "The Pamper Box", category: "Gift Boxes", price: "£60", description: "Spa-worthy self-care essentials" },
  { id: "8", name: "The Thank You Box", category: "Gift Boxes", price: "£50", description: "Show your gratitude" },
];

const PAGE_SIZE = 5;

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", category: "Gift Boxes", price: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter, products]);

  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleCategoryFilter = (val: string) => { setCategoryFilter(val); setPage(1); };

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: "", category: "Gift Boxes", price: "", description: "" });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({ name: p.name, category: p.category, price: p.price, description: p.description });
    setErrors({});
    setDialogOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    if (!form.price.trim()) errs.price = "Price is required";
    else if (!/^£\d+(\.\d{1,2})?$/.test(form.price.trim())) errs.price = "Price must be in format £XX (e.g. £65)";
    if (!form.description.trim()) errs.description = "Description is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingProduct) {
      setProducts(ps => ps.map(p => p.id === editingProduct.id ? { ...p, ...form } : p));
      toast({ title: "Product updated", description: `${form.name} has been saved.` });
    } else {
      setProducts(ps => [...ps, { id: Date.now().toString(), ...form }]);
      toast({ title: "Product added", description: `${form.name} has been created.` });
    }
    setDialogOpen(false);
  };

  const handleDelete = (p: Product) => {
    setProducts(ps => ps.filter(pr => pr.id !== p.id));
    toast({ title: "Product deleted", description: `${p.name} has been removed.` });
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
              <div>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Product name *" className="rounded-none" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Category" className="rounded-none" />
              <div>
                <Input value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="Price (e.g. £65) *" className="rounded-none" />
                {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
              </div>
              <div>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description *" className="rounded-none" />
                {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
              </div>
              <Button onClick={handleSave} className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search products..." className="rounded-none pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
          <SelectTrigger className="rounded-none w-[160px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
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
            {paginated.map(p => (
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
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {p.name}?</AlertDialogTitle>
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
            {paginated.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1} className="rounded-none h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm font-light">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="rounded-none h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
