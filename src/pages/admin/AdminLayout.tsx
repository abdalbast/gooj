import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  ShoppingCart,
  Tag,
  Users,
  X,
} from "lucide-react";
import EmailAuthCard from "@/components/auth/EmailAuthCard";
import SupabaseSetupCard from "@/components/auth/SupabaseSetupCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const adminLinks = [
  { icon: LayoutDashboard, name: "Dashboard", path: "/admin" },
  { icon: Package, name: "Products", path: "/admin/products" },
  { icon: Tag, name: "Promotions", path: "/admin/promotions" },
  { icon: FileText, name: "Content", path: "/admin/content" },
  { icon: ShoppingCart, name: "Orders", path: "/admin/orders" },
  { icon: Users, name: "Customers", path: "/admin/customers" },
];

const AdminLayout = () => {
  const location = useLocation();
  const { toast } = useToast();
  const {
    adminCheckError,
    adminMembership,
    hasConfig,
    isAdmin,
    isAdminLoading,
    isAuthLoading,
    signOut,
    user,
  } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();

    if (error) {
      toast({
        description: error.message,
        title: "Could not sign out",
        variant: "destructive",
      });
      return;
    }

    setSidebarOpen(false);
  };

  if (!hasConfig) {
    return (
      <div className="min-h-screen bg-background px-6 py-16">
        <div className="max-w-xl mx-auto">
          <SupabaseSetupCard
            body="The admin area now uses Supabase auth plus Supabase tables. Configure the frontend keys, then run the SQL bootstrap so admin data and policies exist."
            title="Supabase Configuration Required"
          />
        </div>
      </div>
    );
  }

  if (isAuthLoading || (user && isAdminLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="border border-border p-6 text-sm font-light text-muted-foreground">
          Checking admin access...
        </div>
      </div>
    );
  }

  if (!user) {
    const redirectPath = `${location.pathname}${location.search}${location.hash}` || "/admin";

    return (
      <div className="min-h-screen bg-background px-6 py-16">
        <div className="max-w-xl mx-auto">
          <EmailAuthCard
            body="Sign in with your admin email to load the Supabase-backed admin console. Access is granted only to users listed in the `admin_users` table."
            redirectPath={redirectPath}
            submitLabel="Email me an admin sign-in link"
            title="Admin Sign In"
          />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    const body = adminCheckError
      ? `${adminCheckError} Run supabase/bootstrap.sql and make sure the signed-in user has an admin_users row.`
      : `You are signed in as ${user.email}. Add this user to the Supabase admin_users table and try again.`;

    return (
      <div className="min-h-screen bg-background px-6 py-16">
        <div className="max-w-xl mx-auto border border-border bg-background p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Admin access denied</p>
            <h1 className="text-2xl font-light text-foreground">
              {adminCheckError ? "Admin access could not be verified." : "This account is not in admin_users."}
            </h1>
            <p className="text-sm font-light text-muted-foreground">{body}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="rounded-none" variant="outline">
              <Link to="/">Back to Store</Link>
            </Button>
            <Button className="rounded-none bg-foreground text-background hover:bg-foreground/90" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-background border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link className="text-lg font-light tracking-wider" to="/admin">
            GOOJ Admin
          </Link>
          <button className="lg:hidden p-1" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {adminLinks.map((link) => {
            const isActive = location.pathname === link.path;

            return (
              <Link
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-light rounded-md transition-colors",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
                key={link.path}
                onClick={() => setSidebarOpen(false)}
                to={link.path}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border space-y-3">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{adminMembership?.role}</p>
            <p className="text-sm font-light text-foreground truncate">{user.email}</p>
          </div>
          <Button className="w-full rounded-none" onClick={handleSignOut} variant="outline">
            Sign out
          </Button>
          <Link className="block text-xs text-muted-foreground hover:text-foreground transition-colors font-light" to="/">
            ← Back to Store
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 sticky top-0 bg-background z-30">
          <div className="flex items-center min-w-0">
            <button className="lg:hidden p-2 mr-4" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-light text-muted-foreground">
              {adminLinks.find((link) => link.path === location.pathname)?.name || "Admin"}
            </span>
          </div>
          <p className="hidden sm:block text-xs text-muted-foreground truncate ml-6">{user.email}</p>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
