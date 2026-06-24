export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'pharmacist' | 'viewer';
}
export interface Category {
  id: string;
  name: string;
  description?: string;
}
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}
export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  supplierId: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  unit: string;
  expiryDate: string;
  batchNumber: string;
  minStockLevel: number;
}
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}
export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
export interface Transaction {
  id: string;
  customerId?: string;
  userId: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  status: 'completed' | 'pending' | 'cancelled';
  timestamp: number;
}
export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  lowStockItems: number;
  expiredSoonCount: number;
  recentSales: Transaction[];
}