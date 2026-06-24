import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, TrendingUp, TrendingDown, Scale, Wallet, Banknote } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import type { Account, AccountType } from '@shared/types';
import { cn } from '@/lib/utils';
import { AccountForm } from '@/components/finance/AccountForm';
export function AccountsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();
  const { data: accountsData } = useQuery<{ items: Account[] }>({
    queryKey: ['accounts'],
    queryFn: () => api<{ items: Account[] }>('/api/accounts')
  });
  const accounts = useMemo(() => accountsData?.items ?? [], [accountsData?.items]);
  const groupedAccounts = useMemo(() => {
    const groups: Record<AccountType, Account[]> = {
      asset: [], liability: [], equity: [], revenue: [], expense: []
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
  const handleEdit = (acc: Account) => {
    setSelectedAccount(acc);
    setIsFormOpen(true);
  };
  return (
    <AppLayout container>
      <div className="space-y-8 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-pharmav-primary">شجرة الحسابات</h1>
            <p className="text-muted-foreground mt-2 text-lg">الهيكل المحاسبي التفصيلي لجميع الأصول والخصوم والعمليات.</p>
          </div>
          <Button onClick={() => { setSelectedAccount(undefined); setIsFormOpen(true); }} className="gap-2 h-12 px-8 bg-pharmav-primary font-bold shadow-neon-blue rounded-xl flex-row-reverse">
            <Plus className="size-5" /> إنشاء حساب مالي
          </Button>
        </div>
        <div className="space-y-6">
          {(Object.entries(typeLabels) as [AccountType, any][]).map(([type, config]) => (
            <div key={type} className="bg-card rounded-3xl border shadow-soft overflow-hidden">
              <div className={cn("px-6 py-4 border-b flex items-center justify-between flex-row-reverse", config.color.replace('text-', 'bg-') + '/10')}>
                <div className="flex items-center gap-3 flex-row-reverse">
                  <config.icon className={cn("size-5", config.color)} />
                  <h3 className="font-display font-bold text-lg">{config.label}</h3>
                </div>
              </div>
              <Table className="text-right">
                <TableBody>
                  {groupedAccounts[type].map((account) => (
                    <TableRow key={account.id} className="hover:bg-muted/20 border-b last:border-none cursor-pointer" onClick={() => handleEdit(account)}>
                      <TableCell className="w-[150px] font-mono text-xs pr-8">{account.code}</TableCell>
                      <TableCell className="font-bold py-5">{account.name}</TableCell>
                      <TableCell className="text-left font-display font-bold text-lg px-8">{account.balance.toLocaleString()} ر.س</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
        <div className="pt-12 text-center text-muted-foreground text-[10px] border-t">
          <p>تطوير د/ عبدالله طاهر مفرح (772093714) • حقوق الطبع 2026</p>
        </div>
      </div>
      <AccountForm open={isFormOpen} onOpenChange={setIsFormOpen} account={selectedAccount} />
    </AppLayout>
  );
}