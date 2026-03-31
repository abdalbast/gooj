import { useEffect, useMemo, useState } from "react";
import { AdminPageAlert } from "@/components/admin/AdminPageAlert";
import { AdminPageLoadingState } from "@/components/admin/AdminPageLoadingState";
import { AdminResultCount } from "@/components/admin/AdminResultCount";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VirtualizedAdminTable } from "@/components/admin/VirtualizedAdminTable";
import { formatAdminDate, getOrderStatusClasses } from "@/lib/adminUi";
import {
  getSupabaseErrorMessage,
  listAdminOrders,
  type AdminOrderRecord,
} from "@/lib/supabaseData";

const ORDER_ROW_HEIGHT = 88;
const ORDER_VIEWPORT_HEIGHT = 440;
const orderGridClassName =
  "grid grid-cols-[minmax(110px,1fr)_minmax(170px,1.2fr)_auto_auto] md:grid-cols-[minmax(110px,0.9fr)_minmax(170px,1.2fr)_minmax(150px,1.1fr)_auto_auto_minmax(110px,0.9fr)] lg:grid-cols-[minmax(110px,0.9fr)_minmax(170px,1.2fr)_minmax(150px,1.1fr)_auto_auto_minmax(110px,0.9fr)_minmax(110px,0.9fr)]";

const AdminOrders = () => {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleFilter = (value: string) => {
    setStatusFilter(value);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-light text-foreground">Orders</h1>

      {pageError ? <AdminPageAlert title="Orders query failed">{pageError}</AdminPageAlert> : null}

      <div className="flex flex-col sm:flex-row gap-3">
        <AdminSearchInput
          className="max-w-sm flex-1"
          onChange={handleSearch}
          placeholder="Search by order ID or customer..."
          value={search}
        />
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
        <AdminPageLoadingState message="Loading orders from Supabase..." />
      ) : (
        <>
          <VirtualizedAdminTable
            emptyState="No orders found."
            getItemKey={(order) => order.id}
            header={
              <div className={`bg-muted/20 ${orderGridClassName}`}>
                <div className="p-3 text-sm font-normal">Order</div>
                <div className="p-3 text-sm font-normal">Customer</div>
                <div className="hidden p-3 text-sm font-normal md:block">Items</div>
                <div className="p-3 text-sm font-normal">Total</div>
                <div className="p-3 text-sm font-normal">Status</div>
                <div className="hidden p-3 text-sm font-normal md:block">Date</div>
                <div className="hidden p-3 text-sm font-normal lg:block">Personalised</div>
              </div>
            }
            items={filtered}
            renderRow={(order) => (
              <div
                className={`border-b border-border last:border-0 hover:bg-muted/10 ${orderGridClassName}`}
              >
                <div className="p-3 text-sm font-light">{order.orderNumber}</div>
                <div className="p-3">
                  <div className="text-sm font-light">{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                </div>
                <div className="hidden p-3 text-sm font-light text-muted-foreground md:block">
                  {order.items}
                </div>
                <div className="p-3 text-sm font-light">{order.total}</div>
                <div className="p-3">
                  <span className={`text-xs px-2 py-1 ${getOrderStatusClasses(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="hidden p-3 text-sm font-light text-muted-foreground md:block">
                  {formatAdminDate(order.orderDate)}
                </div>
                <div className="hidden p-3 text-sm font-light lg:block">
                  {order.personalised ? "Yes" : "No"}
                </div>
              </div>
            )}
            rowHeight={ORDER_ROW_HEIGHT}
            viewportHeight={ORDER_VIEWPORT_HEIGHT}
            viewportTestId="orders-viewport"
          />

          <AdminResultCount count={filtered.length} label="order" />
        </>
      )}
    </div>
  );
};

export default AdminOrders;
