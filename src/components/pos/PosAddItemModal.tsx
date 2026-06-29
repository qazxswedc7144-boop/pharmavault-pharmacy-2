import React, { useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
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
import { Autocomplete } from '@/components/ui/autocomplete';
import { api } from '@/lib/api-client';
import type { Product } from '@shared/types';
import { ShoppingCart, AlertCircle } from 'lucide-react';
const posAddSchema = z.object({
  productId: z.string().min(1, 'يجب اختيار منتج'),
  quantity: z.coerce.number().min(1, 'الكمية يجب أن تكون 1 على الأقل').default(1),
  unitPrice: z.coerce.number().min(0, 'السعر مطلوب').default(0),
});
type PosAddValues = z.output<typeof posAddSchema>;
interface PosAddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: Product, quantity: number, price: number) => void;
}
export function PosAddItemModal({ open, onOpenChange, onAdd }: PosAddItemModalProps) {
  const { data: productsData, isLoading } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api<{ items: Product[] }>('/api/products'),
  });
  const form = useForm<PosAddValues>({
    resolver: zodResolver(posAddSchema),
    defaultValues: {
      productId: '',
      quantity: 1,
      unitPrice: 0,
    },
  });
  const productOptions = useMemo(
    () => (productsData?.items || []).map((p) => ({ label: p.name, value: p.id })),
    [productsData]
  );
  const selectedProductId = form.watch('productId');
  const selectedProduct = useMemo(
    () => productsData?.items.find((p) => p.id === selectedProductId),
    [productsData, selectedProductId]
  );
  const handleProductSelect = (id: string) => {
    form.setValue('productId', id);
    const product = productsData?.items.find((p) => p.id === id);
    if (product) {
      form.setValue('unitPrice', product.price);
    }
  };
  const onSubmit: SubmitHandler<PosAddValues> = (values) => {
    if (selectedProduct) {
      onAdd(selectedProduct, values.quantity, values.unitPrice);
      onOpenChange(false);
      form.reset();
    }
  };
  const quantity = form.watch('quantity') || 0;
  const unitPrice = form.watch('unitPrice') || 0;
  const currentTotal = quantity * unitPrice;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right font-display text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="size-5 text-pharmav-primary" />
            إضافة منتج للسلة
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اختيار المنتج</FormLabel>
                  <Autocomplete
                    options={productOptions}
                    value={field.value}
                    onValueChange={handleProductSelect}
                    isLoading={isLoading}
                    placeholder="ابحث بالاسم أو الكود..."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedProduct && selectedProduct.stockQuantity < 5 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-2 text-orange-700 text-xs">
                <AlertCircle className="size-4" />
                تنبيه: المخزون الحالي منخفض ({selectedProduct.stockQuantity} {selectedProduct.unit})
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الكمية</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        className="h-12 text-center text-lg font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سعر الوحدة</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        value={field.value}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        className="h-12 text-center text-lg font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="p-4 bg-muted/50 rounded-2xl flex justify-between items-center flex-row-reverse border border-dashed">
              <span className="font-bold">المجموع الفرعي:</span>
              <span className="text-2xl font-display font-bold text-pharmav-primary">
                {currentTotal.toFixed(2)} ر.س
              </span>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full h-12 bg-pharmav-primary font-bold shadow-neon-blue">
                إضافة للسلة
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}