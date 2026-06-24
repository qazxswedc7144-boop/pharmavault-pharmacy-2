import { Hono } from "hono";
import type { Env } from './core-utils';
import {
  ProductEntity,
  SupplierEntity,
  CategoryEntity,
  UserEntity,
  TransactionEntity
} from "./entities";
import { ok, bad, notFound } from './core-utils';
import { Transaction } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // DASHBOARD STATS
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
  // TRANSACTIONS
  app.post('/api/transactions', async (c) => {
    const data = await c.req.json() as Transaction;
    if (!data.items || data.items.length === 0) return bad(c, 'items required');
    // 1. Create transaction record
    const transaction = await TransactionEntity.create(c.env, { 
      ...data, 
      id: data.id || crypto.randomUUID(),
      timestamp: data.timestamp || Date.now()
    });
    // 2. Decrement stock for each item
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
  // PRODUCTS
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
  // SUPPLIERS
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
  // CATEGORIES
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
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    return ok(c, await UserEntity.list(c.env));
  });
}