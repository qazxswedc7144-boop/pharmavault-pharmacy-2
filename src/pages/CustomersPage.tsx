import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  Plus,
  TrendingUp,
  AlertCircle,
  CreditCard,
  Phone,
  Mail,
  ChevronRight,
  ShieldAlert,
  Trash2,
  Edit2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/offline-store';
import type { Customer } from '@shared/types';
import { cn } from '@/lib/utils';
import { SupplierForm as CustomerForm } from '@/components/inventory/SupplierForm'; 
import { toast } from 'sonner';
export function CustomersPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'debt'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const currentUser = useAppStore(s => s.currentUser);
  const role = currentUser?.role || 'viewer';
  const canWrite = role === 'admin' || role === 'pharmacist';
  const canDelete = role === 'admin';
  const { data: customersData, isLoading } = useQuery<{ items: Customer[] }>({
    queryKey: ['customers'],
    queryFn: () => api<{ items: Customer[] }>('/api/customers')
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/customers/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('تم حذف العميل بنجاح');
    },
    onError: (err: any) => toast.error(err.message || 'خطأ في الصلاحيات')
  });
  const customers = useMemo(() => customersData?.items ?? [], [customersData?.items]);
  const filtered = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone && c.phone.includes(search));
      const matchesFilter = filterType === 'all' || c.currentBalance > 0;
      return matchesSearch && matchesFilter;
    });
  }, [customers, search, filterType]);
  return (
    <AppLayout container>
      <div className="space-y-8 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="text-right">
            <h1 className="text-4xl font-display font-bold text-pharmav-primary">قاعدة بيانات العملاء</h1>
            <p className="text-muted-foreground mt-2 text-lg">إدارة الحسابات الشخصية، السجل الطبي، والذمم المالية.</p>
          </div>
          {canWrite && (
            <Button onClick={() => setIsFormOpen(true)} className="gap-2 h-12 px-8 bg-pharmav-primary font-bold shadow-neon-blue rounded-xl flex-row-reverse">
              <Plus className="size-5" /> إضافة عميل جديد
            </Button>
          )}
        </div>
        {role === 'viewer' && (
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-3 flex-row-reverse text-blue-700 font-bold text-sm">
            <ShieldAlert className="size-5" />
            وضع المشاهد: لا يمكنك تعديل بيانات العملاء أو ديونهم.
          </div>
        )}
        <div className="flex items-center gap-4 bg-muted/30 p-6 rounded-2xl border border-border/60 flex-row-reverse">
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="البحث باسم العميل أو رقم الهاتف..."
              className="pr-11 h-12 bg-background border-none ring-1 ring-border text-lg text-right"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant={filterType === 'all' ? 'default' : 'ghost'} onClick={() => setFilterType('all')} className="rounded-full">الكل</Button>
            <Button variant={filterType === 'debt' ? 'destructive' : 'ghost'} onClick={() => setFilterType('debt')} className="rounded-full">مدينون</Button>
          </div>
        </div>
        <div className="rounded-3xl border bg-card overflow-hidden shadow-soft">
          <Table className="text-right">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right py-5">الاسم الكامل</TableHead>
                <TableHead className="text-right">رقم الهاتف</TableHead>
                <TableHead className="text-right">الرصيد الحالي</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-left px-8">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={5}><div className="h-10 bg-muted animate-pulse rounded" /></TableCell></TableRow> : filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-bold py-6">{c.name}</TableCell>
                  <TableCell className="font-mono">{c.phone}</TableCell>
                  <TableCell className={cn("font-bold text-lg", c.currentBalance > 0 ? "text-rose-600" : "text-green-600")}>
                    {c.currentBalance.toLocaleString()} ر.س
                  </TableCell>
                  <TableCell><Badge variant="outline" className={c.currentBalance > 0 ? "text-rose-600 bg-rose-50" : ""}>{c.currentBalance > 0 ? 'مدين' : 'سليم'}</Badge></TableCell>
                  <TableCell className="text-left px-8">
                    <div className="flex items-center gap-2">
                      {canWrite && (
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted text-muted-foreground"><Edit2 className="size-4" /></Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)} className="rounded-full hover:bg-rose-50 text-rose-500"><Trash2 className="size-4" /></Button>
                      )}
                      <Button variant="ghost" size="icon" className="rounded-full text-pharmav-primary"><ChevronRight className="size-4 rotate-180" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="pt-12 text-center text-muted-foreground text-[10px] border-t">
          <p>© 2026 فارمافولت • إدارة RBAC مفعلة</p>
        </div>
      </div>
      <CustomerForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </AppLayout>
  );
}