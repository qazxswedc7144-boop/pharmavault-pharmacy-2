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
  CustomerEntity,
  AlertEntity
} from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { Transaction, PurchaseOrder, Expense, Alert, JournalEntry, User } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const checkAlerts = async (env: Env) => {
    const products = await ProductEntity.list(env);
    const now = Date.now();
    let healthAlerts = 0;
    for (const p of products.items) {
      if (p.stockQuantity <= p.minStockLevel) {
        healthAlerts++;
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
      if (p.expiryDate) {
        const expiry = new Date(p.expiryDate).getTime();
        const daysToExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
        if (daysToExpiry < 30) {
          healthAlerts++;
          await AlertEntity.create(env, {
            id: `expiry-${p.id}`,
            type: 'expiry',
            productId: p.id,
            message: `انتهاء قريب: ${p.name} (خلال ${Math.ceil(daysToExpiry)} يوم)`,
            severity: 'high',
            status: 'active',
            timestamp: now
          });
        }
      }
    }
    return healthAlerts;
  };
  app.get('/api/stats', async (c) => {
    await ProductEntity.ensureSeed(c.env);
    await AccountEntity.ensureSeed(c.env);
    await UserEntity.ensureSeed(c.env);
    await checkAlerts(c.env);
    const transactions = await TransactionEntity.list(c.env, null, 500);
    const alerts = await AlertEntity.list(c.env);
    const accounts = await AccountEntity.list(c.env);
    const lowStock = alerts.items.filter(a => a.type === 'stock' && a.status === 'active').length;
    const expiredSoon = alerts.items.filter(a => a.type === 'expiry' && a.status === 'active').length;
    // Last 7 Days Time-Series
    const salesSeries = [];
    const now = new Date();
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
    return ok(c, {
      totalSales,
      totalOrders: transactions.items.length,
      lowStockItems: lowStock,
      expiredSoonCount: expiredSoon,
      recentSales: transactions.items.slice(0, 10),
      salesSeries
    });
  });
  // User Management CRUD
  app.get('/api/users', async (c) => ok(c, await UserEntity.list(c.env)));
  app.post('/api/users', async (c) => {
    const data = await c.req.json();
    const user = await UserEntity.create(c.env, { ...data, id: crypto.randomUUID() });
    return ok(c, user);
  });
  app.put('/api/users/:id', async (c) => {
    const ent = new UserEntity(c.env, c.req.param('id'));
    if (!(await ent.exists())) return notFound(c);
    await ent.patch(await c.req.json());
    return ok(c, await ent.getState());
  });
  app.delete('/api/users/:id', async (c) => {
    await UserEntity.delete(c.env, c.req.param('id'));
    return ok(c, { success: true });
  });
  // Existing entity routes
  app.get('/api/products', async (c) => ok(c, await ProductEntity.list(c.env)));
  app.post('/api/products', async (c) => ok(c, await ProductEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.put('/api/products/:id', async (c) => {
    const ent = new ProductEntity(c.env, c.req.param('id'));
    if (!(await ent.exists())) return notFound(c);
    await ent.patch(await c.req.json());
    return ok(c, await ent.getState());
  });
  app.delete('/api/products/:id', async (c) => {
    await ProductEntity.delete(c.env, c.req.param('id'));
    return ok(c, { success: true });
  });
  app.get('/api/accounts', async (c) => ok(c, await AccountEntity.list(c.env)));
  app.post('/api/accounts', async (c) => ok(c, await AccountEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.get('/api/expenses', async (c) => ok(c, await ExpenseEntity.list(c.env)));
  app.post('/api/expenses', async (c) => {
    const data = await c.req.json() as Expense;
    const exp = await ExpenseEntity.create(c.env, { ...data, id: crypto.randomUUID(), date: data.date || Date.now() });
    return ok(c, exp);
  });
  app.get('/api/customers', async (c) => ok(c, await CustomerEntity.list(c.env)));
  app.post('/api/customers', async (c) => ok(c, await CustomerEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.get('/api/suppliers', async (c) => ok(c, await SupplierEntity.list(c.env)));
  app.post('/api/suppliers', async (c) => ok(c, await SupplierEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.get('/api/categories', async (c) => ok(c, await CategoryEntity.list(c.env)));
  app.post('/api/categories', async (c) => ok(c, await CategoryEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.get('/api/ledger', async (c) => {
    const list = await JournalEntryEntity.list(c.env);
    return ok(c, { items: list.items.sort((a, b) => b.date - a.date) });
  });
  app.get('/api/trial-balance', async (c) => {
    const accounts = await AccountEntity.list(c.env);
    const entries = await JournalEntryEntity.list(c.env);
    const balanceMap = accounts.items.map(acc => {
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
    return ok(c, { items: balanceMap });
  });
  app.post('/api/transactions', async (c) => {
    const data = await c.req.json() as Transaction;
    const txId = data.id || crypto.randomUUID();
    const transaction = await TransactionEntity.create(c.env, { ...data, id: txId, timestamp: Date.now() });
    return ok(c, { transaction });
  });
  app.get('/api/alerts', async (c) => ok(c, await AlertEntity.list(c.env)));
  app.get('/api/alerts/count', async (c) => {
    const list = await AlertEntity.list(c.env);
    const active = list.items.filter(a => a.status === 'active');
    return ok(c, { count: active.length });
  });
  app.put('/api/alerts/:id', async (c) => {
    const ent = new AlertEntity(c.env, c.req.param('id'));
    if (!(await ent.exists())) return notFound(c);
    await ent.patch(await c.req.json());
    return ok(c, await ent.getState());
  });
  app.delete('/api/alerts/:id', async (c) => {
    await AlertEntity.delete(c.env, c.req.param('id'));
    return ok(c, { deleted: true });
  });
  app.get('/api/purchases', async (c) => ok(c, await PurchaseOrderEntity.list(c.env)));
  app.post('/api/purchases', async (c) => ok(c, await PurchaseOrderEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID(), timestamp: Date.now() })));
}