

## Plan: Production-Ready Admin Panel

All four improvements applied across the admin suite.

### 1. New Admin Customers Page

**Create `src/pages/admin/AdminCustomers.tsx`**
- Table with columns: Name, Email, Orders, Total Spent, Last Order, Date Joined
- Mock data for 8-10 customers
- Search bar filtering by name/email
- Click row to expand/view detail (or a simple dialog showing order history)

**Update `src/pages/admin/AdminLayout.tsx`**
- Add "Customers" link with `Users` icon to sidebar nav

**Update `src/App.tsx`**
- Add `/admin/customers` route

### 2. Dashboard Analytics & Charts

**Update `src/pages/admin/AdminDashboard.tsx`**
- Add a revenue line chart (last 7 days) using `recharts` (`LineChart`)
- Add an orders-by-status donut/pie chart (`PieChart`)
- Use the existing shadcn chart wrapper (`src/components/ui/chart.tsx`) which already wraps recharts
- Charts sit in a 2-column grid below the stat cards
- Keep the recent orders table beneath

### 3. Search, Filters & Pagination on All Tables

**Update `AdminOrders.tsx`**
- Search input filtering by order ID or customer name
- Status filter dropdown (All, Processing, Shipped, Delivered)
- Pagination (5 per page) with prev/next buttons

**Update `AdminProducts.tsx`**
- Search input filtering by product name
- Category filter dropdown
- Pagination

**Update `AdminPromotions.tsx`**
- Search input filtering by code
- Status filter (All, Active, Inactive)

**Update `AdminCustomers.tsx`** (new page, built with these from the start)

### 4. Form Validation & Toast Feedback

**All admin pages with forms (Products, Promotions, Content, Customers)**
- Required field indicators and inline error messages (red text below empty required fields on submit)
- Price format validation (must start with £ and contain a number)
- Promo code validation (uppercase, no spaces)
- Toast notifications via `useToast` on: save success, delete success, validation error

### Files Summary

| File | Action |
|------|--------|
| `src/pages/admin/AdminCustomers.tsx` | Create |
| `src/pages/admin/AdminDashboard.tsx` | Edit — add charts |
| `src/pages/admin/AdminOrders.tsx` | Edit — search, filter, pagination |
| `src/pages/admin/AdminProducts.tsx` | Edit — search, filter, pagination, validation, toasts |
| `src/pages/admin/AdminPromotions.tsx` | Edit — search, filter, validation, toasts |
| `src/pages/admin/AdminContent.tsx` | Edit — validation, toasts |
| `src/pages/admin/AdminLayout.tsx` | Edit — add Customers link |
| `src/App.tsx` | Edit — add customers route |

