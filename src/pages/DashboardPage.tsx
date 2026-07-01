import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  AlertTriangle,
  PackageCheck,
  TrendingUp,
  Clock,
  ArrowLeft,
  Plus,
  Receipt,
  ShoppingCart,
  Activity,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import type { DashboardStats, Alert } from '@shared/types';
import { ProductForm } from '@/components/inventory/ProductForm';
import { ExpenseForm } from '@/components/finance/ExpenseForm';
const chartData = [
  { name: 'الإثنين', sales: 4000 },
  { name: 'الثلاثاء', sales: 3000 },
  { name: 'الأربعاء', sales: 2000 },
  { name: 'الخميس', sales: 2780 },
  { name: 'الجمعة', sales: 1890 },
  { name: 'السبت', sales: 2390 },
  { name: 'الأحد', sales: 3490 },
];
export function DashboardPage() {
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api<DashboardStats>('/api/stats')
  });
  const { data: alertsData } = useQuery<{ items: Alert[] }>({
    queryKey: ['alerts'],
    queryFn: () => api<{ items: Alert[] }>('/api/alerts')
  });
  const activeAlerts = alertsData?.items.filter(a => a.status === 'active') ?? [];
  const highAlerts = activeAlerts.filter(a => a.severity === 'high').length;
  const cards = [
    {
      title: 'إجمالي الإيرادات',
      value: `${stats?.totalSales?.toLocaleString() ?? '0'} ر.س`,
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      desc: '+12.5% منذ الشهر الماضي'
    },
    {
      title: 'حجم المبيعات',
      value: stats?.totalOrders?.toString() ?? '0',
      icon: <ShoppingBag className="h-4 w-4 text-blue-500" />,
      desc: 'عملية مكتملة'
    },
    {
      title: 'نقص المخزون',
      value: stats?.lowStockItems?.toString() ?? '0',
      icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      desc: 'أصناف تحتاج طلب'
    },
    {
      title: 'أدوية منتهية قريباً',
      value: stats?.expiredSoonCount?.toString() ?? '0',
      icon: <Calendar className="h-4 w-4 text-rose-500" />,
      desc: 'خلال 30 يوم'
    },
  ];
  return (
    <AppLayout container>
      <div className="space-y-8" dir="rtl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-3xl font-display font-bold">لوحة التحكم</h1>
            <p className="text-muted-foreground">مرحباً بك مجدداً. إليك لمحة سريعة عن صحة الصيدلية اليوم.</p>
          </div>
          <div className="flex gap-2 flex-row-reverse">
            <Button asChild className="rounded-xl h-12 px-6 bg-pharmav-primary shadow-neon-blue font-bold">
              <Link to="/pos"><ShoppingCart className="ml-2 size-4" /> بيع سريع</Link>
            </Button>
            <Button variant="outline" onClick={() => setIsProductFormOpen(true)} className="rounded-xl h-12 px-6 border-2 font-bold">
              <Plus className="ml-2 size-4" /> دواء جديد
            </Button>
            <Button variant="ghost" onClick={() => setIsExpenseFormOpen(true)} className="rounded-xl h-12 px-6 font-bold">
              <Receipt className="ml-2 size-4" /> مصروف
            </Button>
          </div>
        </div>
        {/* System Health Section */}
        {highAlerts > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4 flex-row-reverse text-right">
              <div className="size-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 animate-pulse">
                <Activity className="size-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-rose-700">تنبيهات حرجة تتطلب تدخلاً</h3>
                <p className="text-rose-600/80 text-sm">هناك {highAlerts} تنبيهاً شديد الخطورة في النظام حالياً.</p>
              </div>
            </div>
            <Button asChild variant="destructive" className="rounded-xl font-bold px-8 h-11">
              <Link to="/alerts">معالجة التنبيهات</Link>
            </Button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <Card key={i} className="glass-card text-right">
              <CardHeader className="flex flex-row-reverse items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                ) : (
                  <div className="text-2xl font-display font-bold">{card.value}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-card text-right">
            <CardHeader>
              <CardTitle className="text-base font-semibold">نظرة عامة على المبيعات</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} orientation="right" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', textAlign: 'right' }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="hsl(var(--pharmav-primary))" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="glass-card text-right">
            <CardHeader className="flex flex-row-reverse items-center justify-between">
              <CardTitle className="text-base font-semibold">أحدث العمليات</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.recentSales && stats.recentSales.length > 0 ? (
                stats.recentSales.map((sale) => (
                  <div key={sale.id} className="flex flex-row-reverse items-center justify-between group">
                    <div className="flex flex-row-reverse items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                        #{sale.id.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{sale.paymentMethod === 'card' ? 'بطاقة' : 'نقداً'}</div>
                        <div className="text-xs text-muted-foreground">بواسطة الصيدلي</div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-green-600 dark:text-green-400">+{sale.totalAmount.toFixed(2)} ر.س</div>
                      <Badge variant="outline" className="text-[10px] py-0">مكتمل</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-muted-foreground italic text-sm">لا توجد عمليات بيع حديثة.</div>
              )}
              <div className="pt-4 border-t">
                <Link to="/sales" className="text-sm font-medium text-pharmav-primary flex flex-row-reverse items-center gap-1 hover:underline">
                  عرض كل العمليات <ArrowLeft className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ProductForm open={isProductFormOpen} onOpenChange={setIsProductFormOpen} />
      <ExpenseForm open={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen} />
    </AppLayout>
  );
}