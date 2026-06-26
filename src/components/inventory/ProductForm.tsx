import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import type { Product, Category, Supplier } from '@shared/types';
import { MOCK_DRUG_DATABASE } from '@shared/mock-data';
import { toast } from 'sonner';
import { Info, DollarSign, Package, Zap, Barcode } from 'lucide-react';
import { cn } from '@/lib/utils';
const productSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  tradeName: z.string(),
  scientificName: z.string(),
  barcode: z.string(),
  sku: z.string().min(2, 'كود المنتج مطلوب'),
  categoryId: z.string().min(1, 'التصنيف مطلوب'),
  supplierId: z.string().min(1, 'المورد مطلوب'),
  price: z.coerce.number().min(0.01, 'السعر مطلوب'),
  costPrice: z.coerce.number().min(0, 'التكلفة مطلوبة'),
  taxRate: z.coerce.number().min(0).max(100),
  discountRate: z.coerce.number().min(0).max(100),
  stockQuantity: z.coerce.number().min(0),
  unit: z.string().min(1, 'الوحدة مطلوبة'),
  expiryDate: z.string().min(1, 'تاريخ الانتهاء مطلوب'),
  batchNumber: z.string().min(1, 'رقم الدفعة مطلوب'),
  minStockLevel: z.coerce.number().min(0),
});
type ProductFormValues = z.infer<typeof productSchema>;
interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}
export function ProductForm({ open, onOpenChange, product }: ProductFormProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', tradeName: '', scientificName: '', barcode: '',
      sku: '', categoryId: '', supplierId: '', price: 0, costPrice: 0,
      taxRate: 0, discountRate: 0, stockQuantity: 0, unit: 'قرص',
      expiryDate: '', batchNumber: '', minStockLevel: 10
    }
  });
  const { data: categoriesData } = useQuery<{ items: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => api<{ items: Category[] }>('/api/categories')
  });
  const { data: suppliersData } = useQuery<{ items: Supplier[] }>({
    queryKey: ['suppliers'],
    queryFn: () => api<{ items: Supplier[] }>('/api/suppliers')
  });
  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      product
        ? api<Product>(`/api/products/${product.id}`, { method: 'PUT', body: JSON.stringify(values) })
        : api<Product>('/api/products', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(product ? 'تم تحديث بيانات الدواء بنجاح' : 'تمت إضافة الدواء بنجاح للمخزن');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('حدث خطأ أثناء حفظ بيانات الدواء')
  });
  const price = form.watch('price');
  const cost = form.watch('costPrice');
  const expiry = form.watch('expiryDate');
  const margin = useMemo(() => {
    const p = Number(price) || 0;
    const c = Number(cost) || 0;
    if (p <= 0) return 0;
    return ((p - c) / p) * 100;
  }, [price, cost]);
  const expiryStatus = useMemo(() => {
    if (!expiry) return null;
    const date = new Date(expiry);
    const now = new Date();
    const diffMonths = (date.getFullYear() - now.getFullYear()) * 12 + date.getMonth() - now.getMonth();
    if (diffMonths < 3) return { label: 'قريب جداً', color: 'bg-destructive text-destructive-foreground' };
    if (diffMonths < 6) return { label: 'متوسط', color: 'bg-orange-500 text-white' };
    return { label: 'آمن', color: 'bg-green-500 text-white' };
  }, [expiry]);
  const handleScientificSearch = (val: string) => {
    const found = MOCK_DRUG_DATABASE.find(d => d.scientificName.toLowerCase() === val.toLowerCase());
    if (found) {
      form.setValue('categoryId', found.categoryId);
      form.setValue('unit', found.unit);
      if (!form.getValues('name')) form.setValue('name', found.tradeNames[0]);
    }
  };
  useEffect(() => {
    if (open) {
      if (product) {
        form.reset({
          name: product.name,
          tradeName: product.tradeName ?? '',
          scientificName: product.scientificName ?? '',
          barcode: product.barcode ?? '',
          sku: product.sku,
          categoryId: product.categoryId,
          supplierId: product.supplierId,
          price: product.price,
          costPrice: product.costPrice,
          taxRate: product.taxRate || 0,
          discountRate: product.discountRate || 0,
          stockQuantity: product.stockQuantity,
          unit: product.unit,
          expiryDate: product.expiryDate,
          batchNumber: product.batchNumber,
          minStockLevel: product.minStockLevel,
        });
      } else {
        form.reset({
          name: '', tradeName: '', scientificName: '', barcode: '',
          sku: '', categoryId: '', supplierId: '',
          price: 0, costPrice: 0, taxRate: 0, discountRate: 0,
          stockQuantity: 0, unit: 'قرص',
          expiryDate: '', batchNumber: '', minStockLevel: 10
        });
      }
    }
  }, [product, open, form]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-glass" dir="rtl">
        <DialogHeader className="p-6 bg-pharmav-primary text-white">
          <DialogTitle className="text-right font-display text-2xl font-bold flex items-center gap-3">
            <Zap className="size-6 animate-pulse" />
            {product ? 'تعديل بيانات الدواء المتقدمة' : 'إضافة دواء جديد للنظام'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 bg-muted/30 border-b">
                <TabsList className="bg-transparent h-14 w-full justify-start gap-8">
                  <TabsTrigger value="general" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-pharmav-primary h-full px-4 font-bold flex gap-2">
                    <Info className="size-4" /> البيانات الأساسية
                  </TabsTrigger>
                  <TabsTrigger value="financial" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-pharmav-primary h-full px-4 font-bold flex gap-2">
                    <DollarSign className="size-4" /> البيانات المالية
                  </TabsTrigger>
                  <TabsTrigger value="stock" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-pharmav-primary h-full px-4 font-bold flex gap-2">
                    <Package className="size-4" /> المخزون والتواريخ
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto bg-card">
                <TabsContent value="general" className="mt-0 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={form.control} name="scientificName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم العلمي</FormLabel>
                        <FormControl>
                          <Input {...field} onChange={(e) => { field.onChange(e); handleScientificSearch(e.target.value); }} className="h-12 text-right border-2 focus:ring-pharmav-primary/20" placeholder="ابحث عن المادة الفعالة..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم التجاري الأساسي</FormLabel>
                        <FormControl><Input {...field} className="h-12 text-right border-2" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={form.control} name="categoryId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>المجموعة العلاجية</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-12 text-right border-2"><SelectValue placeholder="اختر التصنيف" /></SelectTrigger></FormControl>
                          <SelectContent className="text-right">
                            {categoriesData?.items.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="supplierId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>المورد الافتراضي</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-12 text-right border-2"><SelectValue placeholder="اختر المورد" /></SelectTrigger></FormControl>
                          <SelectContent className="text-right">
                            {suppliersData?.items.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={form.control} name="sku" render={({ field }) => (
                      <FormItem>
                        <FormLabel>كود المنتج (SKU)</FormLabel>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="icon" className="shrink-0 h-12 w-12" onClick={() => form.setValue('sku', 'MED-' + Math.random().toString(36).substr(2, 6).toUpperCase())}><Zap className="size-4" /></Button>
                          <FormControl><Input {...field} className="h-12 text-right font-mono border-2" /></FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="barcode" render={({ field }) => (
                      <FormItem>
                        <FormLabel>الباركود</FormLabel>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="icon" className="shrink-0 h-12 w-12"><Barcode className="size-4" /></Button>
                          <FormControl><Input {...field} className="h-12 text-right font-mono border-2" /></FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </TabsContent>
                <TabsContent value="financial" className="mt-0 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={form.control} name="costPrice" render={({ field }) => (
                      <FormItem>
                        <FormLabel>سعر التكلفة (ر.س)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} value={field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} className="h-14 text-center font-bold text-xl border-2" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel>سعر البيع للجمهور (ر.س)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} value={field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} className="h-14 text-center font-bold text-xl border-2 text-pharmav-primary" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="p-6 rounded-2xl bg-muted/50 border-2 border-dashed space-y-4">
                    <div className="flex justify-between items-center flex-row-reverse">
                      <span className="font-bold text-sm">تحليل هامش الربح التقريبي</span>
                      <Badge variant={margin > 20 ? 'default' : 'secondary'} className={cn(margin > 20 ? 'bg-green-500' : '')}>
                        {margin.toFixed(1)}% صافي ربح
                      </Badge>
                    </div>
                    <Progress value={Math.min(100, Math.max(0, margin))} className="h-3" />
                  </div>
                </TabsContent>
                <TabsContent value="stock" className="mt-0 space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <FormField control={form.control} name="stockQuantity" render={({ field }) => (
                      <FormItem>
                        <FormLabel>الكمية الحالية</FormLabel>
                        <FormControl><Input type="number" {...field} value={field.value} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} className="h-12 text-center font-bold text-lg" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="unit" render={({ field }) => (
                      <FormItem>
                        <FormLabel>وحدة الصرف</FormLabel>
                        <FormControl><Input {...field} className="h-12 text-center" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="minStockLevel" render={({ field }) => (
                      <FormItem>
                        <FormLabel>حد إعادة الطلب</FormLabel>
                        <FormControl><Input type="number" {...field} value={field.value} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} className="h-12 text-center" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={form.control} name="expiryDate" render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between mb-2 flex-row-reverse">
                          <FormLabel className="font-bold">تاريخ الانتهاء</FormLabel>
                          {expiryStatus && <Badge className={expiryStatus.color}>{expiryStatus.label}</Badge>}
                        </div>
                        <FormControl><Input type="date" {...field} className="h-12 text-center border-2" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="batchNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الدفعة (Batch)</FormLabel>
                        <FormControl><Input {...field} className="h-12 text-center font-mono border-2" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </TabsContent>
              </div>
              <DialogFooter className="p-6 bg-muted/30 border-t flex flex-row-reverse gap-4">
                <Button type="submit" disabled={mutation.isPending} className="flex-1 h-14 bg-pharmav-primary font-bold text-lg shadow-neon-blue rounded-2xl">
                  {mutation.isPending ? 'جاري الحفظ...' : 'حفظ بيانات الدواء'}
                </Button>
                <Button type="button" variant="outline" className="h-14 px-8 rounded-2xl border-2 font-bold" onClick={() => onOpenChange(false)}>
                  إلغاء
                </Button>
              </DialogFooter>
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}