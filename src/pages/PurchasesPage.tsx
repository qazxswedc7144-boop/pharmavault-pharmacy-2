import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Truck,
  Plus,
  Search,
  Package,
  MoreVertical,
  TrendingUp,
  AlertCircle,
  FileDown,
  Filter,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from '@/lib/api-client';
import type { PurchaseOrder, Supplier } from '@shared/types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
export function PurchasesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();
  const { data: ordersData, isLoading } = useQuery<{ items: PurchaseOrder[] }>({
    queryKey: ['purchases'],
    queryFn: () => api<{ items: PurchaseOrder[] }>('/api/purchases')
  });
  const { data: suppliersData } = useQuery<{ items: Supplier[] }>({
    queryKey: ['suppliers'],
    queryFn: () => api<{ items: Supplier[] }>('/api/suppliers')
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/purchases/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success('تم حذف فاتورة الشراء بنجاح');
    }
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
  const handleExportExcel = () => {
    if (filteredOrders.length === 0) return toast.error('لا توجد فواتير لتصديرها');
    const data = filteredOrders.map(o => ({
      'رقم الفاتورة': o.invoiceNumber || o.id.slice(0,8),
      'المورد': suppliers.find(s => s.id === o.supplierId)?.name || 'مورد عام',
      'التاريخ': format(new Date(o.timestamp), 'yyyy-MM-dd'),
      'القيمة': o.totalCost,
      'الأصناف': o.items.length,
      'الحالة': o.status === 'received' ? 'مكتمل' : 'معلق'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchases");
    XLSX.writeFile(wb, `PharmaVault_Purchases_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('تم تصدير ملف Excel بنجاح');
  };
  return (
    <AppLayout container>
      <div className="space-y-8 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-pharmav-primary">إدارة المشتريات</h1>
            <p className="text-muted-foreground mt-2 text-lg">مراقبة التوريد، فواتير الشركات، وحركة المخزون الواردة.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportExcel} className="h-12 px-6 gap-2 border-2">
              <FileDown className="size-4" /> تصدير السجل
            </Button>
            <Button asChild className="gap-2 bg-pharmav-primary hover:bg-pharmav-primary/90 font-bold shadow-neon-blue h-12 px-8 rounded-xl">
              <Link to="/purchases/new"><Plus className="size-5" /> فاتورة شراء جديدة</Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card border-none"><CardContent className="p-6"><p className="text-xs font-bold text-muted-foreground mb-1">عدد الفواتير</p><div className="text-2xl font-bold">{filteredOrders.length}</div></CardContent></Card>
          <Card className="glass-card border-none"><CardContent className="p-6"><p className="text-xs font-bold text-muted-foreground mb-1">إجمالي المشتريات</p><div className="text-2xl font-bold">{filteredOrders.reduce((s, o) => s + o.totalCost, 0).toLocaleString()} ر.س</div></CardContent></Card>
        </div>
        <div className="rounded-3xl border bg-card overflow-hidden shadow-soft">
          <Table className="text-right">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right py-5">رقم الفاتورة</TableHead>
                <TableHead className="text-right">المورد / الشركة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">قيمة الفاتورة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-left"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={6}><div className="h-10 bg-muted animate-pulse rounded" /></TableCell></TableRow> : filteredOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono font-bold">{o.invoiceNumber || o.id.slice(0,8)}</TableCell>
                  <TableCell className="font-bold">{suppliers.find(s => s.id === o.supplierId)?.name || 'مورد عام'}</TableCell>
                  <TableCell>{format(new Date(o.timestamp), 'dd MMM yyyy', { locale: ar })}</TableCell>
                  <TableCell className="font-bold text-lg">{o.totalCost.toLocaleString()} ر.س</TableCell>
                  <TableCell><Badge variant="outline" className={o.status === 'received' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10'}>{o.status === 'received' ? 'مكتمل' : 'معلق'}</Badge></TableCell>
                  <TableCell className="text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="text-right">
                        <DropdownMenuItem className="flex-row-reverse gap-2"><Eye className="size-4" /> عرض التفاصيل</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive flex-row-reverse gap-2" onClick={() => { if(confirm('هل أنت متأكد؟')) deleteMutation.mutate(o.id); }}><Trash2 className="size-4" /> حذف الفاتورة</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="pt-12 text-center text-muted-foreground text-xs border-t">
          <p>تطوير د/ عبدالله طاهر مفرح (772093714) • جميع الحقوق محفوظة لعام 2026</p>
        </div>
      </div>
    </AppLayout>
  );
}