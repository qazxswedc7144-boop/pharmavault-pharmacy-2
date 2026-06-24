import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Plus, Search, Mail, Phone, MapPin, MoreVertical, Building2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api-client';
import type { Supplier } from '@shared/types';
import { SupplierForm } from '@/components/inventory/SupplierForm';
import { toast } from 'sonner';
export function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();
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
  const handleEdit = (s: Supplier) => {
    setSelectedSupplier(s);
    setIsFormOpen(true);
  };
  const handleAdd = () => {
    setSelectedSupplier(undefined);
    setIsFormOpen(true);
  };
  return (
    <AppLayout container>
      <div className="space-y-8 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-pharmav-primary">الموردون والشركات</h1>
            <p className="text-muted-foreground mt-2 text-lg">إدارة سلاسل التوريد، جهات الاتصال، وعناوين الموزعين.</p>
          </div>
          <Button onClick={handleAdd} className="gap-2 h-11 px-6 bg-pharmav-primary font-bold shadow-neon-blue flex-row-reverse">
            <Plus className="h-4 w-4" /> إضافة مورد جديد
          </Button>
        </div>
        <div className="flex items-center gap-4 bg-muted/30 p-6 rounded-2xl border border-border/60 flex-row-reverse">
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="البحث باسم الشركة أو مسؤول التواصل..."
              className="pr-11 h-12 bg-background border-none ring-1 ring-border text-lg text-right"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="rounded-3xl border bg-card overflow-hidden shadow-soft">
          <Table className="text-right">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-right font-bold py-5">اسم الشركة / المورد</TableHead>
                <TableHead className="text-right font-bold">مسؤول التواصل</TableHead>
                <TableHead className="text-right font-bold">معلومات الاتصال</TableHead>
                <TableHead className="text-right font-bold">العنوان المعتمد</TableHead>
                <TableHead className="text-left"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5} className="py-8"><div className="h-10 bg-muted animate-pulse rounded-xl" /></TableCell></TableRow>
                ))
              ) : filtered.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/30 transition-colors border-b">
                  <TableCell className="font-bold py-6">
                    <div className="flex items-center gap-3 justify-end">
                      <span className="text-lg text-pharmav-primary">{s.name}</span>
                      <Building2 className="size-5 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{s.contactPerson}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm items-end">
                      <div className="flex items-center gap-2 flex-row-reverse"><Mail className="size-3 text-muted-foreground" /> {s.email}</div>
                      <div className="flex items-center gap-2 flex-row-reverse"><Phone className="size-3 text-muted-foreground" /> {s.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate text-muted-foreground text-sm">
                    <div className="flex items-center gap-2 justify-end">
                      <span>{s.address}</span>
                      <MapPin className="size-3 shrink-0" />
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(s)} className="h-10 w-10">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && filtered.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <Truck className="size-12 mx-auto opacity-20 mb-4" />
              <p className="text-lg font-medium">لم يتم العثور على موردين مطابقين للبحث.</p>
            </div>
          )}
        </div>
      </div>
      <SupplierForm open={isFormOpen} onOpenChange={setIsFormOpen} supplier={selectedSupplier} />
    </AppLayout>
  );
}