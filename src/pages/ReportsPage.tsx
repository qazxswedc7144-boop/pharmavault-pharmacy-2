import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, DollarSign, Package, PieChart as PieIcon } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { api } from '@/lib/api-client';
import type { AnalyticsReport } from '@shared/types';
export function ReportsPage() {
  const { data: analytics, isLoading } = useQuery<AnalyticsReport>({
    queryKey: ['analytics'],
    queryFn: () => api<AnalyticsReport>('/api/reports/analytics')
  });
  return (
    <AppLayout container>
      <div className="space-y-8 text-right" dir="rtl">
        <div>
          <h1 className="text-3xl font-display font-bold">التحليلات والتقارير</h1>
          <p className="text-muted-foreground">نظرة عميقة على أداء صيدليتك ونمو الأعمال.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-end gap-2">
                <span>إجمالي الإيرادات</span>
                <DollarSign className="size-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.profitSummary.revenue.toLocaleString() ?? '0'} ر.س</div>
              <p className="text-xs text-green-500 mt-1 flex items-center justify-end gap-1">
                <span>+14.2% مقارنة بالشهر الماضي</span>
                <TrendingUp className="size-3" />
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-end gap-2">
                <span>قيمة المخزون</span>
                <Package className="size-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.inventoryValue.toLocaleString() ?? '0'} ر.س</div>
              <p className="text-xs text-muted-foreground mt-1">بناءً على سعر التكلفة</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-end gap-2">
                <span>الربح التقديري</span>
                <PieIcon className="size-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.profitSummary.profit.toLocaleString() ?? '0'} ر.س</div>
              <p className="text-xs text-blue-500 mt-1">هامش ربح تقريبي 24.5%</p>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="inventory" className="w-full">
          <div className="flex justify-end">
            <TabsList className="bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="sales" className="rounded-lg">اتجاهات المبيعات</TabsTrigger>
              <TabsTrigger value="inventory" className="rounded-lg">توزيع المخزون</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="inventory" className="mt-6">
            <Card className="glass-card text-right">
              <CardHeader>
                <CardTitle className="font-display">قيمة المخزون حسب التصنيف</CardTitle>
                <CardDescription>القيمة المالية الحالية للأدوية مقسمة حسب الفئات العلاجية.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.categoryDistribution ?? []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" orientation="bottom" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12}} />
                    <YAxis orientation="right" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12}} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', textAlign: 'right' }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--pharmav-primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sales" className="mt-6">
            <Card className="glass-card text-right">
              <CardHeader>
                <CardTitle className="font-display">أداء الإيرادات الشهري</CardTitle>
                <CardDescription>متابعة نمو المبيعات والتقلبات الموسمية.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <div className="flex items-center justify-center h-full text-muted-foreground italic">
                  ستظهر البيانات التحليلية المتقدمة فور تسجيل المزيد من العمليات.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}