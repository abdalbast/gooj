import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

const stats = [
  { label: "Total Orders", value: "1,247", icon: ShoppingCart, change: "+12%" },
  { label: "Revenue", value: "£84,320", icon: TrendingUp, change: "+8%" },
  { label: "Products", value: "24", icon: Package, change: "+2" },
  { label: "Customers", value: "3,891", icon: Users, change: "+156" },
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
