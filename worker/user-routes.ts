import { Hono, MiddlewareHandler } from "hono";
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
  CustomerEntity,
  AlertEntity
} from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { Transaction, PurchaseOrder, Expense, Alert, JournalEntry, User, Account, Role } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const requireRole = (allowedRoles: Role[]): MiddlewareHandler => async (c, next) => {
    const role = c.req.header('x-user-role') as Role;
    if (!role || !allowedRoles.includes(role)) {
      return c.json({ success: false, error: 'غير مصرح لك بالوصول لهذا القسم (403)' }, 403);
    }
    await next();
  };
  app.get('/api/reports', requireRole(['admin']), async (c) => {
    const type = c.req.query('type') || 'pnl';
    const from = parseInt(c.req.query('from') || '0');
    const to = parseInt(c.req.query('to') || String(Date.now()));
    const [transactions, purchases, expenses, products, customers, suppliers] = await Promise.all([
      TransactionEntity.list(c.env),
      PurchaseOrderEntity.list(c.env),
      ExpenseEntity.list(c.env),
      ProductEntity.list(c.env),
      CustomerEntity.list(c.env),
      SupplierEntity.list(c.env)
    ]);
    const filteredTxs = transactions.items.filter(t => t.timestamp >= from && t.timestamp <= to);
    const filteredPurchases = purchases.items.filter(p => p.timestamp >= from && p.timestamp <= to);
    const filteredExpenses = expenses.items.filter(e => e.date >= from && e.date <= to);
    switch (type) {
      case 'pnl':
        const revenue = filteredTxs.reduce((s, t) => s + t.totalAmount, 0);
        const expenseTotal = filteredExpenses.reduce((s, e) => s + e.amount, 0);
        const cogs = filteredTxs.reduce((s, t) => {
          return s + t.items.reduce((itemSum, item) => {
            const p = products.items.find(prod => prod.id === item.productId);
            return itemSum + (item.quantity * (p?.costPrice || 0));
          }, 0);
        }, 0);
        return ok(c, { revenue, cogs, expenseTotal, netProfit: revenue - cogs - expenseTotal });
      case 'sales':
        return ok(c, { items: filteredTxs });
      case 'purchases':
        return ok(c, { items: filteredPurchases });
      case 'cust-bal':
        return ok(c, { items: customers.items.filter(cust => cust.currentBalance > 0) });
      case 'top-selling':
        const salesMap = new Map<string, number>();
        filteredTxs.forEach(t => t.items.forEach(i => salesMap.set(i.productId, (salesMap.get(i.productId) || 0) + i.quantity)));
        const sorted = Array.from(salesMap.entries())
          .map(([id, qty]) => ({ product: products.items.find(p => p.id === id), quantity: qty }))
          .sort((a, b) => b.quantity - a.quantity);
        return ok(c, { items: sorted.slice(0, 10) });
      case 'expiry':
        const ninetyDays = Date.now() + (90 * 24 * 60 * 60 * 1000);
        const expiring = products.items.filter(p => {
          const exp = new Date(p.expiryDate).getTime();
          return exp <= ninetyDays;
        });
        return ok(c, { items: expiring });
      default:
        return ok(c, { items: [] });
    }
  });
  app.get('/api/stats', async (c) => {
    const transactions = await TransactionEntity.list(c.env, null, 1000);
    const alerts = await AlertEntity.list(c.env);
    const now = new Date();
    const salesSeries = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = new Date(d.setHours(23, 59, 59, 999)).getTime();
      const dayTxs = transactions.items.filter(t => t.timestamp >= dayStart && t.timestamp <= dayEnd);
      salesSeries.push({ date: d.toLocaleDateString('ar-SA', { weekday: 'short' }), amount: dayTxs.reduce((sum, t) => sum + t.totalAmount, 0), volume: dayTxs.length });
    }
    return ok(c, { totalSales: transactions.items.reduce((sum, t) => sum + t.totalAmount, 0), totalOrders: transactions.items.length, lowStockItems: alerts.items.filter(a => a.type === 'stock' && a.status === 'active').length, expiredSoonCount: alerts.items.filter(a => a.type === 'expiry' && a.status === 'active').length, recentSales: transactions.items.slice(0, 10), salesSeries });
  });
  app.get('/api/users', requireRole(['admin']), async (c) => ok(c, await UserEntity.list(c.env)));
  app.post('/api/users', requireRole(['admin']), async (c) => ok(c, await UserEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.get('/api/accounts', requireRole(['admin', 'pharmacist']), async (c) => ok(c, await AccountEntity.list(c.env)));
  app.post('/api/accounts', requireRole(['admin']), async (c) => ok(c, await AccountEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.get('/api/ledger', requireRole(['admin']), async (c) => ok(c, await JournalEntryEntity.list(c.env)));
  app.get('/api/trial-balance', requireRole(['admin']), async (c) => {
    const accounts = await AccountEntity.list(c.env);
    const entries = await JournalEntryEntity.list(c.env);
    const items = accounts.items.map(acc => {
      let debit = 0, credit = 0;
      entries.items.forEach(e => e.items.forEach(i => { if (i.accountId === acc.id) { debit += i.debit; credit += i.credit; } }));
      return { ...acc, totalDebit: debit, totalCredit: credit };
    });
    return ok(c, { items });
  });
  app.post('/api/transactions', requireRole(['admin', 'pharmacist']), async (c) => {
    const data = await c.req.json() as Transaction;
    const txId = data.id || crypto.randomUUID();
    const timestamp = Date.now();
    for (const item of data.items) {
      const productEnt = new ProductEntity(c.env, item.productId);
      if (await productEnt.exists()) await productEnt.mutate(p => ({ ...p, stockQuantity: p.stockQuantity - item.quantity }));
    }
    const entry: JournalEntry = { id: crypto.randomUUID(), date: timestamp, description: `مبيعات رقم ${txId.slice(0,8)}`, referenceId: txId.slice(0,8), sourceType: 'sale', sourceId: txId, items: [{ accountId: data.paymentMethod === 'cash' ? 'acc-cash' : 'acc-bank', debit: data.totalAmount, credit: 0 }, { accountId: 'acc-sales', debit: 0, credit: data.totalAmount }] };
    await JournalEntryEntity.create(c.env, entry);
    return ok(c, { transaction: await TransactionEntity.create(c.env, { ...data, id: txId, timestamp }), journalEntry: entry });
  });
  app.post('/api/purchases', requireRole(['admin', 'pharmacist']), async (c) => {
    const data = await c.req.json() as PurchaseOrder;
    const poId = data.id || crypto.randomUUID();
    const timestamp = Date.now();
    for (const item of data.items) {
      const productEnt = new ProductEntity(c.env, item.productId);
      if (await productEnt.exists()) await productEnt.mutate(p => ({ ...p, stockQuantity: p.stockQuantity + item.quantity, costPrice: item.costPrice }));
    }
    const entry: JournalEntry = { id: crypto.randomUUID(), date: timestamp, description: `مشتريات رقم ${poId.slice(0,8)}`, referenceId: poId.slice(0,8), sourceType: 'purchase', sourceId: poId, items: [{ accountId: 'acc-inv', debit: data.totalCost, credit: 0 }, { accountId: 'acc-cash', debit: 0, credit: data.totalCost }] };
    await JournalEntryEntity.create(c.env, entry);
    return ok(c, await PurchaseOrderEntity.create(c.env, { ...data, id: poId, timestamp }));
  });
  app.get('/api/products', async (c) => ok(c, await ProductEntity.list(c.env)));
  app.post('/api/products', requireRole(['admin', 'pharmacist']), async (c) => ok(c, await ProductEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.delete('/api/products/:id', requireRole(['admin']), async (c) => ok(c, await ProductEntity.delete(c.env, c.req.param('id'))));
  app.get('/api/customers', async (c) => ok(c, await CustomerEntity.list(c.env)));
  app.post('/api/customers', requireRole(['admin', 'pharmacist']), async (c) => ok(c, await CustomerEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.delete('/api/customers/:id', requireRole(['admin']), async (c) => ok(c, await CustomerEntity.delete(c.env, c.req.param('id'))));
  app.get('/api/suppliers', async (c) => ok(c, await SupplierEntity.list(c.env)));
  app.get('/api/categories', async (c) => ok(c, await CategoryEntity.list(c.env)));
  app.get('/api/alerts', async (c) => ok(c, await AlertEntity.list(c.env)));
  app.get('/api/purchases', async (c) => ok(c, await PurchaseOrderEntity.list(c.env)));
  app.post('/api/expenses', requireRole(['admin', 'pharmacist']), async (c) => {
    const data = await c.req.json() as Expense;
    const id = crypto.randomUUID();
    const timestamp = data.date || Date.now();
    const exp = await ExpenseEntity.create(c.env, { ...data, id, date: timestamp });
    return ok(c, exp);
  });
}