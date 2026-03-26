import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatAdminDate, getOrderStatusClasses } from "@/lib/adminUi";
import {
  getSupabaseErrorMessage,
  listAdminOrders,
  type AdminOrderRecord,
} from "@/lib/supabaseData";

const PAGE_SIZE = 5;

const AdminOrders = () => {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPageError(null);

    void listAdminOrders()
      .then((rows) => {
        if (!active) {
          return;
        }

        setOrders(rows);
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setPageError(getSupabaseErrorMessage(error, "Could not load orders."));
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
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-light text-foreground">Orders</h1>

      {pageError && (
        <Alert variant="destructive">
          <AlertTitle>Orders query failed</AlertTitle>
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="rounded-none pl-9"
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search by order ID or customer..."
            value={search}
          />
        </div>
        <Select onValueChange={handleFilter} value={statusFilter}>
          <SelectTrigger className="rounded-none w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="border border-border p-6 text-sm font-light text-muted-foreground">
          Loading orders from Supabase...
        </div>
      ) : (
        <>
          <div className="border border-border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left p-3 text-sm font-normal">Order</th>
                  <th className="text-left p-3 text-sm font-normal">Customer</th>
                  <th className="text-left p-3 text-sm font-normal hidden md:table-cell">Items</th>
                  <th className="text-left p-3 text-sm font-normal">Total</th>
                  <th className="text-left p-3 text-sm font-normal">Status</th>
                  <th className="text-left p-3 text-sm font-normal hidden lg:table-cell">
                    Personalised
                  </th>
                  <th className="text-left p-3 text-sm font-normal hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((order) => (
                  <tr className="border-b border-border last:border-0 hover:bg-muted/10" key={order.id}>
                    <td className="p-3 text-sm font-light">{order.orderNumber}</td>
                    <td className="p-3">
                      <div className="text-sm font-light">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                    </td>
                    <td className="p-3 text-sm font-light text-muted-foreground hidden md:table-cell">
                      {order.items}
                    </td>
                    <td className="p-3 text-sm font-light">{order.total}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 ${getOrderStatusClasses(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm font-light hidden lg:table-cell">
                      {order.personalised ? "Yes" : "No"}
                    </td>
                    <td className="p-3 text-sm font-light text-muted-foreground hidden md:table-cell">
                      {formatAdminDate(order.orderDate)}
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td className="p-6 text-center text-sm text-muted-foreground" colSpan={7}>
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {filtered.length} order{filtered.length !== 1 ? "s" : ""}
              </span>
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

export default AdminOrders;
