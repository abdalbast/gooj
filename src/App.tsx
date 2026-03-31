import { Suspense, lazy } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

const Toaster = lazy(() =>
  import("@/components/ui/toaster").then((module) => ({
    default: module.Toaster,
  })),
);
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
const AuthLayout = lazy(() => import("./routes/AuthLayout"));
const DateReminders = lazy(() => import("./pages/DateReminders"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPerformance = lazy(() => import("./pages/admin/AdminPerformance"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminPromotions = lazy(() => import("./pages/admin/AdminPromotions"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));

const routeFallback = <div className="min-h-screen bg-background" aria-hidden="true" />;

const App = () => (
  <TooltipProvider>
    <Suspense fallback={null}>
      <Toaster />
    </Suspense>
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
          <Route element={<AuthLayout />}>
            <Route path="/reminders" element={<DateReminders />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="performance" element={<AdminPerformance />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="promotions" element={<AdminPromotions />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
            </Route>
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
