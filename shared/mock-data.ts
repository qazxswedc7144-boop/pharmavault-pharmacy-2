import type { Product, Supplier, Category, User, Transaction } from './types';
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Dr. Sarah Smith', role: 'admin' },
  { id: 'u2', name: 'Mark Johnson', role: 'pharmacist' }
];
export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Antibiotics', description: 'Bacterial infection treatments' },
  { id: 'cat2', name: 'Painkillers', description: 'Pain relief medications' },
  { id: 'cat3', name: 'Supplements', description: 'Vitamins and minerals' },
  { id: 'cat4', name: 'Skincare', description: 'Dermatological products' }
];
export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'sup1',
    name: 'PharmaDist Co.',
    contactPerson: 'Alice Wong',
    email: 'contact@pharmadist.com',
    phone: '555-0101',
    address: '123 Supply Ave, Warehouse City'
  },
  {
    id: 'sup2',
    name: 'Global Meds',
    contactPerson: 'Bob Miller',
    email: 'info@globalmeds.net',
    phone: '555-0202',
    address: '456 Pharma Rd, Science Park'
  }
];
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Amoxicillin 500mg',
    sku: 'AMX-500',
    categoryId: 'cat1',
    supplierId: 'sup1',
    price: 15.50,
    costPrice: 8.20,
    stockQuantity: 120,
    unit: 'capsule',
    expiryDate: '2026-05-20',
    batchNumber: 'B-9982',
    minStockLevel: 20
  },
  {
    id: 'p2',
    name: 'Ibuprofen 200mg',
    sku: 'IBU-200',
    categoryId: 'cat2',
    supplierId: 'sup2',
    price: 8.99,
    costPrice: 3.50,
    stockQuantity: 15,
    unit: 'tablet',
    expiryDate: '2025-12-10',
    batchNumber: 'B-7741',
    minStockLevel: 30
  },
  {
    id: 'p3',
    name: 'Vitamin D3 1000IU',
    sku: 'VIT-D3',
    categoryId: 'cat3',
    supplierId: 'sup1',
    price: 12.00,
    costPrice: 5.00,
    stockQuantity: 45,
    unit: 'bottle',
    expiryDate: '2027-01-15',
    batchNumber: 'B-4420',
    minStockLevel: 10
  },
  {
    id: 'p4',
    name: 'Sunscreen SPF 50',
    sku: 'SKN-SPF',
    categoryId: 'cat4',
    supplierId: 'sup2',
    price: 25.00,
    costPrice: 12.00,
    stockQuantity: 5,
    unit: 'tube',
    expiryDate: '2024-08-30',
    batchNumber: 'B-1122',
    minStockLevel: 15
  }
];
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    userId: 'u2',
    items: [{ productId: 'p1', quantity: 2, unitPrice: 15.50, subtotal: 31.00 }],
    totalAmount: 31.00,
    paymentMethod: 'card',
    status: 'completed',
    timestamp: Date.now() - 3600000
  },
  {
    id: 't2',
    userId: 'u2',
    items: [{ productId: 'p2', quantity: 1, unitPrice: 8.99, subtotal: 8.99 }],
    totalAmount: 8.99,
    paymentMethod: 'cash',
    status: 'completed',
    timestamp: Date.now() - 7200000
  }
];