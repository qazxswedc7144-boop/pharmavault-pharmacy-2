import React, { useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Autocomplete } from '@/components/ui/autocomplete';
import { api } from '@/lib/api-client';
import type { Product, Supplier, PurchaseOrder } from '@shared/types';
import { Trash2, Package, Calculator } from 'lucide-react';
import { toast } from 'sonner';
const purchaseSchema = z.object({
  invoiceNumber: z.string().min(1, 'رقم فاتورة المورد مطلوب'),
  supplierId: z.string().min(1, 'يجب اختيار المورد'),
  items: z.array(z.object({
    productId: z.string().min(1, 'يجب اختيار المنتج'),
    quantity: z.coerce.number().min(1, 'الكمية يجب أن تكون 1 على الأقل'),
    costPrice: z.coerce.number().min(0, 'التكلفة مطلوبة')
  })).min(1, 'أضف صنفاً واحداً على الأقل'),
  status: z.enum(['pending', 'received', 'cancelled']),
  notes: z.string(),
  date: z.string().min(1, 'تاريخ الفاتورة مطلوب')
});
type PurchaseFormValues = z.infer<typeof purchaseSchema>;
interface PurchaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: PurchaseOrder;
}
export function PurchaseForm({ open, onOpenChange, order }: PurchaseFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      invoiceNumber: '',
      supplierId: '',
      status: 'pending',
      items: [{ productId: '', quantity: 1, costPrice: 0 }],
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
    return (formItems || []).reduce((sum, i) => sum + (Number(i.quantity || 0) * Number(i.costPrice || 0)), 0);
  }, [formItems]);
  const mutation = useMutation({
    mutationFn: (values: PurchaseFormValues) => {
      return api<PurchaseOrder>(order ? `/api/purchases/${order.id}` : '/api/purchases', {
        method: order ? 'PUT' : 'POST',
        body: JSON.stringify({ ...values, totalCost: totals, timestamp: new Date(values.date).getTime() })
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
  const productOptions = useMemo(() => (productsData?.items || []).map(p => ({ label: p.name, value: p.id })), [productsData]);
  React.useEffect(() => {
    if (open) {
      if (order) {
        form.reset({
          invoiceNumber: order.invoiceNumber || '',
          supplierId: order.supplierId,
          status: order.status,
          items: order.items,
          date: new Date(order.timestamp).toISOString().split('T')[0],
          notes: ''
        });
      } else {
        form.reset({
          invoiceNumber: '',
          supplierId: '',
          status: 'pending',
          items: [{ productId: '', quantity: 1, costPrice: 0 }],
          notes: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [open, order, form]);
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
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-6 pt-4">
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
                  <FormControl><Input {...field} className="h-12 font-mono text-center text-lg border-2" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel>التاريخ</FormLabel>
                  <FormControl><Input type="date" {...field} className="h-12 text-center border-2 font-bold" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>الحالة</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="h-12 text-right border-2"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="text-right">
                      <SelectItem value="received">تم الاستلام</SelectItem>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-2"><Calculator className="size-4" /> الأصناف المشمولة</span>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1, costPrice: 0 })}>إضافة صنف</Button>
              </div>
              {fields.map((f, index) => (
                <div key={f.id} className="grid grid-cols-12 gap-3 items-end bg-muted/20 p-4 rounded-2xl border border-dashed">
                  <div className="col-span-12 md:col-span-6">
                    <FormField control={form.control} name={`items.${index}.productId`} render={({ field: itField }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold">المنتج</FormLabel>
                        <Autocomplete options={productOptions} value={itField.value} onValueChange={itField.onChange} className="bg-white" />
                      </FormItem>
                    )} />
                  </div>
                  <div className="col-span-5 md:col-span-2">
                    <FormField control={form.control} name={`items.${index}.quantity`} render={({ field: itField }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold">الكمية</FormLabel>
                        <FormControl><Input type="number" {...itField} onChange={e => itField.onChange(parseInt(e.target.value) || 0)} className="h-10 text-center font-bold" /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <div className="col-span-5 md:col-span-3">
                    <FormField control={form.control} name={`items.${index}.costPrice`} render={({ field: itField }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold">التكلفة (ر.س)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...itField} onChange={e => itField.onChange(parseFloat(e.target.value) || 0)} className="h-10 text-center font-bold" /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex justify-center pb-0.5">
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></Button>
                  </div>
                </div>
              ))}
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
      </DialogContent>
    </Dialog>
  );
}