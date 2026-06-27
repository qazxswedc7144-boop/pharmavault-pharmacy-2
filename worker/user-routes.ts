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
  ExpenseEntity,
  CustomerEntity
} from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { Transaction, PurchaseOrder, Expense, Account, Product, Supplier, Category, Customer } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Stats & Analytics
  app.get('/api/stats', async (c) => {
    await ProductEntity.ensureSeed(c.env);
    await AccountEntity.ensureSeed(c.env);
    const products = await ProductEntity.list(c.env);
    const transactions = await TransactionEntity.list(c.env, null, 10);
    const lowStock = products.items.filter(p => p.stockQuantity <= p.minStockLevel).length;
    const totalSales = transactions.items.reduce((acc, t) => acc + t.totalAmount, 0);
    return ok(c, {
      totalSales,
      totalOrders: transactions.items.length,
      lowStockItems: lowStock,
      expiredSoonCount: 0,
      recentSales: transactions.items
    });
  });
  app.get('/api/reports/analytics', async (c) => {
    const products = await ProductEntity.list(c.env);
    const transactions = await TransactionEntity.list(c.env, null, 1000);
    const categories = await CategoryEntity.list(c.env);
    const inventoryValue = products.items.reduce((acc, p) => acc + (p.stockQuantity * p.costPrice), 0);
    const totalRevenue = transactions.items.reduce((acc, t) => acc + t.totalAmount, 0);
    const totalCost = transactions.items.reduce((acc, t) => {
      return acc + t.items.reduce((iAcc, item) => {
        const prod = products.items.find(p => p.id === item.productId);
        return iAcc + (item.quantity * (prod?.costPrice || 0));
      }, 0);
    }, 0);
    const catDist = categories.items.map(cat => {
      const catProds = products.items.filter(p => p.categoryId === cat.id);
      const val = catProds.reduce((acc, p) => acc + (p.stockQuantity * p.costPrice), 0);
      return { category: cat.name, count: catProds.length, value: val };
    });
    return ok(c, {
      inventoryValue,
      revenueByDay: [],
      categoryDistribution: catDist,
      profitSummary: { revenue: totalRevenue, cost: totalCost, profit: totalRevenue - totalCost }
    });
  });
  // Inventory
  app.get('/api/products', async (c) => ok(c, await ProductEntity.list(c.env)));
  app.post('/api/products', async (c) => ok(c, await ProductEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.put('/api/products/:id', async (c) => {
    const ent = new ProductEntity(c.env, c.req.param('id'));
    if (!(await ent.exists())) return notFound(c);
    await ent.patch(await c.req.json());
    return ok(c, await ent.getState());
  });
  // Transactions
  app.post('/api/transactions', async (c) => {
    const data = await c.req.json() as Transaction;
    const transaction = await TransactionEntity.create(c.env, { ...data, id: data.id || crypto.randomUUID(), timestamp: Date.now() });
    for (const item of data.items) {
      const pEnt = new ProductEntity(c.env, item.productId);
      if (await pEnt.exists()) await pEnt.mutate(s => ({ ...s, stockQuantity: Math.max(0, s.stockQuantity - item.quantity) }));
    }
    const cashAcc = new AccountEntity(c.env, 'acc-cash');
    const salesAcc = new AccountEntity(c.env, 'acc-sales');
    await cashAcc.mutate(s => ({ ...s, balance: s.balance + transaction.totalAmount }));
    await salesAcc.mutate(s => ({ ...s, balance: s.balance + transaction.totalAmount }));
    await JournalEntryEntity.create(c.env, {
      id: crypto.randomUUID(), date: Date.now(), description: `Sale #${transaction.id.slice(0, 8)}`, referenceId: transaction.id,
      items: [{ accountId: 'acc-cash', debit: transaction.totalAmount, credit: 0 }, { accountId: 'acc-sales', debit: 0, credit: transaction.totalAmount }]
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
      for (const item of order.items) {
        const pEnt = new ProductEntity(c.env, item.productId);
        if (await pEnt.exists()) await pEnt.mutate(s => ({ ...s, stockQuantity: s.stockQuantity + item.quantity, costPrice: item.costPrice }));
      }
    }
    return ok(c, order);
  });
  // Accounts & Expenses
  app.get('/api/accounts', async (c) => ok(c, await AccountEntity.list(c.env)));
  app.post('/api/accounts', async (c) => ok(c, await AccountEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.get('/api/expenses', async (c) => ok(c, await ExpenseEntity.list(c.env)));
  app.post('/api/expenses', async (c) => {
    const data = await c.req.json() as Expense;
    const exp = await ExpenseEntity.create(c.env, { ...data, id: crypto.randomUUID(), date: data.date || Date.now() });
    if (exp.status === 'paid') {
      const srcAcc = new AccountEntity(c.env, exp.paymentAccountId);
      const dstAcc = new AccountEntity(c.env, exp.accountId);
      await srcAcc.mutate(s => ({ ...s, balance: s.balance - exp.amount }));
      await dstAcc.mutate(s => ({ ...s, balance: s.balance + exp.amount }));
    }
    return ok(c, exp);
  });
  // Suppliers & Categories CRUD
  app.get('/api/suppliers', async (c) => ok(c, await SupplierEntity.list(c.env)));
  app.post('/api/suppliers', async (c) => ok(c, await SupplierEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.put('/api/suppliers/:id', async (c) => {
    const ent = new SupplierEntity(c.env, c.req.param('id'));
    if (!(await ent.exists())) return notFound(c);
    await ent.patch(await c.req.json());
    return ok(c, await ent.getState());
  });
  app.get('/api/categories', async (c) => ok(c, await CategoryEntity.list(c.env)));
  app.post('/api/categories', async (c) => ok(c, await CategoryEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.put('/api/categories/:id', async (c) => {
    const ent = new CategoryEntity(c.env, c.req.param('id'));
    if (!(await ent.exists())) return notFound(c);
    await ent.patch(await c.req.json());
    return ok(c, await ent.getState());
  });
  // Customer CRUD
  app.get('/api/customers', async (c) => ok(c, await CustomerEntity.list(c.env)));
  app.post('/api/customers', async (c) => {
    const data = await c.req.json() as Customer;
    const customer = await CustomerEntity.create(c.env, {
      ...data,
      id: data.id || crypto.randomUUID(),
      creditLimit: data.creditLimit || 0,
      currentBalance: data.currentBalance || 0
    });
    return ok(c, customer);
  });
  app.put('/api/customers/:id', async (c) => {
    const ent = new CustomerEntity(c.env, c.req.param('id'));
    if (!(await ent.exists())) return notFound(c);
    await ent.patch(await c.req.json());
    return ok(c, await ent.getState());
  });
}