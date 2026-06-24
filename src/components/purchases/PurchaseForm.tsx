import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import type { Product, Supplier, PurchaseOrder } from '@shared/types';
import { Trash2, PlusCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
const purchaseSchema = z.object({
  supplierId: z.string().min(1, 'يجب اختيار المورد'),
  items: z.array(z.object({
    productId: z.string().min(1, 'يجب اختيار المنتج'),
    quantity: z.coerce.number().min(1, 'الكمية يجب أن تكون 1 على الأقل'),
    costPrice: z.coerce.number().min(0, 'التكلفة مطلوبة')
  })).min(1, 'أضف صنفاً واحداً على الأقل'),
  status: z.enum(['pending', 'received', 'cancelled'])
});
type PurchaseFormValues = z.infer<typeof purchaseSchema>;
interface PurchaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function PurchaseForm({ open, onOpenChange }: PurchaseFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { supplierId: '', status: 'pending', items: [{ productId: '', quantity: 1, costPrice: 0 }] }
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });
  const { data: products } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api<{ items: Product[] }>('/api/products')
  });
  const { data: suppliers } = useQuery<{ items: Supplier[] }>({
    queryKey: ['suppliers'],
    queryFn: () => api<{ items: Supplier[] }>('/api/suppliers')
  });
  const mutation = useMutation({
    mutationFn: (values: PurchaseFormValues) => {
      const total = values.items.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0);
      return api<PurchaseOrder>('/api/purchases', { method: 'POST', body: JSON.stringify({ ...values, totalCost: total }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('تم إنشاء طلب الشراء بنجاح');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('فشل في إرسال طلب الشراء')
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto text-right" dir="rtl">
        <DialogHeader><DialogTitle className="text-right font-display text-2xl font-bold">طلبية شراء جديدة</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField<PurchaseFormValues> control={form.control} name="supplierId" render={({ field }) => (
                <FormItem><FormLabel>المورد</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="text-right"><SelectValue placeholder="اختر المورد" /></SelectTrigger></FormControl>
                  <SelectContent className="text-right">{suppliers?.items.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select></FormItem>
              )} />
              <FormField<PurchaseFormValues> control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>حالة الطلبية</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="text-right"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent className="text-right">
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="received">تم الاستلام</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select></FormItem>
              )} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-row-reverse"><span className="font-bold flex items-center gap-2"><Package className="size-4" /> الأصناف</span>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1, costPrice: 0 })}>إضافة صنف</Button></div>
              {fields.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end bg-muted/20 p-2 rounded-xl">
                  <div className="col-span-6">
                    <FormField<PurchaseFormValues> control={form.control} name={`items.${index}.productId`} render={({ field }) => (
                      <FormItem><Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="text-right"><SelectValue placeholder="اختر الدواء" /></SelectTrigger></FormControl>
                        <SelectContent className="text-right">{products?.items.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                      </Select></FormItem>
                    )} />
                  </div>
                  <div className="col-span-2">
                    <FormField<PurchaseFormValues> control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                      <FormItem><FormControl><Input type="number" {...field} value={field.value} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="text-left" /></FormControl></FormItem>
                    )} />
                  </div>
                  <div className="col-span-3">
                    <FormField<PurchaseFormValues> control={form.control} name={`items.${index}.costPrice`} render={({ field }) => (
                      <FormItem><FormControl><Input type="number" step="0.01" {...field} value={field.value} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="text-left" /></FormControl></FormItem>
                    )} />
                  </div>
                  <div className="col-span-1"><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="size-4" /></Button></div>
                </div>
              ))}
            </div>
            <DialogFooter className="mt-8"><Button type="submit" disabled={mutation.isPending} className="w-full bg-pharmav-primary font-bold">تأكيد طلب الشراء</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}