import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
export const PnlView = ({ data }: { data: any }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-right">
          <div className="text-sm font-bold text-blue-600 mb-1">إجمالي الإيرادات</div>
          <div className="text-2xl font-bold text-blue-900">{data.revenue?.toLocaleString()} ر.س</div>
        </CardContent>
      </Card>
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-6 text-right">
          <div className="text-sm font-bold text-orange-600 mb-1">تكلفة البضاعة المباعة</div>
          <div className="text-2xl font-bold text-orange-900">{data.cogs?.toLocaleString()} ر.س</div>
        </CardContent>
      </Card>
      <Card className={data.netProfit >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
        <CardContent className="p-6 text-right">
          <div className="text-sm font-bold mb-1">صافي الربح</div>
          <div className="text-2xl font-bold">{data.netProfit?.toLocaleString()} ر.س</div>
        </CardContent>
      </Card>
    </div>
    <div className="rounded-2xl border overflow-hidden">
      <Table className="text-right">
        <TableBody>
          <TableRow className="bg-muted/30 font-bold">
            <TableCell>إجمالي المبيعات</TableCell>
            <TableCell className="text-left">{data.revenue?.toLocaleString()} ر.س</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>تكلفة المبيعات (COGS)</TableCell>
            <TableCell className="text-left text-red-600">-{data.cogs?.toLocaleString()} ر.س</TableCell>
          </TableRow>
          <TableRow className="font-bold border-t-2">
            <TableCell>إجمالي الربح</TableCell>
            <TableCell className="text-left">{(data.revenue - data.cogs)?.toLocaleString()} ر.س</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>المصاريف التشغيلية</TableCell>
            <TableCell className="text-left text-red-600">-{data.expenseTotal?.toLocaleString()} ر.س</TableCell>
          </TableRow>
          <TableRow className="bg-pharmav-primary text-white font-bold text-lg">
            <TableCell>صافي الربح النهائي</TableCell>
            <TableCell className="text-left">{data.netProfit?.toLocaleString()} ر.س</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
);
export const ListView = ({ items, columns }: { items: any[], columns: { key: string, label: string, format?: (v: any) => React.ReactNode }[] }) => (
  <div className="rounded-2xl border overflow-hidden">
    <Table className="text-right">
      <TableHeader className="bg-muted/50">
        <TableRow>
          {columns.map(col => <TableHead key={col.key} className="text-right font-bold py-4">{col.label}</TableHead>)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items?.length > 0 ? items.map((item, idx) => (
          <TableRow key={idx}>
            {columns.map(col => (
              <TableCell key={col.key}>
                {col.format ? col.format(item[col.key]) : item[col.key]}
              </TableCell>
            ))}
          </TableRow>
        )) : (
          <TableRow><TableCell colSpan={columns.length} className="py-20 text-center text-muted-foreground italic">لا توجد بيانات لهذا التقرير حالياً</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);