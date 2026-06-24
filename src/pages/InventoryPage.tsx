import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  FileText,
  Pencil,
  Trash2,
  Package2
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
import type { Product } from '@shared/types';
import { ProductForm } from '@/components/inventory/ProductForm';
import { toast } from 'sonner';
export function InventoryPage() {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const queryClient = useQueryClient();
  const { data: productsData, isLoading } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api<{ items: Product[] }>('/api/products')
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('تم حذف المنتج بنجاح من المخزون');
    },
    onError: () => toast.error('فشل في حذف المنتج، يرجى المحاولة لاحقاً')
  });
  const products = productsData?.items ?? [];
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };
  const handleAdd = () => {
    setSelectedProduct(undefined);
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
            <Button variant="outline" className="gap-2 h-11 px-5 border-2">
              <FileText className="h-4 w-4" /> تصدير البيانات
            </Button>
            <Button onClick={handleAdd} className="gap-2 h-11 px-6 bg-pharmav-primary font-bold shadow-neon-blue">
              <Plus className="h-4 w-4" /> إضافة دواء جديد
            </Button>
          </div>
        </div>
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
          <Button variant="ghost" className="gap-2 h-12 font-medium">
            <Filter className="h-4 w-4" /> تصفية متقدمة
          </Button>
          <div className="mr-auto text-sm font-medium text-muted-foreground">
            عرض {filteredProducts.length} دواء متاح
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
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-6 w-56 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-24 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-16 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-28 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-24 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  </TableRow>
                ))
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
                  <TableCell>
                    <div className="flex items-center gap-2 justify-end">
                      <span className={p.stockQuantity <= p.minStockLevel ? "text-destructive font-bold text-lg" : "text-lg font-semibold"}>
                        {p.stockQuantity}
                      </span>
                      <span className="text-xs text-muted-foreground">{p.unit}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-lg">{p.price.toFixed(2)} ر.س</TableCell>
                  <TableCell className="text-muted-foreground">{p.expiryDate}</TableCell>
                  <TableCell>
                    {p.stockQuantity <= p.minStockLevel ? (
                      <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 font-bold">نقص مخزون</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 font-bold">متوفر</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="text-right">
                        <DropdownMenuItem onClick={() => handleEdit(p)} className="flex-row-reverse gap-2">
                          <Pencil className="h-4 w-4" /> تعديل البيانات
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive flex-row-reverse gap-2"
                          onClick={() => {
                            if(window.confirm('هل أنت متأكد من رغبتك في حذف هذا الدواء نهائياً؟')) deleteMutation.mutate(p.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" /> حذف المنتج
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && filteredProducts.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <Package2 className="size-12 mx-auto opacity-20 mb-4" />
              <p className="text-lg font-medium">لا توجد أدوية تطابق بحثك حالياً.</p>
            </div>
          )}
        </div>
      </div>
      <ProductForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={selectedProduct}
      />
    </AppLayout>
  );
}