import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  FileText,
  Pencil,
  Trash2,
  Package2,
  FileDown,
  ShieldAlert
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/offline-store';
import type { Product } from '@shared/types';
import { ProductForm } from '@/components/inventory/ProductForm';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
export function InventoryPage() {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const queryClient = useQueryClient();
  const currentUser = useAppStore(s => s.currentUser);
  const role = currentUser?.role || 'viewer';
  const canWrite = role === 'admin' || role === 'pharmacist';
  const canDelete = role === 'admin';
  const { data: productsData, isLoading } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api<{ items: Product[] }>('/api/products')
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('تم حذف المنتج بنجاح');
    },
    onError: (err: any) => toast.error(err.message || 'فشل في الحذف')
  });
  const products = productsData?.items ?? [];
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );
  const handleExportExcel = () => {
    if (filteredProducts.length === 0) return toast.error('لا توجد بيانات لتصديرها');
    const data = filteredProducts.map(p => ({
      'الاسم': p.name,
      'كود المنتج (SKU)': p.sku,
      'الكمية المتوفرة': p.stockQuantity,
      'الوحدة': p.unit,
      'سعر التكلفة': p.costPrice,
      'سعر البيع': p.price,
      'تاريخ الانتهاء': p.expiryDate,
      'رقم التشغيلة': p.batchNumber
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, `PharmaVault_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('تم تصدير ملف Excel بنجاح');
  };
  const handleEdit = (product: Product) => {
    if (!canWrite) return;
    setSelectedProduct(product);
    setIsFormOpen(true);
  };
  return (
    <AppLayout container>
      <div className="space-y-8" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-right">
            <h1 className="text-4xl font-display font-bold text-pharmav-primary">مخزن الأدوية</h1>
            <p className="text-muted-foreground mt-2 text-lg">إدارة بيانات الأدوية، مستويات المخزون، والتشغيلات.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportExcel} className="gap-2 h-11 px-5 border-2">
              <FileDown className="h-4 w-4" /> تصدير البيانات
            </Button>
            {canWrite && (
              <Button onClick={() => { setSelectedProduct(undefined); setIsFormOpen(true); }} className="gap-2 h-11 px-6 bg-pharmav-primary font-bold shadow-neon-blue">
                <Plus className="h-4 w-4" /> إضافة دواء جديد
              </Button>
            )}
          </div>
        </div>
        {role === 'viewer' && (
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-3 flex-row-reverse text-blue-700 font-bold text-sm">
            <ShieldAlert className="size-5" />
            أنت في وضع العرض فقط. لا يمكنك تعديل أو إضافة بيانات.
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-muted/30 p-6 rounded-2xl border border-border/60">
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="البحث بالاسم أو كود المنتج (SKU)..."
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
                <TableHead className="w-[350px] text-right font-bold py-5">الدواء / التشغيلة</TableHead>
                <TableHead className="text-right font-bold">كود المنتج</TableHead>
                <TableHead className="text-right font-bold">الكمية</TableHead>
                <TableHead className="text-right font-bold">السعر</TableHead>
                <TableHead className="text-right font-bold">انتهاء الصلاحية</TableHead>
                <TableHead className="text-right font-bold">الحالة</TableHead>
                <TableHead className="text-left"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRow key={i}><TableCell colSpan={7}><div className="h-10 bg-muted animate-pulse rounded" /></TableCell></TableRow>)
              ) : filteredProducts.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/30 transition-colors group border-b">
                  <TableCell className="font-medium py-4">
                    <div className="flex flex-row-reverse items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-pharmav-primary/10 group-hover:text-pharmav-primary transition-colors">
                        <Package2 className="size-5" />
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-base font-bold">{p.name}</span>
                        <span className="text-xs text-muted-foreground font-normal">رقم الدفعة: {p.batchNumber}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono">{p.sku}</TableCell>
                  <TableCell className="font-bold text-lg">{p.stockQuantity} {p.unit}</TableCell>
                  <TableCell className="font-bold text-lg">{p.price.toFixed(2)} ر.س</TableCell>
                  <TableCell className="text-muted-foreground">{p.expiryDate}</TableCell>
                  <TableCell>
                    {p.stockQuantity <= p.minStockLevel ? (
                      <Badge variant="destructive" className="font-bold">نقص مخزون</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-none font-bold">متوفر</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-left">
                    {canWrite && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="text-right">
                          <DropdownMenuItem onClick={() => handleEdit(p)} className="flex-row-reverse gap-2">
                            <Pencil className="size-4" /> تعديل البيانات
                          </DropdownMenuItem>
                          {canDelete && (
                            <DropdownMenuItem className="text-destructive flex-row-reverse gap-2" onClick={() => deleteMutation.mutate(p.id)}>
                              <Trash2 className="size-4" /> حذف المنتج
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="pt-12 text-center text-muted-foreground text-sm border-t">
          <p>نظام فارمافولت v2.5 • م/ عبدالله طاهر مفرح (772093714) • RBAC-ENABLED</p>
        </div>
      </div>
      <ProductForm open={isFormOpen} onOpenChange={setIsFormOpen} product={selectedProduct} />
    </AppLayout>
  );
}