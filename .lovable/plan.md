

## Plan: Adapt Website to GOOJ Client Needs

This is a large content and feature update based on the GOOJ overview document. The site currently has leftover jewelry/LINEA references and needs several new features for the gift box business model. The site will be wrapped as a mobile app (Capacitor) and needs an admin panel.

### Part 1: Fix Remaining Old Brand References (Copy Updates)

Several pages still have jewelry/LINEA content that was never rebranded:

**`src/components/category/ProductGrid.tsx`**
- Change all product names from jewelry names (Pantheon, Eclipse, etc.) to gift box names (The Birthday Box, The Pamper Box, etc.)
- Change categories from "Earrings"/"Bracelets" to "Gift Boxes"/"Luxury Boxes"
- Change prices from € to £ and use realistic gift box pricing (£35–£120)

**`src/components/product/ProductInfo.tsx`**
- Replace breadcrumb "Earrings > Pantheon" with "Gift Boxes > The Birthday Box"
- Replace product title, category, price (£2,250 → £65)
- Replace Material/Dimensions/Weight with gift box details: "What's Inside", "Box Size", "Personalisation Options"
- Replace editor's notes with GOOJ-appropriate copy

**`src/components/product/ProductDescription.tsx`**
- Replace jewelry description with gift box description
- Replace Product Details (SKU, Collection, Closure, Hypoallergenic) with gift box details (Occasion, Contents, Box Material)
- Replace Care & Cleaning with "Delivery & Returns"
- Update review text from jewelry reviews to gift box reviews

**`src/pages/ProductDetail.tsx`**
- Change "Our other Earrings" to "More Gift Boxes"
- Update breadcrumb from "Earrings > Pantheon" to "Gift Boxes > The Birthday Box"

**`src/pages/about/CustomerCare.tsx`**
- Replace "jewelry needs" with "gifting needs"
- Update phone to UK format, email to hello@gooj.co.uk
- Rewrite FAQs: remove jewelry-specific (resizing, authenticity, gemstones), add gift box FAQs (personalisation, delivery, what's in the box, returns on personalised items)
- Remove "LINEA" references

**`src/pages/about/SizeGuide.tsx`**
- Replace entirely — ring/bracelet sizing is irrelevant. Rename to "Gift Guide" and provide guidance on choosing the right box for the occasion

**`src/pages/about/StoreLocator.tsx`**
- Replace US LINEA stores with GOOJ info: online-only with a UK warehouse/showroom, or remove page
- Update services to gift-relevant: "Gift Wrapping", "Personalisation", "Corporate Gifting"

**`src/components/about/AboutSidebar.tsx`**
- Rename "Size Guide" to "Gift Guide"

### Part 2: Navigation & Routing Updates

**`src/App.tsx`**
- Rename route `/about/size-guide` to `/about/gift-guide`

**`src/components/header/Navigation.tsx`**
- Rename "Size Guide" submenu item to "Gift Guide"

### Part 3: Update Product Detail to Use Dynamic Data

**`src/pages/ProductDetail.tsx`** and **`src/components/product/ProductInfo.tsx`**
- Make product info dynamic based on `productId` param — use a mock data map so different product pages show different gift box names, prices, and descriptions

### Part 4: Add Date Reminder / Calendar Feature

Per the document: "online calendar for date reminders" is a key differentiator.

**New page: `src/pages/DateReminders.tsx`**
- Simple form to save important dates (birthdays, anniversaries)
- Date picker, recipient name, occasion type, optional notes
- Stored in localStorage for now (backend later)
- List of saved reminders with edit/delete
- This will power push notifications in the mobile app later

**`src/App.tsx`** — add route `/reminders`

**`src/components/header/Navigation.tsx`** — add "Reminders" or "My Dates" link in nav (could be an icon like a calendar in the header icons)

**`src/components/footer/Footer.tsx`** — add "Date Reminders" link

### Part 5: Admin Panel Foundation

Create a basic admin panel at `/admin` with sidebar navigation and placeholder pages:

**New files:**
- `src/pages/admin/AdminLayout.tsx` — layout with sidebar nav
- `src/pages/admin/AdminDashboard.tsx` — overview/stats
- `src/pages/admin/AdminProducts.tsx` — manage gift boxes (add/edit/remove)
- `src/pages/admin/AdminPromotions.tsx` — manage promotions/discount codes
- `src/pages/admin/AdminContent.tsx` — manage homepage content, copy, hero images
- `src/pages/admin/AdminOrders.tsx` — view orders

Each admin page will have:
- A data table or card grid showing items
- Add/Edit forms in dialogs
- Delete confirmation
- Mock data for now (backend integration later with Supabase)

**`src/App.tsx`** — add admin routes

The admin panel will use the existing shadcn Sidebar component pattern.

### Part 6: Mobile-First Considerations

- Ensure all new pages (Date Reminders, Admin) are fully responsive
- Admin panel uses collapsible sidebar on mobile
- Date Reminders page optimised for quick mobile input (large touch targets)
- All new features work within a Capacitor webview

### Summary of Files to Create/Edit

| File | Action |
|------|--------|
| `src/components/category/ProductGrid.tsx` | Edit — rebrand products |
| `src/components/product/ProductInfo.tsx` | Edit — gift box details |
| `src/components/product/ProductDescription.tsx` | Edit — gift box content |
| `src/pages/ProductDetail.tsx` | Edit — dynamic data, copy |
| `src/pages/about/CustomerCare.tsx` | Edit — rebrand to GOOJ |
| `src/pages/about/SizeGuide.tsx` | Edit — rename to Gift Guide |
| `src/pages/about/StoreLocator.tsx` | Edit — UK-based, GOOJ |
| `src/components/about/AboutSidebar.tsx` | Edit — rename link |
| `src/components/header/Navigation.tsx` | Edit — rename submenu |
| `src/components/footer/Footer.tsx` | Edit — add reminders link |
| `src/App.tsx` | Edit — new routes |
| `src/pages/DateReminders.tsx` | Create — calendar reminders |
| `src/pages/admin/AdminLayout.tsx` | Create |
| `src/pages/admin/AdminDashboard.tsx` | Create |
| `src/pages/admin/AdminProducts.tsx` | Create |
| `src/pages/admin/AdminPromotions.tsx` | Create |
| `src/pages/admin/AdminContent.tsx` | Create |
| `src/pages/admin/AdminOrders.tsx` | Create |

