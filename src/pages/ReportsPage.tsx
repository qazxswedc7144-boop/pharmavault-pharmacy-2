import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, DollarSign, Package, PieChart as PieIcon } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { api } from '@/lib/api-client';
import type { AnalyticsReport } from '@shared/types';
const COLORS = ['#2C7BE5', '#28A745', '#FFC107', '#E83E8C', '#6F42C1'];
export function ReportsPage() {
  const { data: analytics, isLoading } = useQuery<AnalyticsReport>({
    queryKey: ['analytics'],
    queryFn: () => api<AnalyticsReport>('/api/reports/analytics')
  });
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">Deep insights into your pharmacy business performance.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="size-4" /> Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics?.profitSummary.revenue.toLocaleString() ?? '0'}</div>
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <TrendingUp className="size-3" /> +14.2% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="size-4" /> Inventory Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics?.inventoryValue.toLocaleString() ?? '0'}</div>
              <p className="text-xs text-muted-foreground mt-1">Cost basis valuation</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <PieIcon className="size-4" /> Est. Gross Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics?.profitSummary.profit.toLocaleString() ?? '0'}</div>
              <p className="text-xs text-blue-500 mt-1">~24.5% margin</p>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="inventory" className="rounded-lg">Inventory Distribution</TabsTrigger>
            <TabsTrigger value="sales" className="rounded-lg">Sales Trends</TabsTrigger>
          </TabsList>
          <TabsContent value="inventory" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Inventory Value by Category</CardTitle>
                <CardDescription>Monetary value of current stock across therapeutic classes.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.categoryDistribution ?? []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar dataKey="value" fill="#2C7BE5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sales" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Monthly Revenue Performance</CardTitle>
                <CardDescription>Visualizing sales growth and seasonal fluctuations.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <div className="flex items-center justify-center h-full text-muted-foreground italic">
                  Advanced trend data will appear as more transactions are recorded.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}