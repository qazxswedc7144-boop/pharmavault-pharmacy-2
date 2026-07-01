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
import type { Transaction, PurchaseOrder, Expense, Alert } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
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
      if (p.expiryDate) {
        const expiry = new Date(p.expiryDate).getTime();
        const daysToExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
        if (daysToExpiry < 30) {
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
  };
  app.get('/api/stats', async (c) => {
    await ProductEntity.ensureSeed(c.env);
    await AccountEntity.ensureSeed(c.env);
    await checkAlerts(c.env);
    const products = await ProductEntity.list(c.env);
    const transactions = await TransactionEntity.list(c.env, null, 10);
    const alerts = await AlertEntity.list(c.env);
    const lowStock = products.items.filter(p => p.stockQuantity <= p.minStockLevel).length;
    const expiredSoon = alerts.items.filter(a => a.type === 'expiry' && a.status === 'active').length;
    const totalSales = transactions.items.reduce((acc, t) => acc + t.totalAmount, 0);
    return ok(c, {
      totalSales,
      totalOrders: transactions.items.length,
      lowStockItems: lowStock,
      expiredSoonCount: expiredSoon,
      recentSales: transactions.items
    });
  });
  app.get('/api/alerts', async (c) => {
    const list = await AlertEntity.list(c.env);
    return ok(c, list);
  });
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
  app.get('/api/products', async (c) => ok(c, await ProductEntity.list(c.env)));
  app.post('/api/products', async (c) => ok(c, await ProductEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.put('/api/products/:id', async (c) => {
    const ent = new ProductEntity(c.env, c.req.param('id'));
    if (!(await ent.exists())) return notFound(c);
    await ent.patch(await c.req.json());
    return ok(c, await ent.getState());
  });
  app.post('/api/transactions', async (c) => {
    const data = await c.req.json() as Transaction;
    const transaction = await TransactionEntity.create(c.env, { ...data, id: data.id || crypto.randomUUID(), timestamp: Date.now() });
    for (const item of data.items) {
      const pEnt = new ProductEntity(c.env, item.productId);
      if (await pEnt.exists()) {
        const prod = await pEnt.mutate(s => ({ ...s, stockQuantity: Math.max(0, s.stockQuantity - item.quantity) }));
        if (prod.stockQuantity <= prod.minStockLevel) {
          await AlertEntity.create(c.env, {
            id: `stock-${prod.id}`,
            type: 'stock',
            productId: prod.id,
            message: `تحذير نقص مخزون: ${prod.name} وصل لـ ${prod.stockQuantity}`,
            severity: prod.stockQuantity === 0 ? 'high' : 'medium',
            status: 'active',
            timestamp: Date.now()
          });
        }
      }
    }
    if (data.customerId) {
      const custEnt = new CustomerEntity(c.env, data.customerId);
      if (await custEnt.exists()) {
        const customer = await custEnt.mutate(s => ({ ...s, currentBalance: s.currentBalance + transaction.totalAmount }));
        if (customer.currentBalance > customer.creditLimit) {
          await AlertEntity.create(c.env, {
            id: `cust-${customer.id}`,
            type: 'credit',
            productId: customer.id,
            message: `تجاوز الحد الائتماني: العميل ${customer.name} تجاوز حده بـ ${customer.currentBalance - customer.creditLimit} ر.س`,
            severity: 'medium',
            status: 'active',
            timestamp: Date.now()
          });
        }
      }
    }
    const cashAcc = new AccountEntity(c.env, 'acc-cash');
    const salesAcc = new AccountEntity(c.env, 'acc-sales');
    await cashAcc.mutate(s => ({ ...s, balance: s.balance + transaction.totalAmount }));
    await salesAcc.mutate(s => ({ ...s, balance: s.balance + transaction.totalAmount }));
    await JournalEntryEntity.create(c.env, {
      id: crypto.randomUUID(),
      date: Date.now(),
      description: `Sale #${transaction.id.slice(0, 8)}`,
      referenceId: transaction.id,
      items: [
        { accountId: 'acc-cash', debit: transaction.totalAmount, credit: 0 },
        { accountId: 'acc-sales', debit: 0, credit: transaction.totalAmount }
      ]
    });
    return ok(c, transaction);
  });
  app.post('/api/purchases', async (c) => {
    const data = await c.req.json() as PurchaseOrder;
    const order = await PurchaseOrderEntity.create(c.env, { ...data, id: crypto.randomUUID(), timestamp: Date.now() });
    if (order.status === 'received') {
      for (const item of order.items) {
        const pEnt = new ProductEntity(c.env, item.productId);
        if (await pEnt.exists()) await pEnt.mutate(s => ({ ...s, stockQuantity: s.stockQuantity + item.quantity, costPrice: item.costPrice }));
      }
      const invAcc = new AccountEntity(c.env, 'acc-inv');
      const cashAcc = new AccountEntity(c.env, 'acc-cash');
      await invAcc.mutate(s => ({ ...s, balance: s.balance + order.totalCost }));
      await cashAcc.mutate(s => ({ ...s, balance: s.balance - order.totalCost }));
      await JournalEntryEntity.create(c.env, {
        id: crypto.randomUUID(),
        date: Date.now(),
        description: `Purchase from ${order.supplierId}`,
        referenceId: order.id,
        items: [
          { accountId: 'acc-inv', debit: order.totalCost, credit: 0 },
          { accountId: 'acc-cash', debit: 0, credit: order.totalCost }
        ]
      });
    }
    return ok(c, order);
  });
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
      await JournalEntryEntity.create(c.env, {
        id: crypto.randomUUID(),
        date: Date.now(),
        description: `Expense: ${exp.description}`,
        referenceId: exp.id,
        items: [
          { accountId: exp.accountId, debit: exp.amount, credit: 0 },
          { accountId: exp.paymentAccountId, debit: 0, credit: exp.amount }
        ]
      });
    }
    return ok(c, exp);
  });
  app.get('/api/customers', async (c) => ok(c, await CustomerEntity.list(c.env)));
  app.post('/api/customers', async (c) => ok(c, await CustomerEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.get('/api/suppliers', async (c) => ok(c, await SupplierEntity.list(c.env)));
  app.post('/api/suppliers', async (c) => ok(c, await SupplierEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
  app.get('/api/categories', async (c) => ok(c, await CategoryEntity.list(c.env)));
  app.post('/api/categories', async (c) => ok(c, await CategoryEntity.create(c.env, { ...await c.req.json(), id: crypto.randomUUID() })));
}