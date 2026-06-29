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
import { Package, PlusCircle } from 'lucide-react';
const addItemSchema = z.object({
  productId: z.string().min(1, 'يجب اختيار منتج'),
  quantity: z.coerce.number().min(1, 'الكمية يجب أن تكون 1 على الأقل').default(1),
  costPrice: z.coerce.number().min(0, 'التكلفة مطلوبة').default(0),
});
type AddItemValues = z.output<typeof addItemSchema>;
interface PurchaseAddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: AddItemValues) => void;
}
export function PurchaseAddItemModal({ open, onOpenChange, onAdd }: PurchaseAddItemModalProps) {
  const { data: productsData, isLoading } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api<{ items: Product[] }>('/api/products'),
  });
  const form = useForm<AddItemValues>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      productId: '',
      quantity: 1,
      costPrice: 0,
    },
  });
  const productOptions = useMemo(
    () => (productsData?.items || []).map((p) => ({ label: p.name, value: p.id })),
    [productsData]
  );
  const handleProductSelect = (id: string) => {
    form.setValue('productId', id);
    const product = productsData?.items.find((p) => p.id === id);
    if (product) {
      form.setValue('costPrice', product.costPrice);
    }
  };
  const onSubmit: SubmitHandler<AddItemValues> = (values) => {
    onAdd(values);
    onOpenChange(false);
    form.reset();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right font-display text-xl font-bold flex items-center gap-2">
            <Package className="size-5 text-pharmav-primary" />
            إضافة صنف للفاتورة
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البحث عن منتج</FormLabel>
                  <Autocomplete
                    options={productOptions}
                    value={field.value}
                    onValueChange={handleProductSelect}
                    isLoading={isLoading}
                    placeholder="اختر الدواء من القائمة..."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
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
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سعر التكلفة (ر.س)</FormLabel>
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
            <DialogFooter>
              <Button type="submit" className="w-full h-12 bg-pharmav-primary font-bold">
                <PlusCircle className="ml-2 size-4" /> إدراج في الفاتورة
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}