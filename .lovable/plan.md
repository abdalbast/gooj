

## Plan: 5 Production-Ready Improvements

Implementing all 5 recommendations from the previous analysis. Changes auto-sync to GitHub — no manual git push needed.

---

### 1. Centralized Dynamic Product Data

**Problem**: `ProductGrid.tsx` and `ProductCarousel.tsx` define their own duplicate product arrays instead of using `src/lib/productData.ts`.

**Changes**:
- **`src/lib/productData.ts`** — Expand the products record to include all 24 products currently hardcoded in `ProductGrid.tsx` (ids 7-24), adding `isNew` field to the `ProductData` interface
- **`src/components/category/ProductGrid.tsx`** — Remove local product array, import from `productData.ts`, convert record to array
- **`src/components/content/ProductCarousel.tsx`** — Remove local product array, import from `productData.ts`
- **`src/pages/Checkout.tsx`** — Import product images/data from `productData.ts` instead of direct asset imports

### 2. Cart State Management (React Context + localStorage)

**Create `src/contexts/CartContext.tsx`**:
- `CartProvider` wrapping the app with context providing: `cartItems`, `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `totalItems`, `subtotal`
- Persist to `localStorage` on every change, hydrate on mount
- Cart item type includes personalisation fields (photo, message, handwrittenNote)

**Updates**:
- **`src/App.tsx`** — Wrap app in `<CartProvider>`
- **`src/components/header/Navigation.tsx`** — Replace local `cartItems` state with `useCart()` hook
- **`src/components/header/ShoppingBag.tsx`** — Use `useCart()` instead of props for cart data
- **`src/components/product/ProductInfo.tsx`** — "Add to Bag" button calls `addToCart()` with product data + personalisation
- **`src/pages/Checkout.tsx`** — Replace mock cart data with `useCart()`, show real cart contents

### 3. Mobile & Capacitor Polish

**Updates across multiple files**:
- **`src/index.css`** — Add `env(safe-area-inset-*)` padding to body for notch/home-bar devices
- **`src/components/header/Navigation.tsx`** — Increase mobile touch targets to min 44px, add safe-area padding
- **`src/components/footer/Footer.tsx`** — Add bottom safe-area padding
- **`src/pages/Checkout.tsx`** — Ensure form inputs are 16px+ font (prevents iOS zoom), increase button heights on mobile
- **`src/pages/DateReminders.tsx`** — Larger touch targets for date inputs

### 4. SEO & Metadata

**Install**: `react-helmet-async`

**Create `src/components/SEO.tsx`**:
- Reusable component accepting `title`, `description`, `ogImage`, `ogType`, `canonicalUrl`
- Renders `<Helmet>` with meta tags, Open Graph, Twitter cards

**Updates**:
- **`src/App.tsx`** — Wrap in `<HelmetProvider>`
- **`src/pages/Index.tsx`** — Add `<SEO title="GOOJ | Thoughtful Gifting Made Easy" ... />`
- **`src/pages/ProductDetail.tsx`** — Dynamic SEO with product name, description, price
- **`src/pages/Category.tsx`** — Category-specific SEO
- **`src/pages/Checkout.tsx`** — `noindex` meta tag
- All about pages — page-specific titles/descriptions
- **`index.html`** — Add default meta description, charset, viewport (already exists), lang attribute

### 5. Error Handling & Loading States

**Create `src/components/ErrorBoundary.tsx`**:
- Class component catching render errors, showing a clean "Something went wrong" fallback with a retry button

**Create `src/components/ProductCardSkeleton.tsx`**:
- Skeleton loading card matching the product card layout (aspect-square + 2 text lines)

**Updates**:
- **`src/App.tsx`** — Wrap `<Routes>` in `<ErrorBoundary>`
- **`src/components/category/ProductGrid.tsx`** — Add empty state when no products match filters ("No gift boxes found")
- **`src/pages/ProductDetail.tsx`** — Show fallback if `productId` doesn't match any product (redirect to 404 or show "Product not found")
- **`src/pages/NotFound.tsx`** — Ensure it has a proper "Back to Home" CTA

---

### Implementation Order
1. Centralized product data (foundation for everything else)
2. Cart context (depends on centralized data)
3. SEO & metadata
4. Error handling & loading states
5. Mobile & Capacitor polish

### Files Summary

| Action | Files |
|--------|-------|
| Create | `src/contexts/CartContext.tsx`, `src/components/SEO.tsx`, `src/components/ErrorBoundary.tsx`, `src/components/ProductCardSkeleton.tsx` |
| Edit | `src/lib/productData.ts`, `src/App.tsx`, `src/components/category/ProductGrid.tsx`, `src/components/content/ProductCarousel.tsx`, `src/components/header/Navigation.tsx`, `src/components/header/ShoppingBag.tsx`, `src/components/product/ProductInfo.tsx`, `src/pages/Checkout.tsx`, `src/pages/ProductDetail.tsx`, `src/pages/Index.tsx`, `src/pages/Category.tsx`, `src/pages/NotFound.tsx`, `src/pages/DateReminders.tsx`, `src/components/footer/Footer.tsx`, `src/index.css`, `index.html` |
| Install | `react-helmet-async` |

