import { Hono } from "hono";
import type { Env } from './core-utils';
import {
  ProductEntity,
  SupplierEntity,
  CategoryEntity,
  UserEntity,
  TransactionEntity,
  PurchaseOrderEntity
} from "./entities";
import { ok, bad, notFound } from './core-utils';
import { Transaction, PurchaseOrder } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/stats', async (c) => {
    await ProductEntity.ensureSeed(c.env);
    await TransactionEntity.ensureSeed(c.env);
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
  app.get('/api/reports/analytics', async (c) => {
    const products = await ProductEntity.list(c.env);
    const transactions = await TransactionEntity.list(c.env);
    const inventoryValue = products.items.reduce((acc, p) => acc + (p.stockQuantity * p.costPrice), 0);
    const profitSummary = transactions.items.reduce((acc, t) => {
      acc.revenue += t.totalAmount;
      return acc;
    }, { revenue: 0, cost: 0, profit: 0 });
    const categories = await CategoryEntity.list(c.env);
    const distribution = categories.items.map(cat => {
      const items = products.items.filter(p => p.categoryId === cat.id);
      return {
        category: cat.name,
        count: items.length,
        value: items.reduce((acc, p) => acc + (p.stockQuantity * p.costPrice), 0)
      };
    });
    return ok(c, {
      inventoryValue,
      revenueByDay: [], 
      categoryDistribution: distribution,
      profitSummary: { ...profitSummary, cost: inventoryValue * 0.7, profit: profitSummary.revenue - (inventoryValue * 0.7) }
    });
  });
  app.post('/api/transactions', async (c) => {
    const data = await c.req.json() as Transaction;
    if (!data.items || data.items.length === 0) return bad(c, 'items required');
    const transaction = await TransactionEntity.create(c.env, {
      ...data,
      id: data.id || crypto.randomUUID(),
      timestamp: data.timestamp || Date.now()
    });
    for (const item of data.items) {
      const productEntity = new ProductEntity(c.env, item.productId);
      if (await productEntity.exists()) {
        await productEntity.mutate(s => ({
          ...s,
          stockQuantity: Math.max(0, s.stockQuantity - item.quantity)
        }));
      }
    }
    return ok(c, transaction);
  });
  app.get('/api/purchases', async (c) => {
    return ok(c, await PurchaseOrderEntity.list(c.env));
  });
  app.post('/api/purchases', async (c) => {
    const data = await c.req.json() as PurchaseOrder;
    const order = await PurchaseOrderEntity.create(c.env, {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    });
    if (order.status === 'received') {
      for (const item of order.items) {
        const productEntity = new ProductEntity(c.env, item.productId);
        if (await productEntity.exists()) {
          await productEntity.mutate(s => ({
            ...s,
            stockQuantity: s.stockQuantity + item.quantity,
            costPrice: item.costPrice
          }));
        }
      }
    }
    return ok(c, order);
  });
  app.get('/api/products', async (c) => {
    await ProductEntity.ensureSeed(c.env);
    const cursor = c.req.query('cursor');
    const limit = c.req.query('limit');
    return ok(c, await ProductEntity.list(c.env, cursor ?? null, limit ? Number(limit) : 100));
  });
  app.post('/api/products', async (c) => {
    const data = await c.req.json();
    if (!data.name || !data.sku) return bad(c, 'name and sku are required');
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
  app.delete('/api/products/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await ProductEntity.delete(c.env, id);
    return ok(c, { deleted });
  });
  app.get('/api/suppliers', async (c) => {
    await SupplierEntity.ensureSeed(c.env);
    return ok(c, await SupplierEntity.list(c.env));
  });
  app.post('/api/suppliers', async (c) => {
    const data = await c.req.json();
    if (!data.name) return bad(c, 'name required');
    const supplier = await SupplierEntity.create(c.env, { ...data, id: crypto.randomUUID() });
    return ok(c, supplier);
  });
  app.get('/api/categories', async (c) => {
    await CategoryEntity.ensureSeed(c.env);
    return ok(c, await CategoryEntity.list(c.env));
  });
  app.post('/api/categories', async (c) => {
    const data = await c.req.json();
    if (!data.name) return bad(c, 'name required');
    const category = await CategoryEntity.create(c.env, { ...data, id: crypto.randomUUID() });
    return ok(c, category);
  });
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    return ok(c, await UserEntity.list(c.env));
  });
}