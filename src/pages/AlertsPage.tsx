import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Package, 
  Calendar, 
  CreditCard,
  Filter,
  XCircle
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import type { Alert } from '@shared/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
export function AlertsPage() {
  const queryClient = useQueryClient();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const { data: alertsData, isLoading } = useQuery<{ items: Alert[] }>({
    queryKey: ['alerts'],
    queryFn: () => api<{ items: Alert[] }>('/api/alerts')
  });
  const alerts = useMemo(() => alertsData?.items ?? [], [alertsData]);
  const stats = useMemo(() => {
    return {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
    };
  }, [alerts]);
  const filteredAlerts = useMemo(() => {
    if (filterSeverity === 'all') return alerts;
    return alerts.filter(a => a.severity === filterSeverity);
  }, [alerts, filterSeverity]);
  const resolveMutation = useMutation({
    mutationFn: (id: string) => api(`/api/alerts/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'resolved' }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts-count'] });
      toast.success('تم تحديد التنبيه كمقروء');
    }
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/alerts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts-count'] });
      toast.success('تم حذف التنبيه بنجاح');
    }
  });
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return <Badge variant="destructive" className="font-bold">خطير</Badge>;
      case 'medium': return <Badge variant="secondary" className="bg-orange-500 text-white font-bold border-none">مرتفع</Badge>;
      default: return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 font-bold">متوسط</Badge>;
    }
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'expiry': return <Calendar className="size-4 text-orange-500" />;
      case 'stock': return <Package className="size-4 text-blue-500" />;
      default: return <CreditCard className="size-4 text-purple-500" />;
    }
  };
  return (
    <AppLayout container>
      <div className="space-y-8 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-pharmav-primary">مركز التنبيهات</h1>
            <p className="text-muted-foreground mt-2 text-lg">مراقبة المخزون، تواريخ انتهاء الصلاحية، والتجاوزات المالية.</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="h-11 rounded-xl" onClick={() => queryClient.invalidateQueries({ queryKey: ['alerts'] })}>
               تحديث البيانات
             </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card border-none bg-red-500/5">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-xs uppercase text-red-600 font-bold">تنبيهات خطيرة</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-red-600">{stats.critical}</div></CardContent>
          </Card>
          <Card className="glass-card border-none bg-orange-500/5">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-xs uppercase text-orange-600 font-bold">تنبيهات مرتفعة</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-orange-600">{stats.medium}</div></CardContent>
          </Card>
          <Card className="glass-card border-none bg-blue-500/5">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-xs uppercase text-blue-600 font-bold">تنبيهات عادية</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-blue-600">{stats.low}</div></CardContent>
          </Card>
          <Card className="glass-card border-none bg-muted/50">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-xs uppercase text-muted-foreground font-bold">الإجمالي</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold">{stats.total}</div></CardContent>
          </Card>
        </div>
        <div className="flex items-center gap-4 bg-card p-4 rounded-3xl border shadow-sm flex-row-reverse">
          <div className="flex items-center gap-2 flex-row-reverse">
            <Filter className="size-4 text-muted-foreground" />
            <span className="text-sm font-bold ml-4">تصفية حسب:</span>
          </div>
          <div className="flex gap-2">
            <Button variant={filterSeverity === 'all' ? 'default' : 'ghost'} onClick={() => setFilterSeverity('all')} className="rounded-full px-6">الكل</Button>
            <Button variant={filterSeverity === 'high' ? 'destructive' : 'ghost'} onClick={() => setFilterSeverity('high')} className="rounded-full px-6">خطير</Button>
            <Button variant={filterSeverity === 'medium' ? 'secondary' : 'ghost'} onClick={() => setFilterSeverity('medium')} className="rounded-full px-6">مرتفع</Button>
            <Button variant={filterSeverity === 'low' ? 'outline' : 'ghost'} onClick={() => setFilterSeverity('low')} className="rounded-full px-6">منخفض</Button>
          </div>
        </div>
        <div className="rounded-3xl border bg-card overflow-hidden shadow-soft">
          <Table className="text-right">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right py-5">النوع</TableHead>
                <TableHead className="text-right">الرسالة</TableHead>
                <TableHead className="text-right">الدرجة</TableHead>
                <TableHead className="text-right">التوقيت</TableHead>
                <TableHead className="text-left px-8">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5} className="py-8"><div className="h-10 bg-muted animate-pulse rounded-xl" /></TableCell></TableRow>
                ))
              ) : filteredAlerts.map((alert) => (
                <TableRow key={alert.id} className={cn("hover:bg-muted/20 transition-colors group", alert.status === 'resolved' ? 'opacity-50' : '')}>
                  <TableCell className="py-6">
                    <div className="flex items-center gap-3 justify-end">
                      <span className="text-xs font-bold text-muted-foreground">{alert.type === 'stock' ? 'مخزون' : alert.type === 'expiry' ? 'صلاحية' : 'مالي'}</span>
                      <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
                        {getTypeIcon(alert.type)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-base max-w-md">{alert.message}</TableCell>
                  <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(alert.timestamp), 'dd MMM HH:mm', { locale: ar })}
                  </TableCell>
                  <TableCell className="text-left px-8">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full text-red-500 hover:bg-red-50"
                        onClick={() => deleteMutation.mutate(alert.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                      {alert.status === 'active' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full text-green-600 hover:bg-green-50"
                          onClick={() => resolveMutation.mutate(alert.id)}
                        >
                          <CheckCircle2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && filteredAlerts.length === 0 && (
            <div className="py-24 text-center text-muted-foreground space-y-4">
              <Bell className="size-16 mx-auto opacity-10" />
              <p className="text-xl font-display">لا توجد تنبيهات نشطة حالياً</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}