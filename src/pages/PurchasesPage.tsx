import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Plus, Search, Calendar, DollarSign, Package, MoreVertical } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import type { PurchaseOrder, Supplier } from '@shared/types';
import { format } from 'date-fns';
export function PurchasesPage() {
  const [search, setSearch] = useState('');
  const { data: ordersData, isLoading } = useQuery<{ items: PurchaseOrder[] }>({
    queryKey: ['purchases'],
    queryFn: () => api<{ items: PurchaseOrder[] }>('/api/purchases')
  });
  const { data: suppliersData } = useQuery<{ items: Supplier[] }>({
    queryKey: ['suppliers'],
    queryFn: () => api<{ items: Supplier[] }>('/api/suppliers')
  });
  const orders = ordersData?.items ?? [];
  const suppliers = suppliersData?.items ?? [];
  const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || 'Unknown Supplier';
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Purchases</h1>
            <p className="text-muted-foreground">Track procurement and restock inventory.</p>
          </div>
          <Button className="gap-2 bg-pharmav-primary">
            <Plus className="h-4 w-4" /> New Order
          </Button>
        </div>
        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/40">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-9 bg-background border-none ring-1 ring-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="rounded-2xl border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><div className="h-12 bg-muted animate-pulse rounded" /></TableCell></TableRow>
                ))
              ) : orders.map((o) => (
                <TableRow key={o.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</TableCell>
                  <TableCell className="font-medium">{getSupplierName(o.supplierId)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(o.timestamp), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="font-bold">${o.totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="size-3 text-muted-foreground" />
                      <span className="text-sm">{o.items.length} items</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={o.status === 'received' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}
                    >
                      {o.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No purchase orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}