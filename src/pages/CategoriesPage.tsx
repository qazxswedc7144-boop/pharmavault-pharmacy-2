import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layers, Plus, Package, Pill, Box, ShieldCheck, Zap } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api-client';
import type { Category, Product } from '@shared/types';
export function CategoriesPage() {
  const { data: categoriesData, isLoading: isCatLoading } = useQuery<{ items: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => api<{ items: Category[] }>('/api/categories')
  });
  const { data: productsData } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api<{ items: Product[] }>('/api/products')
  });
  const categories = useMemo(() => categoriesData?.items ?? [], [categoriesData?.items]);
  const products = useMemo(() => productsData?.items ?? [], [productsData?.items]);
  const categoryStats = useMemo(() => {
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0);
    return categories.map(cat => {
      const catProds = products.filter(p => p.categoryId === cat.id);
      const catValue = catProds.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0);
      const percentage = totalInventoryValue > 0 ? (catValue / totalInventoryValue) * 100 : 0;
      return {
        ...cat,
        productCount: catProds.length,
        stockValue: catValue,
        percentage: percentage
      };
    });
  }, [categories, products]);
  const icons = [Pill, Box, ShieldCheck, Zap, Layers, Package];
  return (
    <AppLayout container>
      <div className="space-y-10 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-pharmav-primary">تصنيفات الأدوية</h1>
            <p className="text-muted-foreground mt-2 text-lg">تحليل توزيع المخزون حسب المجموعات العلاجية ونسب المبيعات.</p>
          </div>
          <Button className="gap-2 h-14 px-10 bg-pharmav-primary font-bold shadow-neon-blue rounded-2xl flex-row-reverse text-lg">
            <Plus className="size-6" /> مجموعة جديدة
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isCatLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-card animate-pulse rounded-[2.5rem] border" />
            ))
          ) : categoryStats.map((cat, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <div key={cat.id} className="group relative p-8 bg-card border-2 border-transparent hover:border-pharmav-primary/20 rounded-[2.5rem] shadow-soft hover:shadow-glow transition-all duration-300 flex flex-col justify-between">
                <div className="flex items-center justify-between flex-row-reverse mb-6">
                  <div className="size-14 rounded-2xl bg-pharmav-primary/10 text-pharmav-primary flex items-center justify-center transition-transform group-hover:scale-110">
                    <Icon className="size-8" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">الأصناف</span>
                    <span className="text-xl font-display font-bold">{cat.productCount}</span>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <h3 className="text-2xl font-display font-bold group-hover:text-pharmav-primary transition-colors">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {cat.description || "لا يوجد وصف لهذه المجموعة حتى الآن."}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold flex-row-reverse">
                    <span className="text-muted-foreground">نسبة قيمة المخزون</span>
                    <span className="text-pharmav-primary">{cat.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={cat.percentage} className="h-2.5 bg-muted rounded-full" />
                  <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-muted-foreground pt-1">
                    إجمالي القيمة: {cat.stockValue.toLocaleString()} ر.س
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}