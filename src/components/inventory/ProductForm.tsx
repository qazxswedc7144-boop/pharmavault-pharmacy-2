import React from 'react';
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
import { api } from '@/lib/api-client';
import type { Product, Category, Supplier } from '@shared/types';
import { toast } from 'sonner';
const productSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  tradeName: z.string().optional().or(z.literal('')),
  scientificName: z.string().optional().or(z.literal('')),
  barcode: z.string().optional().or(z.literal('')),
  sku: z.string().min(2, 'كود المنتج مطلوب'),
  categoryId: z.string().min(1, 'التصنيف مطلوب'),
  supplierId: z.string().min(1, 'المورد مطلوب'),
  price: z.coerce.number().min(0.01, 'السعر يجب أن يكون أكبر من صفر'),
  costPrice: z.coerce.number().min(0, 'سعر التكلفة مطلوب'),
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
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', tradeName: '', scientificName: '', barcode: '',
      sku: '', categoryId: '', supplierId: '',
      price: 0, costPrice: 0, taxRate: 0, discountRate: 0,
      stockQuantity: 0, unit: 'tablet',
      expiryDate: '', batchNumber: '', minStockLevel: 5
    }
  });
  const { data: categories } = useQuery<{ items: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => api<{ items: Category[] }>('/api/categories')
  });
  const { data: suppliers } = useQuery<{ items: Supplier[] }>({
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
      toast.success(product ? 'تم تحديث المنتج' : 'تمت إضافة المنتج بنجاح');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('حدث خطأ ما')
  });
  React.useEffect(() => {
    if (open && product) {
      form.reset({
        name: product.name,
        tradeName: product.tradeName || '',
        scientificName: product.scientificName || '',
        barcode: product.barcode || '',
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
    } else if (open) {
      form.reset({
        name: '', tradeName: '', scientificName: '', barcode: '',
        sku: '', categoryId: '', supplierId: '',
        price: 0, costPrice: 0, taxRate: 0, discountRate: 0,
        stockQuantity: 0, unit: 'tablet',
        expiryDate: '', batchNumber: '', minStockLevel: 5
      });
    }
  }, [product, open, form]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh] text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right font-display">{product ? 'تعديل دواء' : 'تسجيل دواء جديد'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField<ProductFormValues, 'name'> control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>الاسم الأساسي</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField<ProductFormValues, 'tradeName'> control={form.control} name="tradeName" render={({ field }) => (
                <FormItem><FormLabel>الاسم التجاري</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField<ProductFormValues, 'scientificName'> control={form.control} name="scientificName" render={({ field }) => (
                <FormItem><FormLabel>الاسم العلمي</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField<ProductFormValues, 'barcode'> control={form.control} name="barcode" render={({ field }) => (
                <FormItem><FormLabel>الباركود</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField<ProductFormValues, 'sku'> control={form.control} name="sku" render={({ field }) => (
                <FormItem><FormLabel>كود المنتج (SKU)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField<ProductFormValues, 'unit'> control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>وحدة الصرف</FormLabel><FormControl><Input placeholder="قرص، أمبولة، إلخ" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField<ProductFormValues, 'categoryId'> control={form.control} name="categoryId" render={({ field }) => (
                <FormItem><FormLabel>التصنيف</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="text-right"><SelectValue placeholder="اختر التصنيف" /></SelectTrigger></FormControl>
                  <SelectContent className="text-right">{categories?.items.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage /></FormItem>
              )} />
              <FormField<ProductFormValues, 'supplierId'> control={form.control} name="supplierId" render={({ field }) => (
                <FormItem><FormLabel>المورد الافتراضي</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="text-right"><SelectValue placeholder="اختر المورد" /></SelectTrigger></FormControl>
                  <SelectContent className="text-right">{suppliers?.items.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <FormField<ProductFormValues, 'price'> control={form.control} name="price" render={({ field }) => (
                <FormItem><FormLabel>سعر البيع</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField<ProductFormValues, 'costPrice'> control={form.control} name="costPrice" render={({ field }) => (
                <FormItem><FormLabel>سعر التكلفة</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField<ProductFormValues, 'taxRate'> control={form.control} name="taxRate" render={({ field }) => (
                <FormItem><FormLabel>الضريبة (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField<ProductFormValues, 'discountRate'> control={form.control} name="discountRate" render={({ field }) => (
                <FormItem><FormLabel>الخصم (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField<ProductFormValues, 'stockQuantity'> control={form.control} name="stockQuantity" render={({ field }) => (
                <FormItem><FormLabel>الكمية</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField<ProductFormValues, 'minStockLevel'> control={form.control} name="minStockLevel" render={({ field }) => (
                <FormItem><FormLabel>حد الطلب</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField<ProductFormValues, 'batchNumber'> control={form.control} name="batchNumber" render={({ field }) => (
                <FormItem><FormLabel>رقم الدفعة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField<ProductFormValues, 'expiryDate'> control={form.control} name="expiryDate" render={({ field }) => (
              <FormItem><FormLabel>تاريخ الانتهاء</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter className="mt-6">
              <Button type="submit" disabled={mutation.isPending} className="w-full bg-pharmav-primary font-bold">
                {product ? 'تحديث بيانات الدواء' : 'تسجيل الدواء في المخزن'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}