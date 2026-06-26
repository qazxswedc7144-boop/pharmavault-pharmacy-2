import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, Users, DollarSign } from 'lucide-react';
import type { ReportType } from '@/pages/ReportsPage';
import { cn } from '@/lib/utils';
interface ReportContainerProps {
  type: ReportType;
  dateRange: { from: string; to: string };
}
const chartData = [
  { name: 'الأسبوع 1', val: 4500, cost: 3200 },
  { name: 'الأسبوع 2', val: 5200, cost: 3800 },
  { name: 'الأسبوع 3', val: 4800, cost: 3400 },
  { name: 'الأسبوع 4', val: 6100, cost: 4200 },
];
export function ReportContainer({ type, dateRange }: ReportContainerProps) {
  const kpis = [
    { title: 'إجمالي المبيعات', value: '142,500 ر.س', icon: DollarSign, trend: '+12.5%', color: 'text-green-500' },
    { title: 'عدد الفواتير', value: '1,284', icon: TrendingUp, trend: '+8.2%', color: 'text-blue-500' },
    { title: 'متوسط قيمة الطلب', value: '110.9 ر.س', icon: Users, trend: '-2.1%', color: 'text-orange-500' },
    { title: 'الأصناف المباعة', value: '4,520', icon: Package, trend: '+15.4%', color: 'text-purple-500' },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="glass-card border-none overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4 flex-row-reverse">
                <div className={cn("p-3 rounded-2xl bg-muted group-hover:scale-110 transition-transform", kpi.color)}>
                  <kpi.icon className="size-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold bg-green-500/10 text-green-600 border-none">
                  {kpi.trend}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{kpi.title}</p>
                <h3 className="text-2xl font-display font-bold">{kpi.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="glass-card border-none">
        <CardHeader className="flex flex-row-reverse items-center justify-between border-b pb-4">
          <CardTitle className="text-lg font-display">مخطط الأداء البياني</CardTitle>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground"><div className="size-2 rounded-full bg-pharmav-primary" /> الإيراد</div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground"><div className="size-2 rounded-full bg-green-500" /> الربح</div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} orientation="right" />
              <Tooltip
                cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', textAlign: 'right' }}
              />
              <Bar dataKey="val" fill="hsl(var(--pharmav-primary))" radius={[6, 6, 0, 0]} barSize={40} />
              <Bar dataKey="cost" fill="#28A745" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="glass-card border-none overflow-hidden">
        <div className="p-6 border-b bg-muted/20 flex items-center justify-between flex-row-reverse">
          <h3 className="font-display font-bold">تفاصيل العمليات</h3>
          <Badge variant="outline" className="font-mono">CSV / Excel / PDF</Badge>
        </div>
        <Table className="text-right">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-right py-4">رقم العملية</TableHead>
              <TableHead className="text-right">البيان / الوصف</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-muted/30 border-b">
                <TableCell className="font-mono font-bold text-xs">#INV-2024-00{i+1}</TableCell>
                <TableCell className="font-medium text-sm">مبيعات صيدلية - فرع 01</TableCell>
                <TableCell className="text-muted-foreground text-xs">2024-05-{10+i}</TableCell>
                <TableCell className="font-bold">{(1250 * (i+1)).toLocaleString()} ر.س</TableCell>
                <TableCell><Badge variant="outline" className="bg-green-500/10 text-green-600 border-none font-bold">مكتمل</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}