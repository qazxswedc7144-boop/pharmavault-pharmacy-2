import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Plus, Search, Mail, Phone, MapPin, MoreVertical } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api-client';
import type { Supplier } from '@shared/types';
import { toast } from 'sonner';
export function SuppliersPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { data: suppliersData, isLoading } = useQuery<{ items: Supplier[] }>({
    queryKey: ['suppliers'],
    queryFn: () => api<{ items: Supplier[] }>('/api/suppliers')
  });
  const suppliers = suppliersData?.items ?? [];
  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Suppliers</h1>
            <p className="text-muted-foreground">Manage your supply chain and partner contacts.</p>
          </div>
          <Button className="gap-2 bg-pharmav-primary">
            <Plus className="h-4 w-4" /> Add Supplier
          </Button>
        </div>
        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/40">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              className="pl-9 bg-background border-none ring-1 ring-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="rounded-2xl border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5}><div className="h-12 bg-muted animate-pulse rounded" /></TableCell></TableRow>
                ))
              ) : filtered.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/30 transition-colors group">
                  <TableCell className="font-bold text-pharmav-primary">{s.name}</TableCell>
                  <TableCell>{s.contactPerson}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-2"><Mail className="size-3" /> {s.email}</div>
                      <div className="flex items-center gap-2"><Phone className="size-3" /> {s.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                    <div className="flex items-center gap-2"><MapPin className="size-3 shrink-0" /> {s.address}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}