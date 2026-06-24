import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Plus, Search, MoreVertical, Layers } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api-client';
import type { Category } from '@shared/types';
import { toast } from 'sonner';
export function CategoriesPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { data: categoriesData, isLoading } = useQuery<{ items: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => api<{ items: Category[] }>('/api/categories')
  });
  const categories = categoriesData?.items ?? [];
  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Categories</h1>
            <p className="text-muted-foreground">Medication classification and therapeutic groups.</p>
          </div>
          <Button className="gap-2 bg-pharmav-primary">
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </div>
        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/40">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-9 bg-background border-none ring-1 ring-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
            ))
          ) : filtered.map((c) => (
            <div key={c.id} className="group relative p-6 bg-card border rounded-2xl hover:border-pharmav-primary/40 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-pharmav-primary/10 text-pharmav-primary">
                  <Layers className="size-5" />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="size-4" />
                </Button>
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-lg">{c.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {c.description || "No description provided for this category."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}