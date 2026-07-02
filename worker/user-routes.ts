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
  // RBAC Middleware
  const requireRole = (allowedRoles: Role[]): MiddlewareHandler => async (c, next) => {
    const role = c.req.header('x-user-role') as Role;
    if (!role || !allowedRoles.includes(role)) {
      return c.json({ success: false, error: 'غير مصرح لك بالوصول لهذا القسم (403)' }, 403);
    }
    await next();
  };
  const checkAlerts = async (env: Env) => {
    const products = await ProductEntity.list(env);
    const now = Date.now();
    for (const p of products.items) {
      if (p.stockQuantity <= p.minStockLevel) {
        await AlertEntity.create(env, {
          id: `stock-${p.id}`,
          type: 'stock',
          productId: p.id,
          message: `نقص مخزون: ${p.name} (المتوفر: ${p.stockQuantity})`,
          severity: p.stockQuantity === 0 ? 'high' : 'medium',
          status: 'active',
          timestamp: now
        });
      }
    }
  };
  app.get('/api/stats', async (c) => {
    const transactions = await TransactionEntity.list(c.env, null, 1000);
    const expenses = await ExpenseEntity.list(c.env);
    const alerts = await AlertEntity.list(c.env);
    const now = new Date();
    const salesSeries = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = new Date(d.setHours(23, 59, 59, 999)).getTime();
      const dateStr = d.toLocaleDateString('ar-SA', { weekday: 'short' });
      const dayTxs = transactions.items.filter(t => t.timestamp >= dayStart && t.timestamp <= dayEnd);
      salesSeries.push({
        date: dateStr,
        amount: dayTxs.reduce((sum, t) => sum + t.totalAmount, 0),
        volume: dayTxs.length
      });
    }
    const totalSales = transactions.items.reduce((sum, t) => sum + t.totalAmount, 0);
    const lowStock = alerts.items.filter(a => a.type === 'stock' && a.status === 'active').length;
    const expiredSoon = alerts.items.filter(a => a.type === 'expiry' && a.status === 'active').length;
    return ok(c, {
      totalSales,
      totalOrders: transactions.items.length,
      lowStockItems: lowStock,
      expiredSoonCount: expiredSoon,
      recentSales: transactions.items.slice(0, 10),
      salesSeries
    });
  });
  // Protected Admin Routes
  app.get('/api/users', requireRole(['admin']), async (c) => ok(c, await UserEntity.list(c.env)));
  app.post('/api/users', requireRole(['admin']), async (c) => {
    const data = await c.req.json();
    return ok(c, await UserEntity.create(c.env, { ...data, id: crypto.randomUUID() }));
  });
  app.get('/api/accounts', requireRole(['admin', 'pharmacist']), async (c) => ok(c, await AccountEntity.list(c.env)));
  app.post('/api/accounts', requireRole(['admin']), async (c) => ok(c, await AccountEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.get('/api/ledger', requireRole(['admin']), async (c) => ok(c, await JournalEntryEntity.list(c.env)));
  app.get('/api/trial-balance', requireRole(['admin']), async (c) => {
    const accounts = await AccountEntity.list(c.env);
    const entries = await JournalEntryEntity.list(c.env);
    const items = accounts.items.map(acc => {
      let debit = 0;
      let credit = 0;
      entries.items.forEach(e => {
        e.items.forEach(i => {
          if (i.accountId === acc.id) {
            debit += i.debit;
            credit += i.credit;
          }
        });
      });
      return { ...acc, totalDebit: debit, totalCredit: credit };
    });
    return ok(c, { items });
  });
  // Pharmacist & Admin Operations
  app.post('/api/transactions', requireRole(['admin', 'pharmacist']), async (c) => {
    const data = await c.req.json() as Transaction;
    const txId = data.id || crypto.randomUUID();
    const timestamp = Date.now();
    for (const item of data.items) {
      const productEnt = new ProductEntity(c.env, item.productId);
      if (await productEnt.exists()) {
        await productEnt.mutate(p => ({ ...p, stockQuantity: p.stockQuantity - item.quantity }));
      }
    }
    if (data.customerId && data.paymentMethod === 'transfer') {
      const custEnt = new CustomerEntity(c.env, data.customerId);
      if (await custEnt.exists()) {
        await custEnt.mutate(cust => ({ ...cust, currentBalance: cust.currentBalance + data.totalAmount }));
      }
    }
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      date: timestamp,
      description: `فاتورة مبيعات رقم ${data.invoiceNumber || txId.slice(0,8)}`,
      referenceId: data.invoiceNumber || txId.slice(0,8),
      sourceType: 'sale',
      sourceId: txId,
      items: [
        { accountId: data.paymentMethod === 'cash' ? 'acc-cash' : 'acc-bank', debit: data.totalAmount, credit: 0 },
        { accountId: 'acc-sales', debit: 0, credit: data.totalAmount }
      ]
    };
    await JournalEntryEntity.create(c.env, entry);
    const transaction = await TransactionEntity.create(c.env, { ...data, id: txId, timestamp });
    return ok(c, { transaction, journalEntry: entry });
  });
  app.post('/api/purchases', requireRole(['admin', 'pharmacist']), async (c) => {
    const data = await c.req.json() as PurchaseOrder;
    const poId = data.id || crypto.randomUUID();
    const timestamp = Date.now();
    for (const item of data.items) {
      const productEnt = new ProductEntity(c.env, item.productId);
      if (await productEnt.exists()) {
        await productEnt.mutate(p => ({ ...p, stockQuantity: p.stockQuantity + item.quantity, costPrice: item.costPrice }));
      }
    }
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      date: timestamp,
      description: `فاتورة مشتريات من مورد`,
      referenceId: data.invoiceNumber || poId.slice(0,8),
      sourceType: 'purchase',
      sourceId: poId,
      items: [
        { accountId: 'acc-inv', debit: data.totalCost, credit: 0 },
        { accountId: 'acc-cash', debit: 0, credit: data.totalCost }
      ]
    };
    await JournalEntryEntity.create(c.env, entry);
    const purchase = await PurchaseOrderEntity.create(c.env, { ...data, id: poId, timestamp });
    return ok(c, purchase);
  });
  // Standard Entities (Viewer can READ, but Admin/Pharmacist can WRITE)
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
    if (data.status === 'paid') {
      const journal: JournalEntry = {
        id: crypto.randomUUID(),
        date: timestamp,
        description: `مصروف: ${data.description}`,
        referenceId: id.slice(0,8),
        sourceType: 'expense',
        sourceId: id,
        items: [
          { accountId: data.accountId, debit: data.amount, credit: 0 },
          { accountId: data.paymentAccountId, debit: 0, credit: data.amount }
        ]
      };
      await JournalEntryEntity.create(c.env, journal);
    }
    const exp = await ExpenseEntity.create(c.env, { ...data, id, date: timestamp });
    return ok(c, exp);
  });
}