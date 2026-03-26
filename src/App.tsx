import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

const Index = lazy(() => import("./pages/Index"));
const Category = lazy(() => import("./pages/Category"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OurStory = lazy(() => import("./pages/about/OurStory"));
const Sustainability = lazy(() => import("./pages/about/Sustainability"));
const GiftGuide = lazy(() => import("./pages/about/SizeGuide"));
const CustomerCare = lazy(() => import("./pages/about/CustomerCare"));
const StoreLocator = lazy(() => import("./pages/about/StoreLocator"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const DateReminders = lazy(() => import("./pages/DateReminders"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminPromotions = lazy(() => import("./pages/admin/AdminPromotions"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));

const queryClient = new QueryClient();
const routeFallback = <div className="min-h-screen bg-background" aria-hidden="true" />;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <ScrollToTop />
        <Suspense fallback={routeFallback}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/category/:category" element={<Category />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/about/our-story" element={<OurStory />} />
            <Route path="/about/sustainability" element={<Sustainability />} />
            <Route path="/about/gift-guide" element={<GiftGuide />} />
            <Route path="/about/customer-care" element={<CustomerCare />} />
            <Route path="/about/store-locator" element={<StoreLocator />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/reminders" element={<DateReminders />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="promotions" element={<AdminPromotions />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
