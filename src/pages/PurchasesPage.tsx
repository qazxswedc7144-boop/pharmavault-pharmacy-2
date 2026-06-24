import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Truck, Plus, Search, Package, MoreVertical } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import type { PurchaseOrder, Supplier } from '@shared/types';
import { format } from 'date-fns';
import { PurchaseForm } from '@/components/purchases/PurchaseForm';
export function PurchasesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
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
  const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || 'مورد غير معروف';
  return (
    <AppLayout container>
      <div className="space-y-8 text-right" dir="rtl">
        <div className="flex items-center justify-between flex-row-reverse">
          <div>
            <h1 className="text-3xl font-display font-bold">المشتريات</h1>
            <p className="text-muted-foreground">تتبع توريد الأدوية وإدارة مخزون الصيدلية.</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2 bg-pharmav-primary flex-row-reverse font-bold">
            <Plus className="h-4 w-4" /> طلب شراء جديد
          </Button>
        </div>
        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/40 flex-row-reverse">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="البحث في الطلبات..." className="pr-9 bg-background border-none ring-1 ring-border text-right" />
          </div>
        </div>
        <div className="rounded-2xl border bg-card overflow-hidden">
          <Table className="text-right">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">المورد</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">التكلفة الإجمالية</TableHead>
                <TableHead className="text-right">الأصناف</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-left"></TableHead>
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
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(o.timestamp), 'yyyy/MM/dd')}</TableCell>
                  <TableCell className="font-bold">{o.totalCost.toFixed(2)} ر.س</TableCell>
                  <TableCell><div className="flex items-center gap-1 justify-end"><span className="text-sm">{o.items.length} أصناف</span><Package className="size-3 text-muted-foreground" /></div></TableCell>
                  <TableCell>
                    <Badge variant="outline" className={o.status === 'received' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20'}>
                      {o.status === 'received' ? 'تم الاستلام' : o.status === 'pending' ? 'قيد الانتظار' : 'ملغي'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <PurchaseForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </AppLayout>
  );
}