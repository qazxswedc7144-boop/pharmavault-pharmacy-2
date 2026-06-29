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
import { Package, Calculator, Info, Barcode, Calendar } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
const addItemSchema = z.object({
  productId: z.string().min(1, 'يجب اختيار منتج'),
  quantity: z.coerce.number().min(1, 'الكمية يجب أن تكون 1 على الأقل').default(1),
  costPrice: z.coerce.number().min(0, 'التكلفة مطلوبة').default(0),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
  notes: z.string().optional(),
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
    resolver: zodResolver(addItemSchema) as Resolver<AddItemValues>,
    defaultValues: {
      productId: '',
      quantity: 1,
      costPrice: 0,
      expiryDate: '',
      batchNumber: '',
      notes: '',
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
      form.setValue('costPrice', product.costPrice || 0);
      form.setValue('expiryDate', product.expiryDate || '');
      form.setValue('batchNumber', product.batchNumber || '');
    }
  };
  const onSubmit: SubmitHandler<AddItemValues> = (values) => {
    onAdd(values);
    onOpenChange(false);
    form.reset();
  };
  const quantity = form.watch('quantity') || 0;
  const costPrice = form.watch('costPrice') || 0;
  const currentTotal = quantity * costPrice;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-glass" dir="rtl">
        <DialogHeader className="p-6 bg-muted/30 border-b">
          <DialogTitle className="text-right font-display text-xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="size-5 text-pharmav-primary" />
              إضافة صنف لفاتورة المشتريات
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full"><Info className="size-4" /></Button>
                </TooltipTrigger>
                <TooltipContent className="text-right">إدراج دواء في فاتورة التوريد مع تحديث التكلفة والكمية وتاريخ الانتهاء.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6 bg-card">
            <FormField<AddItemValues>
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">الدواء / المنتج المورد</FormLabel>
                  <Autocomplete
                    options={productOptions}
                    value={String(field.value)}
                    onValueChange={handleProductSelect}
                    isLoading={isLoading}
                    placeholder="اكتب اسم الصنف..."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField<AddItemValues>
                control={form.control}
                name="quantity"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel className="font-bold flex items-center gap-2">الكمية الواردة</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...fieldProps}
                        value={value?.toString() ?? ""}
                        onChange={e => onChange(parseFloat(e.target.value) || 0)}
                        className="h-12 text-center text-lg font-bold border-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<AddItemValues>
                control={form.control}
                name="expiryDate"
                render={({ field: { value, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel className="font-bold flex items-center gap-2">
                      <Calendar className="size-3" /> تاريخ الانتهاء
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...fieldProps}
                        value={value?.toString() ?? ""}
                        className="h-12 text-center border-2 font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField<AddItemValues>
              control={form.control}
              name="costPrice"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="font-bold">سعر التكلفة للوحدة (ر.س)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...fieldProps}
                      value={value?.toString() ?? ""}
                      onChange={e => onChange(parseFloat(e.target.value) || 0)}
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
                إجمالي التكلفة للصنف:
              </div>
              <span className="text-3xl font-display font-bold text-pharmav-primary">
                {currentTotal.toFixed(2)} <span className="text-sm font-normal">ر.س</span>
              </span>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced" className="border-none">
                <AccordionTrigger className="text-sm font-bold text-muted-foreground hover:no-underline py-2">
                  بيانات إضافية (رقم الدفعة، ملاحظات)
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <FormField<AddItemValues>
                    control={form.control}
                    name="batchNumber"
                    render={({ field: { value, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel className="text-xs">رقم الدفعة / التشغيلة (Batch)</FormLabel>
                        <div className="relative">
                          <Input 
                            {...fieldProps} 
                            value={value?.toString() ?? ""} 
                            className="h-10 text-right pr-10 font-mono" 
                          />
                          <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField<AddItemValues>
                    control={form.control}
                    name="notes"
                    render={({ field: { value, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel className="text-xs">ملاحظات التوريد</FormLabel>
                        <FormControl>
                          <Input 
                            {...fieldProps} 
                            value={value?.toString() ?? ""} 
                            className="h-10 text-right" 
                            placeholder="أي ملاحظات فنية..." 
                          />
                        </FormControl>
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
                إضافة للصنف
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-14 bg-red-600 hover:bg-red-700 text-white border-none font-bold text-lg rounded-2xl shadow-lg transition-transform active:scale-95"
              >
                إلغاء الأمر
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}