import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Plus, Search, MoreVertical, Layers, Box } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api-client';
import type { Category } from '@shared/types';
import { CategoryForm } from '@/components/inventory/CategoryForm';
import { toast } from 'sonner';
export function CategoriesPage() {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const queryClient = useQueryClient();
  const { data: categoriesData, isLoading } = useQuery<{ items: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => api<{ items: Category[] }>('/api/categories')
  });
  const categories = categoriesData?.items ?? [];
  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const handleEdit = (c: Category) => {
    setSelectedCategory(c);
    setIsFormOpen(true);
  };
  const handleAdd = () => {
    setSelectedCategory(undefined);
    setIsFormOpen(true);
  };
  return (
    <AppLayout container>
      <div className="space-y-8 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-pharmav-primary">تصنيفات الأدوية</h1>
            <p className="text-muted-foreground mt-2 text-lg">تنظيم الأدوية حسب المجموعات العلاجية والفئات الطبية.</p>
          </div>
          <Button onClick={handleAdd} className="gap-2 h-11 px-6 bg-pharmav-primary font-bold shadow-neon-blue flex-row-reverse">
            <Plus className="h-4 w-4" /> إضافة تصنيف جديد
          </Button>
        </div>
        <div className="flex items-center gap-4 bg-muted/30 p-6 rounded-2xl border border-border/60 flex-row-reverse">
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="ابحث عن اسم التصنيف..."
              className="pr-11 h-12 bg-background border-none ring-1 ring-border text-lg text-right"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 bg-muted animate-pulse rounded-3xl" />
            ))
          ) : filtered.map((c) => (
            <div key={c.id} className="group relative p-8 bg-card border rounded-3xl hover:border-pharmav-primary/40 hover:shadow-glow transition-all shadow-soft text-right">
              <div className="flex items-start justify-between flex-row-reverse">
                <div className="p-4 rounded-2xl bg-pharmav-primary/10 text-pharmav-primary group-hover:scale-110 transition-transform">
                  <Layers className="size-6" />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEdit(c)}
                  className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="size-5" />
                </Button>
              </div>
              <div className="mt-6">
                <h3 className="font-bold text-2xl font-display group-hover:text-pharmav-primary transition-colors">{c.name}</h3>
                <p className="text-base text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
                  {c.description || "لا يوجد وصف مضاف لهذا التصنيف حالياً."}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-end text-xs font-bold text-muted-foreground uppercase tracking-widest gap-2">
                 مجموعة علاجية مفعّلة <Box className="size-3" />
              </div>
            </div>
          ))}
          {!isLoading && filtered.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              <Layers className="size-12 mx-auto opacity-20 mb-4" />
              <p className="text-lg font-medium">لم يتم العثور على أي تصنيفات طبية.</p>
            </div>
          )}
        </div>
      </div>
      <CategoryForm open={isFormOpen} onOpenChange={setIsFormOpen} category={selectedCategory} />
    </AppLayout>
  );
}