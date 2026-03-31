import { useEffect, useMemo, useState } from "react";
import { AdminPageAlert } from "@/components/admin/AdminPageAlert";
import { AdminPageLoadingState } from "@/components/admin/AdminPageLoadingState";
import { AdminResultCount } from "@/components/admin/AdminResultCount";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { VirtualizedAdminTable } from "@/components/admin/VirtualizedAdminTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const CUSTOMER_ROW_HEIGHT = 72;
const CUSTOMER_VIEWPORT_HEIGHT = 432;
const customerGridClassName =
  "grid grid-cols-[minmax(150px,1.1fr)_auto_auto] sm:grid-cols-[minmax(150px,1.1fr)_minmax(220px,1.4fr)_auto_auto] md:grid-cols-[minmax(150px,1.1fr)_minmax(220px,1.4fr)_auto_auto_minmax(120px,1fr)] lg:grid-cols-[minmax(150px,1.1fr)_minmax(220px,1.4fr)_auto_auto_minmax(120px,1fr)_minmax(120px,1fr)]";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<AdminCustomerRecord[]>([]);
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
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

  const selectedCustomerOrders = useMemo(() => {
    if (!selectedCustomer) {
      return [];
    }

    return orders.filter((order) => order.customerId === selectedCustomer.id);
  }, [orders, selectedCustomer]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-light text-foreground">Customers</h1>

      {pageError ? (
        <AdminPageAlert title="Customers query failed">{pageError}</AdminPageAlert>
      ) : null}

      <AdminSearchInput
        onChange={handleSearch}
        placeholder="Search by name or email..."
        value={search}
      />

      {loading ? (
        <AdminPageLoadingState message="Loading customers from Supabase..." />
      ) : (
        <>
          <VirtualizedAdminTable
            emptyState="No customers found."
            getItemKey={(customer) => customer.id}
            header={
              <div className={`bg-muted/20 ${customerGridClassName}`}>
                <div className="p-3 text-sm font-normal">Name</div>
                <div className="hidden p-3 text-sm font-normal sm:block">Email</div>
                <div className="p-3 text-sm font-normal">Orders</div>
                <div className="p-3 text-sm font-normal">Total Spent</div>
                <div className="hidden p-3 text-sm font-normal md:block">Last Order</div>
                <div className="hidden p-3 text-sm font-normal lg:block">Joined</div>
              </div>
            }
            items={filtered}
            renderRow={(customer) => (
              <button
                className={`border-b border-border last:border-0 hover:bg-muted/10 text-left w-full ${customerGridClassName}`}
                onClick={() => setSelectedCustomer(customer)}
                type="button"
              >
                <div className="p-3 text-sm font-light">{customer.fullName}</div>
                <div className="hidden p-3 text-sm font-light text-muted-foreground sm:block">
                  {customer.email}
                </div>
                <div className="p-3 text-sm font-light">{customer.ordersCount}</div>
                <div className="p-3 text-sm font-light">{customer.totalSpent}</div>
                <div className="hidden p-3 text-sm font-light text-muted-foreground md:block">
                  {customer.lastOrderAt ? formatAdminDate(customer.lastOrderAt) : "—"}
                </div>
                <div className="hidden p-3 text-sm font-light text-muted-foreground lg:block">
                  {formatAdminMonthYear(customer.dateJoined)}
                </div>
              </button>
            )}
            rowHeight={CUSTOMER_ROW_HEIGHT}
            viewportHeight={CUSTOMER_VIEWPORT_HEIGHT}
            viewportTestId="customers-viewport"
          />

          <AdminResultCount count={filtered.length} label="customer" />
        </>
      )}

      <Dialog onOpenChange={() => setSelectedCustomer(null)} open={!!selectedCustomer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-light">{selectedCustomer?.fullName}</DialogTitle>
            <DialogDescription>
              Customer profile details and order history pulled from the admin dataset.
            </DialogDescription>
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
