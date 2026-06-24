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
import type { Product, Supplier } from '@shared/types';
import { Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
const purchaseSchema = z.object({
  supplierId: z.string().min(1, 'المورد مطلوب'),
  items: z.array(z.object({
    productId: z.string().min(1, 'المنتج مطلوب'),
    quantity: z.coerce.number().min(1, 'الكمية يجب أن تكون 1 على الأقل'),
    costPrice: z.coerce.number().min(0, 'التكلفة مطلوبة')
  })).min(1, 'أضف صنفاً واحداً على الأقل'),
  status: z.enum(['pending', 'received', 'cancelled']).default('pending')
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
      return api('/api/purchases', { method: 'POST', body: JSON.stringify({ ...values, totalCost: total }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('تم إنشاء أمر الشراء بنجاح');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('فشل في إنشاء الطلب')
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto text-right" dir="rtl">
        <DialogHeader><DialogTitle className="text-right font-display">إنشاء أمر شراء جديد</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="supplierId" render={({ field }) => (
                <FormItem><FormLabel>المورد</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="text-right"><SelectValue placeholder="اختر المورد" /></SelectTrigger></FormControl>
                  <SelectContent className="text-right">{suppliers?.items.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>حالة الطلب</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="text-right"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent className="text-right">
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="received">تم الاستلام (تحديث المخزون)</SelectItem>
                  </SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2 flex-row-reverse">
                <h3 className="text-sm font-bold uppercase">أصناف الطلبية</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1, costPrice: 0 })}>
                  <PlusCircle className="size-4 ml-2" /> إضافة صنف
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end bg-muted/20 p-2 rounded-lg">
                  <div className="col-span-6 text-right">
                    <FormField control={form.control} name={`items.${index}.productId`} render={({ field }) => (
                      <FormItem><FormLabel className="sr-only">الدواء</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="text-right"><SelectValue placeholder="اختر الدواء" /></SelectTrigger></FormControl>
                        <SelectContent className="text-right">{products?.items.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                      </Select></FormItem>
                    )} />
                  </div>
                  <div className="col-span-2">
                    <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                      <FormItem><FormLabel className="sr-only">الكمية</FormLabel><FormControl><Input type="number" {...field} value={field.value.toString()} placeholder="الكمية" /></FormControl></FormItem>
                    )} />
                  </div>
                  <div className="col-span-3">
                    <FormField control={form.control} name={`items.${index}.costPrice`} render={({ field }) => (
                      <FormItem><FormLabel className="sr-only">التكلفة</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value.toString()} placeholder="التكلفة" /></FormControl></FormItem>
                    )} />
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}><Trash2 className="size-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter className="mt-8"><Button type="submit" disabled={mutation.isPending} className="w-full bg-pharmav-primary font-bold py-6 text-lg">تأكيد أمر الشراء</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}