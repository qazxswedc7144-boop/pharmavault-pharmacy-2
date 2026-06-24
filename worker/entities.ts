import { IndexedEntity } from "./core-utils";
import type { 
  Product, Supplier, Category, User, Transaction, 
  PurchaseOrder, Account, JournalEntry, Expense, Alert, Customer 
} from "@shared/types";
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
    price: 0, costPrice: 0, taxRate: 0, discountRate: 0, stockQuantity: 0, unit: "",
    expiryDate: "", batchNumber: "", minStockLevel: 0
  };
  static seedData = MOCK_PRODUCTS.map(p => ({ ...p, taxRate: 0, discountRate: 0 }));
}
export class SupplierEntity extends IndexedEntity<Supplier> {
  static readonly entityName = "supplier";
  static readonly indexName = "suppliers";
  static readonly initialState: Supplier = {
    id: "", name: "", contactPerson: "", email: "", phone: "", address: ""
  };
  static seedData = MOCK_SUPPLIERS;
}
export class CustomerEntity extends IndexedEntity<Customer> {
  static readonly entityName = "customer";
  static readonly indexName = "customers";
  static readonly initialState: Customer = {
    id: "", name: "", email: "", phone: "", creditLimit: 0, currentBalance: 0
  };
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
    id: "", userId: "", items: [], subtotal: 0, taxTotal: 0, discountTotal: 0, 
    totalAmount: 0, paymentMethod: 'cash', status: 'pending', timestamp: 0
  };
}
export class PurchaseOrderEntity extends IndexedEntity<PurchaseOrder> {
  static readonly entityName = "purchase_order";
  static readonly indexName = "purchase_orders";
  static readonly initialState: PurchaseOrder = {
    id: "", supplierId: "", items: [], totalCost: 0, status: 'pending', timestamp: 0
  };
}
export class AccountEntity extends IndexedEntity<Account> {
  static readonly entityName = "account";
  static readonly indexName = "accounts";
  static readonly initialState: Account = {
    id: "", name: "", code: "", type: 'asset', balance: 0
  };
  static seedData: Account[] = [
    { id: 'acc-cash', name: 'Cash on Hand', code: '1001', type: 'asset', balance: 5000 },
    { id: 'acc-bank', name: 'Pharmacy Bank Account', code: '1002', type: 'asset', balance: 25000 },
    { id: 'acc-inv', name: 'Inventory Assets', code: '1200', type: 'asset', balance: 0 },
    { id: 'acc-sales', name: 'Medication Sales', code: '4001', type: 'revenue', balance: 0 },
    { id: 'acc-cogs', name: 'Cost of Goods Sold', code: '5001', type: 'expense', balance: 0 },
    { id: 'acc-rent', name: 'Pharmacy Rent', code: '6001', type: 'expense', balance: 0 }
  ];
}
export class JournalEntryEntity extends IndexedEntity<JournalEntry> {
  static readonly entityName = "journal_entry";
  static readonly indexName = "journal_entries";
  static readonly initialState: JournalEntry = {
    id: "", date: 0, description: "", referenceId: "", items: []
  };
}
export class ExpenseEntity extends IndexedEntity<Expense> {
  static readonly entityName = "expense";
  static readonly indexName = "expenses";
  static readonly initialState: Expense = {
    id: "", date: 0, accountId: "", paymentAccountId: "", amount: 0, category: "", description: "", status: 'pending'
  };
}
export class AlertEntity extends IndexedEntity<Alert> {
  static readonly entityName = "alert";
  static readonly indexName = "alerts";
  static readonly initialState: Alert = {
    id: "", type: 'stock', productId: "", message: "", severity: 'medium', status: 'active', timestamp: 0
  };
}