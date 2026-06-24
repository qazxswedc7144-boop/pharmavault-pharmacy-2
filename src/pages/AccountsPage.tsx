import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Plus, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import type { Account } from '@shared/types';
import { cn } from '@/lib/utils';
export function AccountsPage() {
  const { data: accountsData, isLoading } = useQuery<{ items: Account[] }>({
    queryKey: ['accounts'],
    queryFn: () => api<{ items: Account[] }>('/api/accounts')
  });
  const accounts = accountsData?.items ?? [];
  const totalAssets = accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0);
  const getAccountBadgeColor = (type: string) => {
    switch(type) {
      case 'asset': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'liability': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'revenue': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'expense': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Chart of Accounts</h1>
            <p className="text-muted-foreground">Professional general ledger for pharmacy bookkeeping.</p>
          </div>
          <Button className="gap-2 bg-pharmav-primary">
            <Plus className="h-4 w-4" /> New Account
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card bg-blue-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="size-4 text-blue-500" /> Total Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAssets.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="glass-card bg-orange-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="size-4 text-orange-500" /> Total Liabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalLiabilities.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="glass-card bg-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Scale className="size-4 text-green-500" /> Net Equity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalAssets - totalLiabilities).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
        <Card className="glass-card border-none shadow-soft overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Account Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4}><div className="h-10 bg-muted animate-pulse rounded" /></TableCell></TableRow>
                ))
              ) : accounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-sm">{account.code}</TableCell>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize", getAccountBadgeColor(account.type))}>
                      {account.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-bold",
                    account.type === 'expense' || account.type === 'liability' ? "text-red-500" : "text-green-600"
                  )}>
                    ${account.balance.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  );
}