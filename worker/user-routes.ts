import { Hono } from "hono";
import type { Env } from './core-utils';
import { 
  ProductEntity, 
  SupplierEntity, 
  CategoryEntity, 
  UserEntity,
  TransactionEntity 
} from "./entities";
import { ok, bad, isStr } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // HEALTH & BASE
  app.get('/api/stats', async (c) => {
    await ProductEntity.ensureSeed(c.env);
    await TransactionEntity.ensureSeed(c.env);
    const products = await ProductEntity.list(c.env);
    const transactions = await TransactionEntity.list(c.env, null, 10);
    const lowStock = products.items.filter(p => p.stockQuantity <= p.minStockLevel).length;
    const totalSales = transactions.items.reduce((acc, t) => acc + t.totalAmount, 0);
    return ok(c, {
      totalSales,
      totalOrders: transactions.items.length,
      lowStockItems: lowStock,
      expiredSoonCount: 0, // Placeholder
      recentSales: transactions.items
    });
  });
  // PRODUCTS
  app.get('/api/products', async (c) => {
    await ProductEntity.ensureSeed(c.env);
    const cursor = c.req.query('cursor');
    const limit = c.req.query('limit');
    return ok(c, await ProductEntity.list(c.env, cursor ?? null, limit ? Number(limit) : 50));
  });
  app.post('/api/products', async (c) => {
    const data = await c.req.json();
    if (!data.name) return bad(c, 'name required');
    const product = await ProductEntity.create(c.env, { ...data, id: crypto.randomUUID() });
    return ok(c, product);
  });
  // SUPPLIERS
  app.get('/api/suppliers', async (c) => {
    await SupplierEntity.ensureSeed(c.env);
    return ok(c, await SupplierEntity.list(c.env));
  });
  // CATEGORIES
  app.get('/api/categories', async (c) => {
    await CategoryEntity.ensureSeed(c.env);
    return ok(c, await CategoryEntity.list(c.env));
  });
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    return ok(c, await UserEntity.list(c.env));
  });
}