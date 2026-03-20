const orders = [
  { id: "GOOJ-4821", customer: "James W.", email: "james.w@email.com", items: "The Birthday Box", total: "£65", status: "Shipped", date: "19 Mar 2026", personalised: true },
  { id: "GOOJ-4820", customer: "Tom H.", email: "tom.h@email.com", items: "The Luxury Box", total: "£120", status: "Processing", date: "19 Mar 2026", personalised: true },
  { id: "GOOJ-4819", customer: "Chris M.", email: "chris.m@email.com", items: "The Anniversary Box", total: "£85", status: "Delivered", date: "18 Mar 2026", personalised: false },
  { id: "GOOJ-4818", customer: "Dan R.", email: "dan.r@email.com", items: "The Just Because Box", total: "£45", status: "Shipped", date: "18 Mar 2026", personalised: true },
  { id: "GOOJ-4817", customer: "Alex P.", email: "alex.p@email.com", items: "The Partner Box", total: "£75", status: "Delivered", date: "17 Mar 2026", personalised: false },
  { id: "GOOJ-4816", customer: "Sam T.", email: "sam.t@email.com", items: "The Mum Box", total: "£55", status: "Delivered", date: "17 Mar 2026", personalised: true },
  { id: "GOOJ-4815", customer: "Ben L.", email: "ben.l@email.com", items: "The Birthday Box × 2", total: "£130", status: "Processing", date: "16 Mar 2026", personalised: false },
  { id: "GOOJ-4814", customer: "Matt K.", email: "matt.k@email.com", items: "The Luxury Box", total: "£120", status: "Delivered", date: "16 Mar 2026", personalised: true },
];

const AdminOrders = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-light text-foreground">Orders</h1>

      <div className="border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left p-3 text-sm font-normal">Order</th>
              <th className="text-left p-3 text-sm font-normal">Customer</th>
              <th className="text-left p-3 text-sm font-normal hidden md:table-cell">Items</th>
              <th className="text-left p-3 text-sm font-normal">Total</th>
              <th className="text-left p-3 text-sm font-normal">Status</th>
              <th className="text-left p-3 text-sm font-normal hidden lg:table-cell">Personalised</th>
              <th className="text-left p-3 text-sm font-normal hidden md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                <td className="p-3 text-sm font-light">{order.id}</td>
                <td className="p-3">
                  <div className="text-sm font-light">{order.customer}</div>
                  <div className="text-xs text-muted-foreground">{order.email}</div>
                </td>
                <td className="p-3 text-sm font-light text-muted-foreground hidden md:table-cell">{order.items}</td>
                <td className="p-3 text-sm font-light">{order.total}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 ${
                    order.status === "Delivered" ? "bg-green-50 text-green-700" :
                    order.status === "Shipped" ? "bg-blue-50 text-blue-700" :
                    "bg-amber-50 text-amber-700"
                  }`}>{order.status}</span>
                </td>
                <td className="p-3 text-sm font-light hidden lg:table-cell">{order.personalised ? "Yes" : "No"}</td>
                <td className="p-3 text-sm font-light text-muted-foreground hidden md:table-cell">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
