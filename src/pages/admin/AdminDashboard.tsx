import { useEffect, useMemo, useState } from "react";
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminPageAlert } from "@/components/admin/AdminPageAlert";
import { AdminPageLoadingState } from "@/components/admin/AdminPageLoadingState";
import { formatGBP } from "@/lib/commerce";
import { formatAdminDate, getOrderStatusClasses, parseIsoDateOnly } from "@/lib/adminUi";
import {
  getSupabaseErrorMessage,
  listAdminCustomers,
  listAdminOrders,
  listAdminProducts,
  type AdminCustomerRecord,
  type AdminOrderRecord,
  type AdminProductRecord,
} from "@/lib/supabaseData";

const DAY_MS = 24 * 60 * 60 * 1000;

const formatDelta = (value: number, suffix = "") => `${value >= 0 ? "+" : ""}${value}${suffix}`;

const formatPercentDelta = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? "0%" : "+100%";
  }

  const delta = Math.round(((current - previous) / previous) * 100);
  return formatDelta(delta, "%");
};

const getLastNDaysRevenue = (orders: AdminOrderRecord[], days: number) => {
  const anchorDate = orders.length
    ? new Date(
        Math.max(...orders.map((order) => parseIsoDateOnly(order.orderDate).getTime())),
      )
    : new Date();

  return Array.from({ length: days }, (_, index) => {
    const currentDate = new Date(anchorDate.getTime() - DAY_MS * (days - index - 1));
    const currentKey = currentDate.toISOString().slice(0, 10);
    const revenuePence = orders.reduce((total, order) => {
      return total + (order.orderDate === currentKey ? order.totalPence : 0);
    }, 0);

    return {
      day: currentDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      revenue: revenuePence / 100,
    };
  });
};

const getStatusChartData = (orders: AdminOrderRecord[]) => {
  const totalOrders = orders.length || 1;
  const statusCounts = orders.reduce<Record<string, number>>((accumulator, order) => {
    accumulator[order.status] = (accumulator[order.status] ?? 0) + 1;
    return accumulator;
  }, {});

  const palette: Record<string, string> = {
    Delivered: "hsl(142, 71%, 35%)",
    Processing: "hsl(38, 92%, 50%)",
    Shipped: "hsl(217, 91%, 50%)",
  };

  return Object.entries(statusCounts).map(([name, count]) => ({
    color: palette[name] ?? "hsl(215, 20%, 65%)",
    name,
    value: Math.round((count / totalOrders) * 100),
  }));
};

const getOrdersInRange = (orders: AdminOrderRecord[], startInclusive: Date, endInclusive: Date) => {
  const start = startInclusive.getTime();
  const end = endInclusive.getTime();

  return orders.filter((order) => {
    const orderTime = parseIsoDateOnly(order.orderDate).getTime();
    return orderTime >= start && orderTime <= end;
  });
};

