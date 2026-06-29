import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Plus, TrendingUp, TrendingDown, Scale, FolderTree, Building, Wallet, Banknote } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import type { Account, AccountType } from '@shared/types';
import { cn } from '@/lib/utils';
export function AccountsPage() {
  const { data: accountsData, isLoading } = useQuery<{ items: Account[] }>({
    queryKey: ['accounts'],
    queryFn: () => api<{ items: Account[] }>('/api/accounts')
  });
  const accounts = accountsData?.items ?? [];
  const groupedAccounts = useMemo(() => {
    const groups: Record<AccountType, Account[]> = {
      asset: [],
      liability: [],
      equity: [],
      revenue: [],
      expense: []
    };
    accounts.forEach(a => groups[a.type].push(a));
    return groups;
  }, [accounts]);
  const typeLabels: Record<AccountType, { label: string; icon: any; color: string }> = {
    asset: { label: 'الأصول', icon: Wallet, color: 'text-blue-500' },
    liability: { label: 'الخصوم', icon: Banknote, color: 'text-orange-500' },
    equity: { label: 'حقوق الملكية', icon: Scale, color: 'text-green-500' },
    revenue: { label: 'الإيرادات', icon: TrendingUp, color: 'text-emerald-500' },
    expense: { label: 'المصاريف', icon: TrendingDown, color: 'text-rose-500' }
  };
  const totals = useMemo(() => {
    return {
      assets: groupedAccounts.asset.reduce((s, a) => s + a.balance, 0),
      liabilities: groupedAccounts.liability.reduce((s, a) => s + a.balance, 0),
      equity: groupedAccounts.equity.reduce((s, a) => s + a.balance, 0)
    };
  }, [groupedAccounts]);
  return (
    <AppLayout container>
      <div className="space-y-8 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-pharmav-primary">شجرة الحسابات</h1>
            <p className="text-muted-foreground mt-2 text-lg">الهيكل المحاسبي التفصيلي لجميع الأصول والخصوم والعمليات.</p>
          </div>
          <Button className="gap-2 h-12 px-8 bg-pharmav-primary font-bold shadow-neon-blue rounded-xl flex-row-reverse">
            <Plus className="size-5" /> إنشاء حساب مالي
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card bg-blue-500/5 border-blue-500/10">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center justify-end gap-2">
                <span>إجمالي الأصول</span>
                <Wallet className="size-4 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold font-display">{totals.assets.toLocaleString()} ر.س</div></CardContent>
          </Card>
          <Card className="glass-card bg-orange-500/5 border-orange-500/10">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center justify-end gap-2">
                <span>إجمالي الخصوم</span>
                <Banknote className="size-4 text-orange-500" />
              </CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold font-display">{totals.liabilities.toLocaleString()} ر.س</div></CardContent>
          </Card>
          <Card className="glass-card bg-green-500/5 border-green-500/10">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center justify-end gap-2">
                <span>صافي حقوق الملكية</span>
                <Scale className="size-4 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold font-display">{(totals.assets - totals.liabilities).toLocaleString()} ر.س</div></CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          {(Object.entries(typeLabels) as [AccountType, any][]).map(([type, config]) => (
            <div key={type} className="bg-card rounded-3xl border shadow-soft overflow-hidden">
              <div className={cn("px-6 py-4 border-b flex items-center justify-between flex-row-reverse", config.color.replace('text-', 'bg-') + '/10')}>
                <div className="flex items-center gap-3 flex-row-reverse">
                  <config.icon className={cn("size-5", config.color)} />
                  <h3 className="font-display font-bold text-lg">{config.label}</h3>
                </div>
                <div className="text-sm font-bold text-muted-foreground">
                  الإجمالي: {groupedAccounts[type].reduce((s, a) => s + a.balance, 0).toLocaleString()} ر.س
                </div>
              </div>
              <Table className="text-right">
                <TableBody>
                  {groupedAccounts[type].length > 0 ? (
                    groupedAccounts[type].map((account) => (
                      <TableRow key={account.id} className="hover:bg-muted/20 border-b border-border/40 last:border-none group">
                        <TableCell className="w-[150px] font-mono text-xs text-muted-foreground pr-8">
                          {account.code}
                        </TableCell>
                        <TableCell className="font-bold text-base py-5">
                          <div className="flex items-center gap-3 justify-end">
                            {account.name}
                            <div className="size-1.5 rounded-full bg-muted-foreground/30 group-hover:bg-pharmav-primary transition-colors" />
                          </div>
                        </TableCell>
                        <TableCell className="text-left font-display font-bold text-lg px-8">
                          {account.balance.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">ر.س</span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="py-10 text-center text-muted-foreground italic">لا توجد حسابات مسجلة ضمن هذه الفئة.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}