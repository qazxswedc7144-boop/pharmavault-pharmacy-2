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
export function CustomersPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'debt'>('all');
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
  const stats = useMemo(() => [
    { title: 'إجمالي العملاء', value: customers.length.toString(), icon: Users, color: 'text-blue-500' },
    { title: 'الذمم المدينة', value: customers.reduce((sum, c) => sum + c.currentBalance, 0).toLocaleString() + ' ر.س', icon: TrendingUp, color: 'text-rose-500' },
    { title: 'نشطون مؤخراً', value: Math.ceil(customers.length * 0.7).toString(), icon: CreditCard, color: 'text-green-500' },
    { title: 'تجاوز الحد الائتماني', value: customers.filter(c => c.currentBalance > c.creditLimit).length.toString(), icon: AlertCircle, color: 'text-orange-500' },
  ], [customers]);
  const getAgingBadge = (balance: number) => {
    if (balance <= 0) return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">سليم</Badge>;
    if (balance > 5000) return <Badge variant="destructive" className="font-bold">60+ يوم</Badge>;
    return <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-200">30 يوم</Badge>;
  };
  return (
    <AppLayout container>
      <div className="space-y-8 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="text-right">
            <h1 className="text-4xl font-display font-bold text-pharmav-primary">قاعدة بيانات العملاء</h1>
            <p className="text-muted-foreground mt-2 text-lg">إدارة الحسابات الشخصية، السجل الطبي، والذمم المالية.</p>
          </div>
          <Button className="gap-2 h-12 px-8 bg-pharmav-primary font-bold shadow-neon-blue rounded-xl flex-row-reverse">
            <Plus className="size-5" /> إضافة عميل جديد
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <Card key={i} className="glass-card border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                <s.icon className={cn("size-4", s.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-display">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-6 rounded-3xl border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="البحث بالاسم أو رقم الهاتف..."
              className="h-12 pr-12 bg-muted/30 border-none text-lg text-right"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              className="h-12 rounded-xl px-6"
            >
              الكل
            </Button>
            <Button
              variant={filterType === 'debt' ? 'default' : 'outline'}
              onClick={() => setFilterType('debt')}
              className="h-12 rounded-xl px-6"
            >
              مدينون فقط
            </Button>
          </div>
        </div>
        <div className="rounded-3xl border bg-card overflow-hidden shadow-soft">
          <Table className="text-right">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right py-5">الاسم الكامل</TableHead>
                <TableHead className="text-right">معلومات الاتصال</TableHead>
                <TableHead className="text-right">الرصيد الحالي</TableHead>
                <TableHead className="text-right">الحد الائتماني</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-left"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6} className="py-8"><div className="h-10 bg-muted animate-pulse rounded-xl" /></TableCell></TableRow>
                ))
              ) : filtered.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/20 transition-colors group">
                  <TableCell className="font-bold py-6">
                    <div className="flex items-center gap-3 justify-end">
                      <span className="text-base">{c.name}</span>
                      <div className="size-8 rounded-full bg-pharmav-primary/10 text-pharmav-primary flex items-center justify-center font-display text-xs">
                        {c.name.charAt(0)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs text-muted-foreground items-end gap-1">
                      <div className="flex items-center gap-2 flex-row-reverse"><Phone className="size-3" /> {c.phone}</div>
                      <div className="flex items-center gap-2 flex-row-reverse"><Mail className="size-3" /> {c.email || 'غير مسجل'}</div>
                    </div>
                  </TableCell>
                  <TableCell className={cn("font-bold text-lg", c.currentBalance > 0 ? "text-rose-600" : "text-green-600")}>
                    {c.currentBalance.toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">
                    {c.creditLimit.toLocaleString()} ر.س
                  </TableCell>
                  <TableCell>
                    {getAgingBadge(c.currentBalance)}
                  </TableCell>
                  <TableCell className="text-left">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-pharmav-primary hover:text-white transition-all">
                      <ChevronRight className="size-4 rotate-180" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && filtered.length === 0 && (
            <div className="py-24 text-center text-muted-foreground space-y-4">
              <Users className="size-16 mx-auto opacity-10" />
              <p className="text-xl font-display">لم يتم العثور على أي عملاء</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}