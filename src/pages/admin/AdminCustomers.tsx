import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: string;
  lastOrder: string;
  dateJoined: string;
  orderHistory: { id: string; items: string; total: string; date: string; status: string }[];
}

const customers: Customer[] = [
  { id: "1", name: "James Wilson", email: "james.w@email.com", orders: 5, totalSpent: "£385", lastOrder: "19 Mar 2026", dateJoined: "Oct 2025", orderHistory: [
    { id: "GOOJ-4821", items: "The Birthday Box", total: "£65", date: "19 Mar 2026", status: "Shipped" },
    { id: "GOOJ-4790", items: "The Luxury Box", total: "£120", date: "2 Mar 2026", status: "Delivered" },
    { id: "GOOJ-4712", items: "The Partner Box", total: "£75", date: "14 Feb 2026", status: "Delivered" },
  ]},
  { id: "2", name: "Tom Henderson", email: "tom.h@email.com", orders: 3, totalSpent: "£270", lastOrder: "19 Mar 2026", dateJoined: "Nov 2025", orderHistory: [
    { id: "GOOJ-4820", items: "The Luxury Box", total: "£120", date: "19 Mar 2026", status: "Processing" },
    { id: "GOOJ-4755", items: "The Mum Box", total: "£55", date: "8 Mar 2026", status: "Delivered" },
  ]},
  { id: "3", name: "Chris Mitchell", email: "chris.m@email.com", orders: 2, totalSpent: "£150", lastOrder: "18 Mar 2026", dateJoined: "Dec 2025", orderHistory: [
    { id: "GOOJ-4819", items: "The Anniversary Box", total: "£85", date: "18 Mar 2026", status: "Delivered" },
  ]},
  { id: "4", name: "Dan Roberts", email: "dan.r@email.com", orders: 4, totalSpent: "£230", lastOrder: "18 Mar 2026", dateJoined: "Sep 2025", orderHistory: [
    { id: "GOOJ-4818", items: "The Just Because Box", total: "£45", date: "18 Mar 2026", status: "Shipped" },
  ]},
  { id: "5", name: "Alex Palmer", email: "alex.p@email.com", orders: 1, totalSpent: "£75", lastOrder: "17 Mar 2026", dateJoined: "Mar 2026", orderHistory: [
    { id: "GOOJ-4817", items: "The Partner Box", total: "£75", date: "17 Mar 2026", status: "Delivered" },
  ]},
  { id: "6", name: "Sam Turner", email: "sam.t@email.com", orders: 6, totalSpent: "£420", lastOrder: "17 Mar 2026", dateJoined: "Aug 2025", orderHistory: [
    { id: "GOOJ-4816", items: "The Mum Box", total: "£55", date: "17 Mar 2026", status: "Delivered" },
  ]},
  { id: "7", name: "Ben Lawrence", email: "ben.l@email.com", orders: 2, totalSpent: "£195", lastOrder: "16 Mar 2026", dateJoined: "Jan 2026", orderHistory: [
    { id: "GOOJ-4815", items: "The Birthday Box × 2", total: "£130", date: "16 Mar 2026", status: "Processing" },
  ]},
  { id: "8", name: "Matt King", email: "matt.k@email.com", orders: 3, totalSpent: "£260", lastOrder: "16 Mar 2026", dateJoined: "Oct 2025", orderHistory: [
    { id: "GOOJ-4814", items: "The Luxury Box", total: "£120", date: "16 Mar 2026", status: "Delivered" },
  ]},
  { id: "9", name: "Oliver Shaw", email: "oliver.s@email.com", orders: 1, totalSpent: "£45", lastOrder: "15 Mar 2026", dateJoined: "Mar 2026", orderHistory: [
    { id: "GOOJ-4810", items: "The Just Because Box", total: "£45", date: "15 Mar 2026", status: "Delivered" },
  ]},
  { id: "10", name: "Ryan Cooper", email: "ryan.c@email.com", orders: 7, totalSpent: "£510", lastOrder: "14 Mar 2026", dateJoined: "Jul 2025", orderHistory: [
    { id: "GOOJ-4805", items: "The Luxury Box", total: "£120", date: "14 Mar 2026", status: "Delivered" },
    { id: "GOOJ-4780", items: "The Anniversary Box", total: "£85", date: "28 Feb 2026", status: "Delivered" },
  ]},
];

const PAGE_SIZE = 6;

const AdminCustomers = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-light text-foreground">Customers</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="rounded-none pl-9"
        />
      </div>

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
            {paginated.map(c => (
              <tr
                key={c.id}
                className="border-b border-border last:border-0 hover:bg-muted/10 cursor-pointer"
                onClick={() => setSelectedCustomer(c)}
              >
                <td className="p-3 text-sm font-light">{c.name}</td>
                <td className="p-3 text-sm font-light text-muted-foreground hidden sm:table-cell">{c.email}</td>
                <td className="p-3 text-sm font-light">{c.orders}</td>
                <td className="p-3 text-sm font-light">{c.totalSpent}</td>
                <td className="p-3 text-sm font-light text-muted-foreground hidden md:table-cell">{c.lastOrder}</td>
                <td className="p-3 text-sm font-light text-muted-foreground hidden lg:table-cell">{c.dateJoined}</td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
          </span>
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

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-light">{selectedCustomer?.name}</DialogTitle>
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
                  <p className="font-light">{selectedCustomer.dateJoined}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Orders</span>
                  <p className="font-light">{selectedCustomer.orders}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Spent</span>
                  <p className="font-light">{selectedCustomer.totalSpent}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Order History</h4>
                <div className="border border-border">
                  {selectedCustomer.orderHistory.map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 border-b border-border last:border-0 text-sm">
                      <div>
                        <span className="font-light">{o.id}</span>
                        <span className="text-muted-foreground ml-2">{o.items}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-light">{o.total}</span>
                        <span className={`text-xs px-2 py-0.5 ${
                          o.status === "Delivered" ? "bg-green-50 text-green-700" :
                          o.status === "Shipped" ? "bg-blue-50 text-blue-700" :
                          "bg-amber-50 text-amber-700"
                        }`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
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
