import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Search,
  Plus,
  TrendingUp,
  AlertCircle,
  CreditCard,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import type { Customer } from '@shared/types';
import { cn } from '@/lib/utils';
import { SupplierForm as CustomerForm } from '@/components/inventory/SupplierForm'; // Reuse structure for now or specialized form
export function CustomersPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'debt'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: customersData, isLoading } = useQuery<{ items: Customer[] }>({
    queryKey: ['customers'],
    queryFn: () => api<{ items: Customer[] }>('/api/customers')
  });
  const customers = useMemo(() => customersData?.items ?? [], [customersData?.items]);
  const filtered = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
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
          <Button onClick={() => setIsFormOpen(true)} className="gap-2 h-12 px-8 bg-pharmav-primary font-bold shadow-neon-blue rounded-xl flex-row-reverse">
            <Plus className="size-5" /> إضافة عميل جديد
          </Button>
        </div>
        <div className="rounded-3xl border bg-card overflow-hidden shadow-soft">
          <Table className="text-right">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right py-5">الاسم الكامل</TableHead>
                <TableHead className="text-right">رقم الهاتف</TableHead>
                <TableHead className="text-right">الرصيد الحالي</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-left px-8"></TableHead>
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
                  <TableCell><Badge variant="outline">{c.currentBalance > 0 ? 'مدين' : 'سليم'}</Badge></TableCell>
                  <TableCell className="text-left px-8"><Button variant="ghost" size="icon"><ChevronRight className="size-4 rotate-180" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="pt-12 text-center text-muted-foreground text-xs border-t">
          <p>نظام فارمافولت الموحد • م/ عبدالله طاهر مفرح (772093714) • 2026</p>
        </div>
      </div>
      {/* Mock usage of SupplierForm as placeholder if CustomerForm is not yet separated */}
      <CustomerForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </AppLayout>
  );
}