import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const stats = [
  { label: "Total Orders", value: "1,247", icon: ShoppingCart, change: "+12%" },
  { label: "Revenue", value: "£84,320", icon: TrendingUp, change: "+8%" },
  { label: "Products", value: "24", icon: Package, change: "+2" },
  { label: "Customers", value: "3,891", icon: Users, change: "+156" },
];

const revenueData = [
  { day: "16 Mar", revenue: 310 },
  { day: "17 Mar", revenue: 450 },
  { day: "18 Mar", revenue: 380 },
  { day: "19 Mar", revenue: 520 },
  { day: "20 Mar", revenue: 290 },
  { day: "21 Mar", revenue: 680 },
  { day: "22 Mar", revenue: 410 },
];

const statusData = [
  { name: "Delivered", value: 62, color: "hsl(142, 71%, 35%)" },
  { name: "Shipped", value: 24, color: "hsl(217, 91%, 50%)" },
  { name: "Processing", value: 14, color: "hsl(38, 92%, 50%)" },
];

const recentOrders = [
  { id: "GOOJ-4821", customer: "James W.", total: "£65", status: "Shipped", date: "19 Mar 2026" },
  { id: "GOOJ-4820", customer: "Tom H.", total: "£120", status: "Processing", date: "19 Mar 2026" },
  { id: "GOOJ-4819", customer: "Chris M.", total: "£85", status: "Delivered", date: "18 Mar 2026" },
  { id: "GOOJ-4818", customer: "Dan R.", total: "£45", status: "Shipped", date: "18 Mar 2026" },
  { id: "GOOJ-4817", customer: "Alex P.", total: "£75", status: "Delivered", date: "17 Mar 2026" },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-light text-foreground">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="border border-border p-5 space-y-2">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-border p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Revenue (Last 7 Days)</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `£${v}`} />
                <Tooltip formatter={(value: number) => [`£${value}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--foreground))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-border p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Orders by Status</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [`${value}%`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="ml-auto font-light">{s.value}%</span>
              </div>
            ))}
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
              {recentOrders.map(order => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                  <td className="p-3 text-sm font-light">{order.id}</td>
                  <td className="p-3 text-sm font-light text-muted-foreground">{order.customer}</td>
                  <td className="p-3 text-sm font-light">{order.total}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 ${
                      order.status === "Delivered" ? "bg-green-50 text-green-700" :
                      order.status === "Shipped" ? "bg-blue-50 text-blue-700" :
                      "bg-amber-50 text-amber-700"
                    }`}>{order.status}</span>
                  </td>
                  <td className="p-3 text-sm font-light text-muted-foreground">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
