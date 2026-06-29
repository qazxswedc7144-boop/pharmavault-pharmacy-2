import React, { useMemo } from 'react';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Autocomplete } from '@/components/ui/autocomplete';
import { api } from '@/lib/api-client';
import type { Product } from '@shared/types';
import { ShoppingCart, AlertCircle, Info, Calculator, Tag, Percent } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
const posAddSchema = z.object({
  productId: z.string().min(1, 'يجب اختيار منتج'),
  quantity: z.coerce.number().min(1, 'الكمية يجب أن تكون 1 على الأقل').default(1),
  unitPrice: z.coerce.number().min(0, 'السعر مطلوب').default(0),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
  taxOverride: z.coerce.number().min(0).max(100).default(0),
  discountOverride: z.coerce.number().min(0).default(0),
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
    resolver: zodResolver(posAddSchema) as Resolver<PosAddValues>,
    defaultValues: {
      productId: '',
      quantity: 1,
      unitPrice: 0,
      expiryDate: '',
      batchNumber: '',
      taxOverride: 0,
      discountOverride: 0,
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
      form.setValue('expiryDate', product.expiryDate);
      form.setValue('batchNumber', product.batchNumber);
      form.setValue('taxOverride', product.taxRate);
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
      <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-glass" dir="rtl">
        <DialogHeader className="p-6 bg-muted/30 border-b">
          <DialogTitle className="text-right font-display text-xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-5 text-pharmav-primary" />
              إضافة صنف مخصص
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full"><Info className="size-4" /></Button>
                </TooltipTrigger>
                <TooltipContent>إضافة منتج من القائمة مع إمكانية تعديل السعر والكمية والضرائب.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
            <FormField<PosAddValues>
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">اسم المنتج / الدواء</FormLabel>
                  <Autocomplete
                    options={productOptions}
                    value={String(field.value)}
                    onValueChange={handleProductSelect}
                    isLoading={isLoading}
                    placeholder="ابحث بالاسم أو الكود..."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField<PosAddValues>
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">الكمية</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={String(field.value)}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        className="h-12 text-center text-lg font-bold border-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<PosAddValues>
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">تاريخ الانتهاء</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={String(field.value)}
                        className="h-12 text-center border-2 font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField<PosAddValues>
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">سعر الوحدة (ر.س)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={String(field.value)}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      className="h-12 text-center text-xl font-bold border-2 text-pharmav-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="p-4 bg-muted/50 rounded-2xl flex justify-between items-center border-2 border-dashed border-pharmav-primary/20">
              <div className="flex items-center gap-2 font-bold text-muted-foreground">
                <Calculator className="size-4" />
                المجموع الفرعي:
              </div>
              <span className="text-3xl font-display font-bold text-pharmav-primary">
                {currentTotal.toFixed(2)} <span className="text-sm font-normal">ر.س</span>
              </span>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced" className="border-none">
                <AccordionTrigger className="text-sm font-bold text-muted-foreground hover:no-underline py-2">
                  تفاصيل إضافية (الضرائب، الخصومات، رقم الدفعة)
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField<PosAddValues>
                      control={form.control}
                      name="batchNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">رقم التشغيلة</FormLabel>
                          <FormControl><Input {...field} value={String(field.value)} className="h-10 text-right font-mono" /></FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField<PosAddValues>
                      control={form.control}
                      name="taxOverride"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">نسبة الضريبة (%)</FormLabel>
                          <div className="relative">
                            <Input
                              type="number"
                              {...field}
                              value={String(field.value)}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              className="h-10 text-center pl-10"
                            />
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField<PosAddValues>
                    control={form.control}
                    name="discountOverride"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">خصم نقدي مباشر (ر.س)</FormLabel>
                        <div className="relative">
                          <Input
                            type="number"
                            {...field}
                            value={String(field.value)}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            className="h-10 text-center pl-10"
                          />
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                        </div>
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <DialogFooter className="grid grid-cols-2 gap-4 pt-4 border-t">
              <Button 
                type="submit" 
                className="h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-2xl shadow-lg transition-transform active:scale-95"
              >
                إضافة
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="h-14 bg-red-600 hover:bg-red-700 text-white border-none font-bold text-lg rounded-2xl shadow-lg transition-transform active:scale-95"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}