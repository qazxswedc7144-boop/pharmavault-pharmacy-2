import { Hono } from "hono";
import type { Env } from './core-utils';
import {
  ProductEntity,
  SupplierEntity,
  CategoryEntity,
  UserEntity,
  TransactionEntity,
  PurchaseOrderEntity,
  AccountEntity,
  JournalEntryEntity,
  ExpenseEntity
} from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { Transaction, PurchaseOrder, Expense, Account, JournalEntry } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Stats & Dashboards
  app.get('/api/stats', async (c) => {
    await ProductEntity.ensureSeed(c.env);
    await AccountEntity.ensureSeed(c.env);
    const products = await ProductEntity.list(c.env);
    const transactions = await TransactionEntity.list(c.env, null, 100);
    const lowStock = products.items.filter(p => p.stockQuantity <= p.minStockLevel).length;
    const totalSales = transactions.items.reduce((acc, t) => acc + t.totalAmount, 0);
    return ok(c, {
      totalSales,
      totalOrders: transactions.items.length,
      lowStockItems: lowStock,
      expiredSoonCount: 0,
      recentSales: transactions.items.slice(0, 10)
    });
  });
  // Inventory
  app.get('/api/products', async (c) => {
    await ProductEntity.ensureSeed(c.env);
    const cursor = c.req.query('cursor');
    const limit = c.req.query('limit');
    return ok(c, await ProductEntity.list(c.env, cursor ?? null, limit ? Number(limit) : 100));
  });
  app.post('/api/products', async (c) => {
    const data = await c.req.json();
    const product = await ProductEntity.create(c.env, { ...data, id: crypto.randomUUID() });
    return ok(c, product);
  });
  app.put('/api/products/:id', async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json();
    const entity = new ProductEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c);
    await entity.patch(data);
    return ok(c, await entity.getState());
  });
  // POS / Transactions with Accounting Integration
  app.post('/api/transactions', async (c) => {
    const data = await c.req.json() as Transaction;
    if (!data.items?.length) return bad(c, 'items required');
    const transaction = await TransactionEntity.create(c.env, {
      ...data,
      id: data.id || crypto.randomUUID(),
      timestamp: data.timestamp || Date.now()
    });
    // 1. Update Inventory Levels
    for (const item of data.items) {
      const pEnt = new ProductEntity(c.env, item.productId);
      if (await pEnt.exists()) {
        await pEnt.mutate(s => ({ ...s, stockQuantity: Math.max(0, s.stockQuantity - item.quantity) }));
      }
    }
    // 2. Double-Entry Accounting
    const cashAcc = new AccountEntity(c.env, 'acc-cash');
    const salesAcc = new AccountEntity(c.env, 'acc-sales');
    await cashAcc.mutate(s => ({ ...s, balance: s.balance + transaction.totalAmount }));
    await salesAcc.mutate(s => ({ ...s, balance: s.balance + transaction.totalAmount }));
    await JournalEntryEntity.create(c.env, {
      id: crypto.randomUUID(),
      date: Date.now(),
      description: `Sale - Invoice #${transaction.id.slice(0, 8)}`,
      referenceId: transaction.id,
      items: [
        { accountId: 'acc-cash', debit: transaction.totalAmount, credit: 0 },
        { accountId: 'acc-sales', debit: 0, credit: transaction.totalAmount }
      ]
    });
    return ok(c, transaction);
  });
  // Purchases
  app.get('/api/purchases', async (c) => ok(c, await PurchaseOrderEntity.list(c.env)));
  app.post('/api/purchases', async (c) => {
    const data = await c.req.json() as PurchaseOrder;
    const order = await PurchaseOrderEntity.create(c.env, { ...data, id: crypto.randomUUID(), timestamp: Date.now() });
    if (order.status === 'received') {
      const invAcc = new AccountEntity(c.env, 'acc-inv');
      const cashAcc = new AccountEntity(c.env, 'acc-cash');
      await invAcc.mutate(s => ({ ...s, balance: s.balance + order.totalCost }));
      await cashAcc.mutate(s => ({ ...s, balance: s.balance - order.totalCost }));
      await JournalEntryEntity.create(c.env, {
        id: crypto.randomUUID(),
        date: Date.now(),
        description: `Purchase - Order #${order.id.slice(0, 8)}`,
        referenceId: order.id,
        items: [
          { accountId: 'acc-inv', debit: order.totalCost, credit: 0 },
          { accountId: 'acc-cash', debit: 0, credit: order.totalCost }
        ]
      });
      for (const item of order.items) {
        const pEnt = new ProductEntity(c.env, item.productId);
        if (await pEnt.exists()) {
          await pEnt.mutate(s => ({ ...s, stockQuantity: s.stockQuantity + item.quantity, costPrice: item.costPrice }));
        }
      }
    }
    return ok(c, order);
  });
  // Accounts
  app.get('/api/accounts', async (c) => {
    await AccountEntity.ensureSeed(c.env);
    return ok(c, await AccountEntity.list(c.env));
  });
  app.post('/api/accounts', async (c) => {
    const data = await c.req.json() as Account;
    const account = await AccountEntity.create(c.env, { ...data, id: crypto.randomUUID() });
    return ok(c, account);
  });
  // Expenses
  app.get('/api/expenses', async (c) => ok(c, await ExpenseEntity.list(c.env)));
  app.post('/api/expenses', async (c) => {
    const data = await c.req.json() as Expense;
    const expense = await ExpenseEntity.create(c.env, { 
      ...data, 
      id: crypto.randomUUID(), 
      date: data.date || Date.now() 
    });
    if (expense.status === 'paid') {
      const expAcc = new AccountEntity(c.env, expense.accountId);
      const payAcc = new AccountEntity(c.env, expense.paymentAccountId);
      await expAcc.mutate(s => ({ ...s, balance: s.balance + expense.amount }));
      await payAcc.mutate(s => ({ ...s, balance: s.balance - expense.amount }));
      await JournalEntryEntity.create(c.env, {
        id: crypto.randomUUID(),
        date: Date.now(),
        description: `Expense: ${expense.description}`,
        referenceId: expense.id,
        items: [
          { accountId: expense.accountId, debit: expense.amount, credit: 0 },
          { accountId: expense.paymentAccountId, debit: 0, credit: expense.amount }
        ]
      });
    }
    return ok(c, expense);
  });
  // Suppliers & Categories
  app.get('/api/suppliers', async (c) => { await SupplierEntity.ensureSeed(c.env); return ok(c, await SupplierEntity.list(c.env)); });
  app.get('/api/categories', async (c) => { await CategoryEntity.ensureSeed(c.env); return ok(c, await CategoryEntity.list(c.env)); });
  app.get('/api/users', async (c) => { await UserEntity.ensureSeed(c.env); return ok(c, await UserEntity.list(c.env)); });
}