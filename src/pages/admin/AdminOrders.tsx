import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const orders = [
  { id: "GOOJ-4821", customer: "James W.", email: "james.w@email.com", items: "The Birthday Box", total: "£65", status: "Shipped", date: "19 Mar 2026", personalised: true },
  { id: "GOOJ-4820", customer: "Tom H.", email: "tom.h@email.com", items: "The Luxury Box", total: "£120", status: "Processing", date: "19 Mar 2026", personalised: true },
  { id: "GOOJ-4819", customer: "Chris M.", email: "chris.m@email.com", items: "The Anniversary Box", total: "£85", status: "Delivered", date: "18 Mar 2026", personalised: false },
  { id: "GOOJ-4818", customer: "Dan R.", email: "dan.r@email.com", items: "The Just Because Box", total: "£45", status: "Shipped", date: "18 Mar 2026", personalised: true },
  { id: "GOOJ-4817", customer: "Alex P.", email: "alex.p@email.com", items: "The Partner Box", total: "£75", status: "Delivered", date: "17 Mar 2026", personalised: false },
  { id: "GOOJ-4816", customer: "Sam T.", email: "sam.t@email.com", items: "The Mum Box", total: "£55", status: "Delivered", date: "17 Mar 2026", personalised: true },
  { id: "GOOJ-4815", customer: "Ben L.", email: "ben.l@email.com", items: "The Birthday Box × 2", total: "£130", status: "Processing", date: "16 Mar 2026", personalised: false },
  { id: "GOOJ-4814", customer: "Matt K.", email: "matt.k@email.com", items: "The Luxury Box", total: "£120", status: "Delivered", date: "16 Mar 2026", personalised: true },
  { id: "GOOJ-4813", customer: "Oliver S.", email: "oliver.s@email.com", items: "The Just Because Box", total: "£45", status: "Delivered", date: "15 Mar 2026", personalised: false },
  { id: "GOOJ-4812", customer: "Ryan C.", email: "ryan.c@email.com", items: "The Luxury Box", total: "£120", status: "Shipped", date: "14 Mar 2026", personalised: true },
  { id: "GOOJ-4811", customer: "Jake N.", email: "jake.n@email.com", items: "The Anniversary Box", total: "£85", status: "Delivered", date: "14 Mar 2026", personalised: true },
  { id: "GOOJ-4810", customer: "Will F.", email: "will.f@email.com", items: "The Partner Box", total: "£75", status: "Delivered", date: "13 Mar 2026", personalised: false },
];

const PAGE_SIZE = 5;

const AdminOrders = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleFilter = (val: string) => { setStatusFilter(val); setPage(1); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-light text-foreground">Orders</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search by order ID or customer..." className="rounded-none pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={handleFilter}>
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
            {paginated.map(order => (
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
            {paginated.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{filtered.length} order{filtered.length !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1} className="rounded-none h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-light">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="rounded-none h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
