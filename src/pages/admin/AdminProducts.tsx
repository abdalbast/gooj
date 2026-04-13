import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
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
import { AdminFieldError } from "@/components/admin/AdminFieldError";
import { AdminPageAlert } from "@/components/admin/AdminPageAlert";
import { AdminPageLoadingState } from "@/components/admin/AdminPageLoadingState";
import { AdminResultCount } from "@/components/admin/AdminResultCount";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAdminEntityDialog } from "@/hooks/use-admin-entity-dialog";
import {
  deleteAdminProduct,
  getSupabaseErrorMessage,
  listAdminProducts,
  saveAdminProduct,
  type AdminProductRecord,
} from "@/lib/supabaseData";

const PAGE_SIZE = 5;

const createDefaultForm = (): AdminProductInput => ({
  category: "Gift Boxes",
  description: "",
  isActive: true,
  name: "",
  price: "",
});

const toProductForm = (product: AdminProductRecord): AdminProductInput => ({
  category: product.category,
  description: product.description,
  isActive: product.active,
  name: product.name,
  price: product.price,
});

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<AdminProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const {
    closeDialog,
    dialogOpen,
    editingRecord: editingProduct,
    errors,
    form,
    handleDialogOpenChange,
    openAddDialog,
    openEditDialog,
    setErrors,
    setForm,
  } = useAdminEntityDialog<AdminProductRecord, AdminProductInput>({
    createDefaultForm,
    toForm: toProductForm,
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPageError(null);

    void listAdminProducts()
      .then((rows) => {
        if (!active) {
          return;
        }

        setProducts(rows);
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setPageError(getSupabaseErrorMessage(error, "Could not load products."));
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
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, products, search]);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))],
    [products],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const updateFormField = <Field extends keyof AdminProductInput>(
    field: Field,
    value: AdminProductInput[Field],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      nextErrors.name = "Product name is required";
    }

    if (!form.price.trim()) {
      nextErrors.price = "Price is required";
    } else if (!/^£?\d+(\.\d{1,2})?$/.test(form.price.trim())) {
      nextErrors.price = "Price must be a GBP amount such as £65 or 65.00";
    } else {
      const parsedPrice = Number.parseFloat(form.price.trim().replace(/^£/, ""));
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        nextErrors.price = "Price must be greater than zero";
      }
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required";
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
      const savedProduct = await saveAdminProduct(form, editingProduct?.id);

      setProducts((current) => {
        if (editingProduct) {
          return current.map((product) =>
            product.id === editingProduct.id ? savedProduct : product,
          );
        }

        return [savedProduct, ...current];
      });

      toast({
        description: `${savedProduct.name} has been synced to Supabase.`,
        title: editingProduct ? "Product updated" : "Product added",
      });

      closeDialog();
    } catch (error) {
      const message = getSupabaseErrorMessage(error, "Could not save the product.");
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

  const handleDelete = async (product: AdminProductRecord) => {
    setDeletingId(product.id);
    setPageError(null);

    try {
      await deleteAdminProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      toast({
        description: `${product.name} has been removed from Supabase.`,
        title: "Product deleted",
      });
    } catch (error) {
      const message = getSupabaseErrorMessage(error, "Could not delete the product.");
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
        <h1 className="text-2xl font-light text-foreground">Products</h1>
        <Dialog onOpenChange={handleDialogOpenChange} open={dialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="rounded-none bg-foreground text-background hover:bg-foreground/90"
              onClick={openAddDialog}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-light">
                {editingProduct ? "Edit Product" : "Add Product"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Input
                  className="rounded-none"
                  onChange={(event) => updateFormField("name", event.target.value)}
                  placeholder="Product name *"
                  value={form.name}
                />
                <AdminFieldError message={errors.name} />
              </div>
              <Input
                className="rounded-none"
                onChange={(event) => updateFormField("category", event.target.value)}
                placeholder="Category"
                value={form.category}
              />
              <div>
                <Input
                  className="rounded-none"
                  onChange={(event) => updateFormField("price", event.target.value)}
                  placeholder="Price (e.g. £65) *"
                  value={form.price}
                />
                <AdminFieldError message={errors.price} />
              </div>
              <div>
                <Textarea
                  className="rounded-none"
                  onChange={(event) => updateFormField("description", event.target.value)}
                  placeholder="Description *"
                  value={form.description}
                />
                <AdminFieldError message={errors.description} />
              </div>
              <div>
                <Select
                  onValueChange={(value) => updateFormField("isActive", value === "active")}
                  value={form.isActive === false ? "inactive" : "active"}
                >
                  <SelectTrigger className="rounded-none">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
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

      {pageError ? <AdminPageAlert title="Products query failed">{pageError}</AdminPageAlert> : null}

      <div className="flex flex-col sm:flex-row gap-3">
        <AdminSearchInput
          className="max-w-sm flex-1"
          onChange={handleSearch}
          placeholder="Search products..."
          value={search}
        />
        <Select onValueChange={handleCategoryFilter} value={categoryFilter}>
          <SelectTrigger className="rounded-none w-[160px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <AdminPageLoadingState message="Loading products from Supabase..." />
      ) : (
        <>
          <div className="border border-border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left p-3 text-sm font-normal">Name</th>
                  <th className="text-left p-3 text-sm font-normal">Category</th>
                  <th className="text-left p-3 text-sm font-normal">Price</th>
                  <th className="text-left p-3 text-sm font-normal hidden md:table-cell">
                    Description
                  </th>
                  <th className="text-right p-3 text-sm font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((product) => (
                  <tr className="border-b border-border last:border-0 hover:bg-muted/10" key={product.id}>
                    <td className="p-3 text-sm font-light">{product.name}</td>
                    <td className="p-3 text-sm font-light text-muted-foreground">{product.category}</td>
                    <td className="p-3 text-sm font-light">{product.price}</td>
                    <td className="p-3 text-sm font-light text-muted-foreground hidden md:table-cell truncate max-w-[200px]">
                      {product.description}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          className="h-8 w-8 p-0"
                          onClick={() => openEditDialog(product)}
                          size="sm"
                          variant="ghost"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="h-8 w-8 p-0 text-destructive"
                              disabled={deletingId === product.id}
                              size="sm"
                              variant="ghost"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete {product.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the product from Supabase.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => void handleDelete(product)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td className="p-6 text-center text-sm text-muted-foreground" colSpan={5}>
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between">
              <AdminResultCount count={filtered.length} label="product" />
              <div className="flex items-center gap-2">
                <Button
                  className="rounded-none h-8 w-8 p-0"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  size="sm"
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-light">
                  {page} / {totalPages}
                </span>
                <Button
                  className="rounded-none h-8 w-8 p-0"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  size="sm"
                  variant="outline"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProducts;
