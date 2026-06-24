import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import type { Product, ApiResponse } from '@shared/types';
export function InventoryPage() {
  const [search, setSearch] = useState('');
  const { data: productsData, isLoading } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api<{ items: Product[] }>('/api/products')
  });
  const products = productsData?.items ?? [];
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <AppLayout container>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Inventory</h1>
            <p className="text-muted-foreground">Manage products, stock levels, and batches.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" /> Export
            </Button>
            <Button className="gap-2 bg-pharmav-primary">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center bg-muted/30 p-4 rounded-xl border border-border/40">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or SKU..." 
              className="pl-9 bg-background border-none ring-1 ring-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="ghost" className="gap-2">
            <Filter className="h-4 w-4" /> Filters
          </Button>
          <div className="ml-auto text-sm text-muted-foreground">
            Showing {filteredProducts.length} products
          </div>
        </div>
        <div className="rounded-2xl border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px]">Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 w-48 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredProducts.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/30 transition-colors group">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{p.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">Batch: {p.batchNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={p.stockQuantity <= p.minStockLevel ? "text-destructive font-bold" : ""}>
                        {p.stockQuantity}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">{p.unit}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">${p.price.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.expiryDate}</TableCell>
                  <TableCell>
                    {p.stockQuantity <= p.minStockLevel ? (
                      <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Low Stock</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}