import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Plus, TrendingUp, TrendingDown, Scale, Pencil } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import type { Account } from '@shared/types';
import { cn } from '@/lib/utils';
import { AccountForm } from '@/components/finance/AccountForm';
export function AccountsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();
  const { data: accountsData, isLoading } = useQuery<{ items: Account[] }>({
    queryKey: ['accounts'],
    queryFn: () => api<{ items: Account[] }>('/api/accounts')
  });
  const accounts = accountsData?.items ?? [];
  const totalAssets = accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0);
  const handleEdit = (a: Account) => {
    setSelectedAccount(a);
    setIsFormOpen(true);
  };
  const handleNew = () => {
    setSelectedAccount(undefined);
    setIsFormOpen(true);
  };
  const getAccountBadgeColor = (type: string) => {
    switch(type) {
      case 'asset': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'liability': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'revenue': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'expense': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };
  const typeLabels: Record<string, string> = {
    asset: 'أصول',
    liability: 'خصوم',
    equity: 'حقوق ملكية',
    revenue: 'إيرادات',
    expense: 'مصاريف'
  };
  return (
    <AppLayout container>
      <div className="space-y-8 text-right" dir="rtl">
        <div className="flex items-center justify-between flex-row-reverse">
          <div>
            <h1 className="text-3xl font-display font-bold">دليل الحسابات</h1>
            <p className="text-muted-foreground">إدارة السجل المالي والمحاسبي للصيدلية.</p>
          </div>
          <Button onClick={handleNew} className="gap-2 bg-pharmav-primary font-bold flex-row-reverse">
            <Plus className="h-4 w-4" /> إضافة حساب جديد
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card bg-blue-500/5">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-sm font-medium flex items-center justify-end gap-2">
                <span>إجمالي الأصول</span>
                <TrendingUp className="size-4 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{totalAssets.toLocaleString()} ر.س</div></CardContent>
          </Card>
          <Card className="glass-card bg-orange-500/5">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-sm font-medium flex items-center justify-end gap-2">
                <span>إجمالي الخصوم</span>
                <TrendingDown className="size-4 text-orange-500" />
              </CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{totalLiabilities.toLocaleString()} ر.س</div></CardContent>
          </Card>
          <Card className="glass-card bg-green-500/5">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-sm font-medium flex items-center justify-end gap-2">
                <span>صافي حقوق الملكية</span>
                <Scale className="size-4 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{(totalAssets - totalLiabilities).toLocaleString()} ر.س</div></CardContent>
          </Card>
        </div>
        <Card className="glass-card border-none overflow-hidden">
          <Table className="text-right">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right">كود الحساب</TableHead>
                <TableHead className="text-right">اسم الحساب</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-left">الرصيد</TableHead>
                <TableHead className="text-left"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5}><div className="h-10 bg-muted animate-pulse rounded" /></TableCell></TableRow>
                ))
              ) : accounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-sm">{account.code}</TableCell>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize border-transparent", getAccountBadgeColor(account.type))}>
                      {typeLabels[account.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn("text-left font-bold", account.type === 'expense' || account.type === 'liability' ? "text-red-500" : "text-green-600")}>
                    {account.balance.toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="text-left">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(account)}><Pencil className="size-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
      <AccountForm open={isFormOpen} onOpenChange={setIsFormOpen} account={selectedAccount} />
    </AppLayout>
  );
}