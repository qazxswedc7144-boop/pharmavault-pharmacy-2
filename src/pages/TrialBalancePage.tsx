import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Scale, Printer, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import type { Account } from '@shared/types';
import { cn } from '@/lib/utils';
interface TrialBalanceAccount extends Account {
  totalDebit: number;
  totalCredit: number;
}
export function TrialBalancePage() {
  const { data: balanceData, isLoading } = useQuery<{ items: TrialBalanceAccount[] }>({
    queryKey: ['trial-balance'],
    queryFn: () => api<{ items: TrialBalanceAccount[] }>('/api/trial-balance')
  });
  const accounts = balanceData?.items ?? [];
  const totals = useMemo(() => {
    return accounts.reduce((acc, curr) => ({
      debit: acc.debit + curr.totalDebit,
      credit: acc.credit + curr.totalCredit
    }), { debit: 0, credit: 0 });
  }, [accounts]);
  const isBalanced = Math.abs(totals.debit - totals.credit) < 0.01;
  return (
    <AppLayout container>
      <div className="space-y-8 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b pb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-pharmav-primary">ميزان المراجعة</h1>
            <p className="text-muted-foreground mt-2 text-lg">التحقق من توازن الحسابات المدينة والدائنة للفترة الحالية.</p>
          </div>
          <div className="flex gap-3 no-print">
            <Button variant="outline" className="h-12 px-6 border-2 font-bold" onClick={() => window.print()}>
              <Printer className="size-5 ml-2" /> طباعة الميزان
            </Button>
          </div>
        </div>
        <div className={cn(
          "p-6 rounded-[2rem] border flex items-center justify-between flex-row-reverse animate-in fade-in slide-in-from-top-4 duration-500",
          isBalanced ? "bg-green-500/5 border-green-500/20" : "bg-rose-500/5 border-rose-500/20"
        )}>
          <div className="flex items-center gap-4 flex-row-reverse">
            <div className={cn(
              "size-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
              isBalanced ? "bg-green-500" : "bg-rose-500"
            )}>
              {isBalanced ? <CheckCircle2 className="size-6" /> : <AlertCircle className="size-6" />}
            </div>
            <div className="text-right">
              <h3 className={cn("font-display font-bold", isBalanced ? "text-green-700" : "text-rose-700")}>
                {isBalanced ? "النظام متوازن محاسبياً" : "يوجد عدم توازن في الميزان"}
              </h3>
              <p className={cn("text-sm", isBalanced ? "text-green-600/80" : "text-rose-600/80")}>
                {isBalanced ? "إجمالي المدين يساوي إجمالي الدائن تماماً." : `يوجد فرق قدره ${Math.abs(totals.debit - totals.credit).toLocaleString()} ر.س`}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">تاريخ المراجعة</span>
            <span className="font-mono font-bold">{new Date().toLocaleDateString('ar-SA')}</span>
          </div>
        </div>
        <div className="rounded-3xl border bg-card overflow-hidden shadow-soft">
          <Table className="text-right">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right py-5 w-[150px]">كود الحساب</TableHead>
                <TableHead className="text-right">اسم الحساب المالي</TableHead>
                <TableHead className="text-right">نوع الحساب</TableHead>
                <TableHead className="text-center w-[150px]">مجموع المدين</TableHead>
                <TableHead className="text-center w-[150px]">مجموع الدائن</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5} className="py-8"><div className="h-10 bg-muted animate-pulse rounded-xl" /></TableCell></TableRow>
                ))
              ) : accounts.map((acc) => (
                <TableRow key={acc.id} className="hover:bg-muted/5 border-b border-border/40">
                  <TableCell className="font-mono text-sm font-bold text-muted-foreground">{acc.code}</TableCell>
                  <TableCell className="font-bold text-lg">{acc.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{acc.type}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-display font-bold text-green-600">
                    {acc.totalDebit > 0 ? acc.totalDebit.toLocaleString() : '-'}
                  </TableCell>
                  <TableCell className="text-center font-display font-bold text-blue-600">
                    {acc.totalCredit > 0 ? acc.totalCredit.toLocaleString() : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-muted/30">
              <TableRow className="border-t-2 border-primary/20">
                <TableCell colSpan={3} className="text-xl font-display font-bold text-right py-6">الإجمالي الكلي</TableCell>
                <TableCell className="text-center text-xl font-display font-bold text-green-600">{totals.debit.toLocaleString()} ر.س</TableCell>
                <TableCell className="text-center text-xl font-display font-bold text-blue-600">{totals.credit.toLocaleString()} ر.س</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}