import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Receipt, Plus, Search, Calendar, Tag, MoreVertical } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import type { Expense, Account } from '@shared/types';
import { format } from 'date-fns';
import { ExpenseForm } from '@/components/finance/ExpenseForm';
export function ExpensesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: expensesData, isLoading } = useQuery<{ items: Expense[] }>({
    queryKey: ['expenses'],
    queryFn: () => api<{ items: Expense[] }>('/api/expenses')
  });
  const { data: accountsData } = useQuery<{ items: Account[] }>({
    queryKey: ['accounts'],
    queryFn: () => api<{ items: Account[] }>('/api/accounts')
  });
  const expenses = expensesData?.items ?? [];
  const accounts = accountsData?.items ?? [];
  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'مصروف عام';
  const totalMonthly = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  return (
    <AppLayout container>
      <div className="space-y-8 text-right" dir="rtl">
        <div className="flex items-center justify-between flex-row-reverse">
          <div>
            <h1 className="text-3xl font-display font-bold">المصاريف</h1>
            <p className="text-muted-foreground">تتبع التكاليف التشغيلية والمصاريف النثرية للصيدلية.</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2 bg-pharmav-primary font-bold flex-row-reverse">
            <Plus className="h-4 w-4" /> تسجيل مصروف جديد
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">الإنفاق الشهري</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{totalMonthly.toLocaleString()} ر.س</div></CardContent>
          </Card>
        </div>
        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border flex-row-reverse">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="البحث في المصاريف..." className="pr-9 bg-background border-none ring-1 ring-border text-right" />
          </div>
        </div>
        <Card className="glass-card border-none overflow-hidden">
          <Table className="text-right">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الوصف</TableHead>
                <TableHead className="text-right">التصنيف</TableHead>
                <TableHead className="text-right">الحساب</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-left">المبلغ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6}><div className="h-10 bg-muted animate-pulse rounded" /></TableCell></TableRow>
                ))
              ) : expenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(exp.date), 'yyyy/MM/dd')}</TableCell>
                  <TableCell className="font-medium font-display">{exp.description}</TableCell>
                  <TableCell><div className="flex items-center gap-2 text-xs justify-end"><span className="font-medium">{exp.category}</span><Tag className="size-3 text-muted-foreground" /></div></TableCell>
                  <TableCell className="text-sm">{getAccountName(exp.accountId)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={exp.status === 'paid' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20'}>
                      {exp.status === 'paid' ? 'تم الدفع' : 'معلق'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left font-bold text-red-500" dir="ltr">-{exp.amount.toFixed(2)} ر.س</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
      <ExpenseForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </AppLayout>
  );
}