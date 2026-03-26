import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  formatAdminDate,
  formatAdminMonthYear,
  getOrderStatusClasses,
} from "@/lib/adminUi";
import {
  getSupabaseErrorMessage,
  listAdminCustomers,
  listAdminOrders,
  type AdminCustomerRecord,
  type AdminOrderRecord,
} from "@/lib/supabaseData";

const PAGE_SIZE = 6;

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<AdminCustomerRecord[]>([]);
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomerRecord | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPageError(null);

    void Promise.all([listAdminCustomers(), listAdminOrders()])
      .then(([customerRows, orderRows]) => {
        if (!active) {
          return;
        }

        setCustomers(customerRows);
        setOrders(orderRows);
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setPageError(getSupabaseErrorMessage(error, "Could not load customers."));
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
    return customers.filter(
      (customer) =>
        customer.fullName.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query),
    );
  }, [customers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const selectedCustomerOrders = useMemo(() => {
    if (!selectedCustomer) {
      return [];
    }

    return orders.filter((order) => order.customerId === selectedCustomer.id);
  }, [orders, selectedCustomer]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-light text-foreground">Customers</h1>

      {pageError && (
        <Alert variant="destructive">
          <AlertTitle>Customers query failed</AlertTitle>
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="rounded-none pl-9"
          onChange={(event) => handleSearch(event.target.value)}
          placeholder="Search by name or email..."
          value={search}
        />
      </div>

      {loading ? (
        <div className="border border-border p-6 text-sm font-light text-muted-foreground">
          Loading customers from Supabase...
        </div>
      ) : (
        <>
          <div className="border border-border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left p-3 text-sm font-normal">Name</th>
                  <th className="text-left p-3 text-sm font-normal hidden sm:table-cell">Email</th>
                  <th className="text-left p-3 text-sm font-normal">Orders</th>
                  <th className="text-left p-3 text-sm font-normal">Total Spent</th>
                  <th className="text-left p-3 text-sm font-normal hidden md:table-cell">Last Order</th>
                  <th className="text-left p-3 text-sm font-normal hidden lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((customer) => (
                  <tr
                    className="border-b border-border last:border-0 hover:bg-muted/10 cursor-pointer"
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td className="p-3 text-sm font-light">{customer.fullName}</td>
                    <td className="p-3 text-sm font-light text-muted-foreground hidden sm:table-cell">
                      {customer.email}
                    </td>
                    <td className="p-3 text-sm font-light">{customer.ordersCount}</td>
                    <td className="p-3 text-sm font-light">{customer.totalSpent}</td>
                    <td className="p-3 text-sm font-light text-muted-foreground hidden md:table-cell">
                      {customer.lastOrderAt ? formatAdminDate(customer.lastOrderAt) : "—"}
                    </td>
                    <td className="p-3 text-sm font-light text-muted-foreground hidden lg:table-cell">
                      {formatAdminMonthYear(customer.dateJoined)}
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td className="p-6 text-center text-sm text-muted-foreground" colSpan={6}>
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
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

      <Dialog onOpenChange={() => setSelectedCustomer(null)} open={!!selectedCustomer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-light">{selectedCustomer?.fullName}</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-light">{selectedCustomer.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Joined</span>
                  <p className="font-light">{formatAdminMonthYear(selectedCustomer.dateJoined)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Orders</span>
                  <p className="font-light">{selectedCustomer.ordersCount}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Spent</span>
                  <p className="font-light">{selectedCustomer.totalSpent}</p>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-medium mb-2">Order History</h2>
                <div className="border border-border">
                  {selectedCustomerOrders.map((order) => (
                    <div
                      className="flex items-center justify-between p-3 border-b border-border last:border-0 text-sm"
                      key={order.id}
                    >
                      <div>
                        <span className="font-light">{order.orderNumber}</span>
                        <span className="text-muted-foreground ml-2">{order.items}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-light">{order.total}</span>
                        <span className={`text-xs px-2 py-0.5 ${getOrderStatusClasses(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {selectedCustomerOrders.length === 0 && (
                    <div className="p-3 text-sm text-muted-foreground">
                      No order history found for this customer.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