const AdminDashboard = () => {
  const [products, setProducts] = useState<AdminProductRecord[]>([]);
  const [customers, setCustomers] = useState<AdminCustomerRecord[]>([]);
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    void Promise.all([listAdminProducts(), listAdminCustomers(), listAdminOrders()])
      .then(([productRows, customerRows, orderRows]) => {
        if (!active) {
          return;
        }

        setProducts(productRows);
        setCustomers(customerRows);
        setOrders(orderRows);
      })
      .catch((loadError) => {
        if (!active) {
          return;
        }

        setError(getSupabaseErrorMessage(loadError, "Could not load the dashboard data."));
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

  const dashboard = useMemo(() => {
    const totalRevenuePence = orders.reduce((total, order) => total + order.totalPence, 0);
    const revenueData = getLastNDaysRevenue(orders, 7);
    const statusData = getStatusChartData(orders);
    const recentOrders = [...orders].slice(0, 5);

    const anchorDate = orders.length
      ? new Date(
          Math.max(...orders.map((order) => parseIsoDateOnly(order.orderDate).getTime())),
        )
      : new Date();

    const currentOrders = getOrdersInRange(
      orders,
      new Date(anchorDate.getTime() - DAY_MS * 6),
      anchorDate,
    );
    const previousOrders = getOrdersInRange(
      orders,
      new Date(anchorDate.getTime() - DAY_MS * 13),
      new Date(anchorDate.getTime() - DAY_MS * 7),
    );

    const currentRevenue = currentOrders.reduce((total, order) => total + order.totalPence, 0);
    const previousRevenue = previousOrders.reduce((total, order) => total + order.totalPence, 0);

    const recentCustomers = customers.filter((customer) => {
      const joinedAt = parseIsoDateOnly(customer.dateJoined).getTime();
      return joinedAt >= anchorDate.getTime() - DAY_MS * 29;
    }).length;

    return {
      recentOrders,
      revenueData,
      stats: [
        {
          change: formatDelta(currentOrders.length - previousOrders.length),
          icon: ShoppingCart,
          label: "Total Orders",
          value: orders.length.toLocaleString("en-GB"),
        },
        {
          change: formatPercentDelta(currentRevenue, previousRevenue),
          icon: TrendingUp,
          label: "Revenue",
          value: formatGBP(totalRevenuePence / 100),
        },
        {
          change: `${products.filter((product) => product.active).length} live`,
          icon: Package,
          label: "Products",
          value: products.length.toLocaleString("en-GB"),
        },
        {
          change: `${recentCustomers} joined in 30d`,
          icon: Users,
          label: "Customers",
          value: customers.length.toLocaleString("en-GB"),
        },
      ],
      statusData,
    };
  }, [customers, orders, products]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-light text-foreground">Dashboard</h1>

      {error ? <AdminPageAlert title="Dashboard query failed">{error}</AdminPageAlert> : null}

      {loading ? (
        <AdminPageLoadingState message="Loading dashboard data from Supabase..." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboard.stats.map((stat) => (
              <div className="border border-border p-5 space-y-2" key={stat.label}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-light">{stat.label}</span>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-light text-foreground">{stat.value}</span>
                  <span className="text-xs text-green-600 mb-1">{stat.change}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 border border-border p-5">
              <h2 className="text-sm font-medium text-foreground mb-4">Revenue (Last 7 Recorded Days)</h2>
              <div className="h-[250px]">
                <ResponsiveContainer height="100%" width="100%">
                  <LineChart data={dashboard.revenueData}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `£${value}`}
                    />
                    <Tooltip formatter={(value: number) => [`£${value}`, "Revenue"]} />
                    <Line
                      dataKey="revenue"
                      dot={{ r: 3 }}
                      stroke="hsl(var(--foreground))"
                      strokeWidth={2}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border border-border p-5">
              <h2 className="text-sm font-medium text-foreground mb-4">Orders by Status</h2>
              <div className="h-[200px]">
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={dashboard.statusData}
                      dataKey="value"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {dashboard.statusData.map((entry) => (
                        <Cell fill={entry.color} key={entry.name} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [`${value}%`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 mt-2">
                {dashboard.statusData.length > 0 ? (
                  dashboard.statusData.map((status) => (
                    <div className="flex items-center gap-2 text-xs" key={status.name}>
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-muted-foreground">{status.name}</span>
                      <span className="ml-auto font-light">{status.value}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No order data yet.</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-light text-foreground mb-4">Recent Orders</h2>
            <div className="border border-border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left p-3 text-sm font-normal text-foreground">Order</th>
                    <th className="text-left p-3 text-sm font-normal text-foreground">Customer</th>
                    <th className="text-left p-3 text-sm font-normal text-foreground">Total</th>
                    <th className="text-left p-3 text-sm font-normal text-foreground">Status</th>
                    <th className="text-left p-3 text-sm font-normal text-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentOrders.map((order) => (
                    <tr className="border-b border-border last:border-0 hover:bg-muted/10" key={order.id}>
                      <td className="p-3 text-sm font-light">{order.orderNumber}</td>
                      <td className="p-3 text-sm font-light text-muted-foreground">{order.customerName}</td>
                      <td className="p-3 text-sm font-light">{order.total}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 ${getOrderStatusClasses(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm font-light text-muted-foreground">
                        {formatAdminDate(order.orderDate)}
                      </td>
                    </tr>
                  ))}
                  {dashboard.recentOrders.length === 0 && (
                    <tr>
                      <td className="p-6 text-center text-sm text-muted-foreground" colSpan={5}>
                        No orders found in Supabase.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
