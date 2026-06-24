import { IndexedEntity } from "./core-utils";
import type { Product, Supplier, Category, User, Transaction, PurchaseOrder } from "@shared/types";
import {
  MOCK_PRODUCTS,
  MOCK_SUPPLIERS,
  MOCK_CATEGORIES,
  MOCK_USERS,
  MOCK_TRANSACTIONS
} from "@shared/mock-data";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "", role: 'viewer' };
  static seedData = MOCK_USERS;
}
export class ProductEntity extends IndexedEntity<Product> {
  static readonly entityName = "product";
  static readonly indexName = "products";
  static readonly initialState: Product = {
    id: "", name: "", sku: "", categoryId: "", supplierId: "",
    price: 0, costPrice: 0, stockQuantity: 0, unit: "",
    expiryDate: "", batchNumber: "", minStockLevel: 0
  };
  static seedData = MOCK_PRODUCTS;
}
export class SupplierEntity extends IndexedEntity<Supplier> {
  static readonly entityName = "supplier";
  static readonly indexName = "suppliers";
  static readonly initialState: Supplier = {
    id: "", name: "", contactPerson: "", email: "", phone: "", address: ""
  };
  static seedData = MOCK_SUPPLIERS;
}
export class CategoryEntity extends IndexedEntity<Category> {
  static readonly entityName = "category";
  static readonly indexName = "categories";
  static readonly initialState: Category = { id: "", name: "" };
  static seedData = MOCK_CATEGORIES;
}
export class TransactionEntity extends IndexedEntity<Transaction> {
  static readonly entityName = "transaction";
  static readonly indexName = "transactions";
  static readonly initialState: Transaction = {
    id: "", userId: "", items: [], totalAmount: 0, paymentMethod: 'cash',
    status: 'pending', timestamp: 0
  };
  static seedData = MOCK_TRANSACTIONS;
}
export class PurchaseOrderEntity extends IndexedEntity<PurchaseOrder> {
  static readonly entityName = "purchase_order";
  static readonly indexName = "purchase_orders";
  static readonly initialState: PurchaseOrder = {
    id: "", supplierId: "", items: [], totalCost: 0, status: 'pending', timestamp: 0
  };
}