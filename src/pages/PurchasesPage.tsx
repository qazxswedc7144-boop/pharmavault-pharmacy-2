import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Truck, 
  Plus, 
  Search, 
  Package, 
  MoreVertical, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  FileDown, 
  Filter,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import type { PurchaseOrder, Supplier } from '@shared/types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
export function PurchasesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: ordersData, isLoading } = useQuery<{ items: PurchaseOrder[] }>({
    queryKey: ['purchases'],
    queryFn: () => api<{ items: PurchaseOrder[] }>('/api/purchases')
  });
  const { data: suppliersData } = useQuery<{ items: Supplier[] }>({
    queryKey: ['suppliers'],
    queryFn: () => api<{ items: Supplier[] }>('/api/suppliers')
  });
  const suppliers = suppliersData?.items ?? [];
  const orders = useMemo(() => ordersData?.items ?? [], [ordersData]);
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);
  const stats = [
    { title: 'إجمالي مشتريات الشهر', value: '42,850 ر.س', icon: <TrendingUp className="size-4 text-green-500" />, trend: '+12%' },
    { title: 'طلبات قيد الانتظار', value: '5', icon: <AlertCircle className="size-4 text-orange-500" />, trend: '2 متأخرة' },
    { title: 'الموردين النشطين', value: suppliers.length.toString(), icon: <Truck className="size-4 text-blue-500" />, trend: 'مستقر' },
    { title: 'مرتجعات معلقة', value: '3', icon: <Package className="size-4 text-rose-500" />, trend: '-5%' },
  ];
  return (
    <AppLayout container>
      <div className="space-y-8 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-pharmav-primary">إدارة المشتريات</h1>
            <p className="text-muted-foreground mt-2 text-lg">مراقبة التوريد، فواتير الشركات، وحركة المخزون الواردة.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-12 px-6 gap-2 border-2">
              <FileDown className="size-4" /> تصدير التقارير
            </Button>
            <Button asChild className="gap-2 bg-pharmav-primary hover:bg-pharmav-primary/90 font-bold shadow-neon-blue h-12 px-8 rounded-xl">
              <Link to="/purchases/new">
                <Plus className="size-5" /> فاتورة شراء جديدة
              </Link>
            </Button>
          </div>
        </div>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <Card key={i} className="glass-card border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                {s.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-display">{s.value}</div>
                <div className="text-xs text-green-500 mt-1 flex items-center gap-1 justify-end">
                  {s.trend} <ArrowUpRight className="size-3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-6 rounded-3xl border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="البحث برقم الفاتورة أو كود الطلب..." 
              className="h-12 pr-12 bg-muted/30 border-none text-lg text-right" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 w-full md:w-48 bg-muted/30 border-none text-right">
              <Filter className="ml-2 size-4 opacity-50" />
              <SelectValue placeholder="تصفية الحالة" />
            </SelectTrigger>
            <SelectContent className="text-right">
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="received">تم الاستلام</SelectItem>
              <SelectItem value="pending">قيد الانتظار</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
          <div className="mr-auto text-sm font-bold text-pharmav-primary">
            {filteredOrders.length} فاتورة مسجلة
          </div>
        </div>
        {/* Orders Table */}
        <div className="rounded-3xl border bg-card overflow-hidden shadow-soft">
          <Table className="text-right">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right py-5">رقم الفاتورة</TableHead>
                <TableHead className="text-right">المورد / الشركة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">قيمة الفاتورة</TableHead>
                <TableHead className="text-right">الأصناف</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-left"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7} className="py-8"><div className="h-10 bg-muted animate-pulse rounded-xl" /></TableCell></TableRow>
                ))
              ) : filteredOrders.map((o) => (
                <TableRow key={o.id} className="hover:bg-muted/20 transition-colors group">
                  <TableCell className="font-mono font-bold text-sm">
                    {o.invoiceNumber || `#${o.id.slice(0, 8)}`}
                    {!o.invoiceNumber && <Badge variant="outline" className="mr-2 scale-75 opacity-50">تلقائي</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="font-bold">{suppliers.find(s => s.id === o.supplierId)?.name || 'مورد عام'}</span>
                      <Truck className="size-4 text-muted-foreground opacity-40" />
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(o.timestamp), 'dd MMMM yyyy', { locale: ar })}
                  </TableCell>
                  <TableCell className="font-bold text-lg">{o.totalCost.toLocaleString()} ر.س</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="bg-muted px-2 py-0.5 rounded text-xs">{o.items.length} أصناف</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      o.status === 'received' ? 'bg-green-500/10 text-green-600 border-green-500/20 font-bold' :
                      o.status === 'pending' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20 font-bold' :
                      'bg-red-500/10 text-red-600 border-red-500/20 font-bold'
                    }>
                      {o.status === 'received' ? 'مكتمل' : o.status === 'pending' ? 'بانتظار الاستلام' : 'ملغي'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    <Button variant="ghost" size="icon" className="group-hover:bg-pharmav-primary group-hover:text-white transition-all rounded-full">
                      <MoreVertical className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && filteredOrders.length === 0 && (
            <div className="py-24 text-center text-muted-foreground">
              <Package className="size-16 mx-auto opacity-10 mb-4" />
              <p className="text-xl font-display">لم يتم العثور على فواتير تطابق البحث.</p>
            </div>
          )}
        </div>
        {/* Pagination Simulation */}
        <div className="flex items-center justify-between border-t pt-6">
          <div className="text-sm text-muted-foreground">عرض 1-10 من أصل {filteredOrders.length} عملية</div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-xl"><ChevronRight className="size-4" /></Button>
            <Button variant="outline" size="icon" className="rounded-xl bg-pharmav-primary text-white border-pharmav-primary">1</Button>
            <Button variant="outline" size="icon" className="rounded-xl"><ChevronLeft className="size-4" /></Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}