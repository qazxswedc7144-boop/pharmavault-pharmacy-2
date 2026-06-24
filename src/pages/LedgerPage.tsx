import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, Search, Filter, ArrowLeftRight, Clock, FileText } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import type { JournalEntry, Account } from '@shared/types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
export function LedgerPage() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const { data: accountsData } = useQuery<{ items: Account[] }>({
    queryKey: ['accounts'],
    queryFn: () => api<{ items: Account[] }>('/api/accounts')
  });
  const { data: ledgerData, isLoading } = useQuery<{ items: JournalEntry[] }>({
    queryKey: ['ledger', selectedAccountId],
    queryFn: () => api<{ items: JournalEntry[] }>(`/api/ledger${selectedAccountId !== 'all' ? `?accountId=${selectedAccountId}` : ''}`)
  });
  const ledgerEntries = useMemo(() => ledgerData?.items ?? [], [ledgerData?.items]);
  const accounts = accountsData?.items ?? [];
  const filteredEntries = useMemo(() => {
    return ledgerEntries.filter(e => 
      e.description.toLowerCase().includes(search.toLowerCase()) || 
      e.referenceId.toLowerCase().includes(search.toLowerCase())
    );
  }, [ledgerEntries, search]);
  return (
    <AppLayout container>
      <div className="space-y-8 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b pb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-pharmav-primary">دفتر الأستاذ العام</h1>
            <p className="text-muted-foreground mt-2 text-lg">سجل تفصيلي لكافة القيود المحاسبية والحركات المالية.</p>
          </div>
          <div className="flex gap-3 no-print">
            <Button variant="outline" className="h-12 px-6 border-2 font-bold" onClick={() => window.print()}>
              <FileText className="size-5 ml-2" /> طباعة السجل
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-6 rounded-3xl border shadow-sm no-print">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="البحث في الوصف أو المرجع..."
              className="h-12 pr-12 bg-muted/30 border-none text-lg text-right"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="h-12 w-full md:w-64 bg-muted/30 border-none text-right">
              <Filter className="ml-2 size-4 opacity-50" />
              <SelectValue placeholder="تصفية بالحساب" />
            </SelectTrigger>
            <SelectContent className="text-right">
              <SelectItem value="all">كافة الحسابات</SelectItem>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-3xl border bg-card overflow-hidden shadow-soft">
          <Table className="text-right">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right py-5 w-[150px]">التاريخ</TableHead>
                <TableHead className="text-right">البيان / الوصف</TableHead>
                <TableHead className="text-right">المرجع</TableHead>
                <TableHead className="text-right">الحساب المتأثر</TableHead>
                <TableHead className="text-center w-[120px]">مدين</TableHead>
                <TableHead className="text-center w-[120px]">دائن</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6} className="py-8"><div className="h-10 bg-muted animate-pulse rounded-xl" /></TableCell></TableRow>
                ))
              ) : filteredEntries.flatMap((entry) => 
                entry.items.map((item, idx) => (
                  <TableRow key={`${entry.id}-${idx}`} className="hover:bg-muted/10 transition-colors border-b">
                    <TableCell className="text-muted-foreground text-sm">
                      {idx === 0 ? format(new Date(entry.date), 'dd MMM yyyy', { locale: ar }) : ''}
                    </TableCell>
                    <TableCell className="font-medium">
                      {idx === 0 ? entry.description : ''}
                    </TableCell>
                    <TableCell className="font-mono text-xs opacity-60">
                      {idx === 0 ? entry.referenceId : ''}
                    </TableCell>
                    <TableCell className="font-bold">
                      {accounts.find(a => a.id === item.accountId)?.name || item.accountId}
                    </TableCell>
                    <TableCell className="text-center font-bold text-green-600">
                      {item.debit > 0 ? item.debit.toLocaleString() : '-'}
                    </TableCell>
                    <TableCell className="text-center font-bold text-blue-600">
                      {item.credit > 0 ? item.credit.toLocaleString() : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!isLoading && filteredEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-24 text-center text-muted-foreground italic">
                    <FileSpreadsheet className="size-16 mx-auto opacity-10 mb-4" />
                    لا توجد قيود محاسبية تطابق البحث.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}