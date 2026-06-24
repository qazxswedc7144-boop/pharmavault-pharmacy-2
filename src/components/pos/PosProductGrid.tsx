import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Package, Layers, QrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api-client';
import type { Product, Category } from '@shared/types';
interface PosProductGridProps {
  onSelect: (p: Product) => void;
  isReturn: boolean;
}
export function PosProductGrid({ onSelect, isReturn }: PosProductGridProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: productsData, isLoading } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api<{ items: Product[] }>('/api/products')
  });
  const { data: categoriesData } = useQuery<{ items: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => api<{ items: Category[] }>('/api/categories')
  });
  const products = productsData?.items ?? [];
  const categories = categoriesData?.items ?? [];
  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory !== 'all') {
      result = result.filter(p => p.categoryId === activeCategory);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(s) || 
        p.sku.toLowerCase().includes(s) || 
        p.barcode?.includes(s)
      );
    }
    return result;
  }, [products, activeCategory, search]);
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);
  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      {/* Search & Categories */}
      <div className="flex flex-col gap-4 bg-card border rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
          <Input 
            ref={searchInputRef}
            id="pos-search-input"
            placeholder="ابحث عن دواء بالاسم أو الباركود (F2)..."
            className="h-14 pr-12 text-lg glass-card text-right border-2 focus-visible:ring-pharmav-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5 opacity-50" />
        </div>
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full" dir="rtl">
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="bg-transparent gap-2 h-auto p-0">
              <TabsTrigger 
                value="all" 
                className="rounded-full px-6 py-2 border-2 data-[state=active]:bg-pharmav-primary data-[state=active]:text-white transition-all"
              >
                الكل
              </TabsTrigger>
              {categories.map(c => (
                <TabsTrigger 
                  key={c.id} 
                  value={c.id}
                  className="rounded-full px-6 py-2 border-2 data-[state=active]:bg-pharmav-primary data-[state=active]:text-white transition-all"
                >
                  {c.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </Tabs>
      </div>
      {/* Grid */}
      <ScrollArea className="flex-1 rounded-3xl border bg-muted/20">
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {isLoading ? (
            Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="h-44 bg-card animate-pulse rounded-2xl" />
            ))
          ) : filtered.map(product => (
            <button
              key={product.id}
              onClick={() => onSelect(product)}
              className="flex flex-col items-end p-4 bg-card border-2 rounded-2xl hover:border-pharmav-primary/40 hover:shadow-glow transition-all text-right group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-1 h-full transition-colors ${isReturn ? 'bg-rose-500' : 'bg-pharmav-primary'}`} />
              <div className="w-full flex justify-between items-start mb-3 flex-row-reverse">
                <Badge variant="outline" className="text-[10px] font-mono">{product.sku}</Badge>
                {product.stockQuantity <= product.minStockLevel && (
                  <Badge variant="destructive" className="text-[8px] px-1 py-0 animate-pulse">نقص مخزون</Badge>
                )}
              </div>
              <span className="font-bold text-sm line-clamp-2 mb-1 group-hover:text-pharmav-primary transition-colors font-display h-10 leading-snug">
                {product.name}
              </span>
              <div className="flex flex-col items-end gap-1 mt-2">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 flex-row-reverse">
                  <Package className="size-3" /> {product.stockQuantity} {product.unit} متوفر
                </span>
                <span className="text-xl font-display font-bold text-pharmav-primary mt-2">
                  {product.price.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">ر.س</span>
                </span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && !isLoading && (
            <div className="col-span-full py-32 text-center text-muted-foreground space-y-4">
              <Layers className="size-16 mx-auto opacity-10" />
              <p className="text-xl font-display">لم يتم العثور على أدوية مطابقة للبحث</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}