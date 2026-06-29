import React, { useMemo, useEffect, useState } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Autocomplete } from '@/components/ui/autocomplete';
import { api } from '@/lib/api-client';
import type { Product, Supplier, PurchaseOrder } from '@shared/types';
import { Trash2, Package, PlusCircle, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { PurchaseAddItemModal } from './PurchaseAddItemModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
const purchaseSchema = z.object({
  invoiceNumber: z.string().min(1, 'رقم فاتورة المورد مطلوب'),
  supplierId: z.string().min(1, 'يجب اختيار المورد'),
  items: z.array(z.object({
    productId: z.string().min(1, 'يجب اختيار المنتج'),
    quantity: z.coerce.number().min(1, 'الكمية يجب أن تكون 1 على الأقل').default(1),
    costPrice: z.coerce.number().min(0, 'التكلفة يجب أن تكون 0 أو أكثر').default(0)
  })).min(1, 'أضف صنفاً واحداً على الأقل'),
  notes: z.string().default(''),
  date: z.string().min(1, 'تاريخ الفاتورة مطلوب')
});
type PurchaseFormValues = z.output<typeof purchaseSchema>;
interface PurchaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: PurchaseOrder;
}
export function PurchaseForm({ open, onOpenChange, order }: PurchaseFormProps) {
  const queryClient = useQueryClient();
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      invoiceNumber: '',
      supplierId: '',
      items: [],
      notes: '',
      date: new Date().toISOString().split('T')[0]
    }
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  });
  const { data: productsData } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api<{ items: Product[] }>('/api/products')
  });
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useQuery<{ items: Supplier[] }>({
    queryKey: ['suppliers'],
    queryFn: () => api<{ items: Supplier[] }>('/api/suppliers')
  });
  const formItems = form.watch('items');
  const totals = useMemo(() => {
    const items = formItems || [];
    return items.reduce((sum, i) => sum + (Number(i.quantity || 0) * Number(i.costPrice || 0)), 0);
  }, [formItems]);
  const mutation = useMutation({
    mutationFn: (values: PurchaseFormValues) => {
      return api<PurchaseOrder>(order ? `/api/purchases/${order.id}` : '/api/purchases', {
        method: order ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...values,
          status: 'received',
          totalCost: totals,
          timestamp: new Date(values.date).getTime()
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success(order ? 'تم تحديث فاتورة المشتريات' : 'تم إنشاء فاتورة مشتريات جديدة بنجاح');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('فشل في حفظ الطلب')
  });
  const supplierOptions = useMemo(() => (suppliersData?.items || []).map(s => ({ label: s.name, value: s.id })), [suppliersData]);
  useEffect(() => {
    if (open) {
      if (order) {
        form.reset({
          invoiceNumber: order.invoiceNumber || '',
          supplierId: order.supplierId,
          items: order.items,
          date: new Date(order.timestamp).toISOString().split('T')[0],
          notes: ''
        });
      } else {
        form.reset({
          invoiceNumber: '',
          supplierId: '',
          items: [],
          notes: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [open, order, form]);
  const getProductName = (id: string) => productsData?.items.find(p => p.id === id)?.name || 'منتج غير معروف';
  const onSubmit: SubmitHandler<PurchaseFormValues> = (values) => {
    mutation.mutate(values);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right font-display text-2xl font-bold flex items-center gap-3">
            <Package className="size-6 text-pharmav-primary" />
            {order ? 'تعديل فاتورة مشتريات' : 'فاتورة مشتريات جديدة'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="supplierId" render={({ field }) => (
                <FormItem>
                  <FormLabel>المورد</FormLabel>
                  <Autocomplete options={supplierOptions} value={field.value} onValueChange={field.onChange} isLoading={isLoadingSuppliers} />
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="invoiceNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم فاتورة المورد</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-12 font-mono text-center text-lg border-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-row-reverse">
                <h4 className="font-bold flex items-center gap-2">
                  <ShoppingBag className="size-4" /> أصناف الفاتورة
                </h4>
                <Button type="button" size="sm" variant="outline" onClick={() => setIsAddItemOpen(true)} className="gap-1 border-2 font-bold">
                  <PlusCircle className="size-4" /> إضافة صنف
                </Button>
              </div>
              <div className="border rounded-2xl overflow-hidden bg-muted/10">
                <Table className="text-right">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-right">المنتج</TableHead>
                      <TableHead className="text-center">الكمية</TableHead>
                      <TableHead className="text-center">التكلفة</TableHead>
                      <TableHead className="text-left">الإجمالي</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium">{getProductName(field.productId)}</TableCell>
                        <TableCell className="text-center font-bold">{field.quantity}</TableCell>
                        <TableCell className="text-center">{field.costPrice.toFixed(2)} ر.س</TableCell>
                        <TableCell className="text-left font-bold">{(field.quantity * field.costPrice).toFixed(2)} ر.س</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive">
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {fields.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-muted-foreground italic">
                          لم يتم إضافة أي أصناف بعد.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="bg-pharmav-primary/10 p-6 rounded-3xl flex items-center justify-between">
              <span className="font-display font-bold text-xl">إجمالي قيمة الفاتورة:</span>
              <div className="text-3xl font-display font-bold text-pharmav-primary">{totals.toLocaleString()} <span className="text-sm font-normal">ر.س</span></div>
            </div>
            <DialogFooter className="mt-8">
              <Button type="submit" disabled={mutation.isPending || fields.length === 0} className="w-full h-14 bg-pharmav-primary font-bold text-lg shadow-neon-blue">
                {mutation.isPending ? "جاري الحفظ..." : "حفظ فاتورة المشتريات"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <PurchaseAddItemModal
          open={isAddItemOpen}
          onOpenChange={setIsAddItemOpen}
          onAdd={(item) => append(item)}
        />
      </DialogContent>
    </Dialog>
  );
}