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
export const MOCK_DRUG_DATABASE = [
  { scientificName: 'Amoxicillin', categoryId: 'cat1', tradeNames: ['Amoxil', 'Trimox'], unit: 'Capsule' },
  { scientificName: 'Paracetamol', categoryId: 'cat2', tradeNames: ['Panadol', 'Adol', 'Revanin'], unit: 'Tablet' },
  { scientificName: 'Ibuprofen', categoryId: 'cat2', tradeNames: ['Advil', 'Brufen'], unit: 'Tablet' },
  { scientificName: 'Cholecalciferol', categoryId: 'cat3', tradeNames: ['Vitamin D3', 'Biodal'], unit: 'Bottle' },
  { scientificName: 'Hyaluronic Acid', categoryId: 'cat4', tradeNames: ['Vichy Lift', 'HydroBoost'], unit: 'Cream' },
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
    taxRate: 0,
    discountRate: 0,
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
    taxRate: 0,
    discountRate: 0,
    stockQuantity: 15,
    unit: 'tablet',
    expiryDate: '2025-12-10',
    batchNumber: 'B-7741',
    minStockLevel: 30
  }
];
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    userId: 'u2',
    items: [{ productId: 'p1', quantity: 2, unitPrice: 15.50, taxAmount: 0, discountAmount: 0, subtotal: 31.00 }],
    subtotal: 31.00,
    taxTotal: 0,
    discountTotal: 0,
    totalAmount: 31.00,
    paymentMethod: 'card',
    status: 'completed',
    timestamp: Date.now() - 3600000
  }
];