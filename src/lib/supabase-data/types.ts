export interface ReminderRecord {
  createdAt: string;
  date: string;
  id: string;
  name: string;
  notes: string;
  occasion: string;
  updatedAt: string;
}

export interface ReminderInput {
  date: string;
  id?: string;
  name: string;
  notes: string;
  occasion: string;
}

export interface AdminProductRecord {
  active: boolean;
  category: string;
  createdAt: string;
  description: string;
  id: string;
  name: string;
  price: string;
  pricePence: number;
  updatedAt: string;
}

export interface AdminProductInput {
  category: string;
  description: string;
  name: string;
  price: string;
}

export interface AdminPromotionRecord {
  active: boolean;
  code: string;
  createdAt: string;
  discount: string;
  expiresAt: string;
  id: string;
  type: string;
  updatedAt: string;
}

export interface AdminPromotionInput {
  code: string;
  discount: string;
  expiresAt: string;
  type: string;
}

export interface AdminContentBlockRecord {
  body: string;
  createdAt: string;
  id: string;
  section: string;
  sortOrder: number;
  title: string;
  updatedAt: string;
}

export interface AdminOrderRecord {
  createdAt: string;
  customerEmail: string;
  customerId: string | null;
  customerName: string;
  id: string;
  items: string;
  orderDate: string;
  orderNumber: string;
  personalised: boolean;
  status: string;
  total: string;
  totalPence: number;
  updatedAt: string;
}

export interface AdminCustomerRecord {
  createdAt: string;
  dateJoined: string;
  email: string;
  fullName: string;
  id: string;
  lastOrderAt: string | null;
  ordersCount: number;
  totalSpent: string;
  totalSpentPence: number;
  updatedAt: string;
}
