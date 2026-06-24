import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Receipt, Plus, Search, Calendar, Tag } from 'lucide-react';
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
  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'General Expense';
  const totalMonthly = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Expenses</h1>
            <p className="text-muted-foreground">Track pharmacy overheads and operating costs.</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2 bg-pharmav-primary">
            <Plus className="h-4 w-4" /> Log Expense
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Monthly Spending</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">${totalMonthly.toLocaleString()}</div></CardContent>
          </Card>
        </div>
        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search expenses..." className="pl-9 bg-background border-none ring-1 ring-border" />
          </div>
        </div>
        <Card className="glass-card border-none overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6}><div className="h-10 bg-muted animate-pulse rounded" /></TableCell></TableRow>
                ))
              ) : expenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(exp.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="font-medium">{exp.description}</TableCell>
                  <TableCell><div className="flex items-center gap-2 text-xs"><Tag className="size-3 text-muted-foreground" /> {exp.category}</div></TableCell>
                  <TableCell className="text-sm">{getAccountName(exp.accountId)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={exp.status === 'paid' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}>
                      {exp.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-red-500">-${exp.amount.toFixed(2)}</TableCell>
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