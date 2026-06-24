import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ShoppingBag, 
  AlertTriangle, 
  PackageCheck, 
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import type { DashboardStats } from '@shared/types';
const chartData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];
export function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api<DashboardStats>('/api/stats')
  });
  const cards = [
    { 
      title: 'Total Revenue', 
      value: `$${stats?.totalSales?.toLocaleString() ?? '0'}`, 
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      desc: '+12.5% from last month' 
    },
    { 
      title: 'Sales Volume', 
      value: stats?.totalOrders?.toString() ?? '0', 
      icon: <ShoppingBag className="h-4 w-4 text-blue-500" />,
      desc: 'Active today' 
    },
    { 
      title: 'Low Stock Alerts', 
      value: stats?.lowStockItems?.toString() ?? '0', 
      icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      desc: 'Requires attention' 
    },
    { 
      title: 'Inventory Health', 
      value: '94%', 
      icon: <PackageCheck className="h-4 w-4 text-pharmav-primary" />,
      desc: 'Stable stock levels' 
    },
  ];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Dr. Smith. Here's what's happening today.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <Card key={i} className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                ) : (
                  <div className="text-2xl font-bold">{card.value}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Sales Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="hsl(var(--pharmav-primary))" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Sales</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.recentSales?.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                      #{sale.id.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{sale.paymentMethod.toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground">2 mins ago</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">+${sale.totalAmount.toFixed(2)}</div>
                    <Badge variant="outline" className="text-[10px] py-0">Completed</Badge>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <button className="text-sm font-medium text-pharmav-primary flex items-center gap-1 hover:underline">
                  View all transactions <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}