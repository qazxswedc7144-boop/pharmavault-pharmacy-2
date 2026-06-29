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
    <div className="space-y-6 bg-white p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 print:grid-cols-2">
        {kpis.map((kpi, i) => (
          <Card key={i} className="border border-border/50 shadow-none print:border-gray-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4 flex-row-reverse">
                <div className={cn("p-3 rounded-2xl bg-muted print:bg-gray-100", kpi.color)}>
                  <kpi.icon className="size-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold bg-green-500/10 text-green-600 border-none print:text-green-800">
                  {kpi.trend}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 print:text-gray-600">{kpi.title}</p>
                <h3 className="text-2xl font-display font-bold print:text-black">{kpi.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border border-border/50 shadow-none print:border-gray-300">
        <CardHeader className="flex flex-row-reverse items-center justify-between border-b pb-4 bg-muted/10 print:bg-gray-50">
          <CardTitle className="text-lg font-display">مخطط الأداء البياني للفترة ({dateRange.from} إلى {dateRange.to})</CardTitle>
          <div className="flex gap-2 no-print">
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground"><div className="size-2 rounded-full bg-pharmav-primary" /> الإيراد</div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground"><div className="size-2 rounded-full bg-green-500" /> الربح</div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} orientation="right" />
              <Tooltip
                cursor={{fill: 'rgba(0,0,0,0.05)'}}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', textAlign: 'right' }}
              />
              <Bar dataKey="val" fill="#2C7BE5" radius={[6, 6, 0, 0]} barSize={40} />
              <Bar dataKey="cost" fill="#28A745" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="border border-border/50 shadow-none overflow-hidden print:border-gray-300">
        <div className="p-4 border-b bg-muted/20 flex items-center justify-between flex-row-reverse print:bg-gray-50">
          <h3 className="font-display font-bold">جدول تفصيلي بالعمليات المالية ({type.toUpperCase()})</h3>
          <span className="text-[10px] text-muted-foreground font-mono">PharmaVault Reporting Service</span>
        </div>
        <div className="overflow-x-auto">
          <Table className="text-right w-full border-collapse">
            <TableHeader className="bg-muted/40 print:bg-gray-100">
              <TableRow>
                <TableHead className="text-right py-4 font-bold text-black border-b">رقم العملية</TableHead>
                <TableHead className="text-right font-bold text-black border-b">البيان / الوصف</TableHead>
                <TableHead className="text-right font-bold text-black border-b">التاريخ</TableHead>
                <TableHead className="text-right font-bold text-black border-b">المبلغ</TableHead>
                <TableHead className="text-right font-bold text-black border-b">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 12 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-muted/10 border-b border-gray-100 print:border-gray-300">
                  <TableCell className="font-mono font-bold text-xs py-4 px-4">#TX-99{100+i}</TableCell>
                  <TableCell className="text-sm">عملية مسجلة للنظام - تصنيف {type}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{dateRange.to}</TableCell>
                  <TableCell className="font-bold">{(1450 * (i+1.5)).toFixed(2)} ر.س</TableCell>
                  <TableCell><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-bold">مكتمل</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      <div className="mt-12 text-center text-[10px] text-muted-foreground hidden print:block pt-4 border-t">
        تم استخراج هذا التقرير تلقائياً من نظام فارمافولت في {new Date().toLocaleString('ar-SA')} | سرية البيانات محفوظة.
      </div>
    </div>
  );
}