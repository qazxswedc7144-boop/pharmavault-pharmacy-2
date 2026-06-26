import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PurchaseHeader } from '@/components/purchases/PurchaseHeader';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Autocomplete } from '@/components/ui/autocomplete';
import { api } from '@/lib/api-client';
import type { Product, Supplier, PurchaseOrder } from '@shared/types';
import { Trash2, PlusCircle, Package } from 'lucide-react';
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
  notes: z.string().default(''),
  date: z.string().min(1, 'تاريخ الفاتورة مطلوب'),
  isCredit: z.boolean().default(false),
  isReturn: z.boolean().default(false)
});
type PurchaseFormValues = z.infer<typeof purchaseSchema>;
export function PurchaseCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      invoiceNumber: '', supplierId: '', status: 'received',
      items: [{ productId: '', quantity: 1, costPrice: 0 }],
      notes: '', date: new Date().toISOString().split('T')[0],
      isCredit: false, isReturn: false
    }
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  });
  const isReturn = form.watch('isReturn');
  const isCredit = form.watch('isCredit');
  const { data: productsData } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api<{ items: Product[] }>('/api/products')
  });
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useQuery<{ items: Supplier[] }>({
    queryKey: ['suppliers'],
    queryFn: () => api<{ items: Supplier[] }>('/api/suppliers')
  });
  const mutation = useMutation({
    mutationFn: (values: PurchaseFormValues) => {
      const total = values.items.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0);
      return api<PurchaseOrder>('/api/purchases', {
        method: 'POST',
        body: JSON.stringify({ ...values, totalCost: total, timestamp: new Date(values.date).getTime() })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success('تم إنشاء الفاتورة بنجاح');
      navigate('/purchases');
    },
    onError: () => toast.error('فشل في حفظ الفاتورة')
  });
  const supplierOptions = React.useMemo(() => (suppliersData?.items || []).map(s => ({ label: s.name, value: s.id })), [suppliersData]);
  const productOptions = React.useMemo(() => (productsData?.items || []).map(p => ({ label: p.name, value: p.id })), [productsData]);
  return (
    <AppLayout className="bg-muted/10 min-h-screen flex flex-col">
      <PurchaseHeader
        isReturn={isReturn}
        isCredit={isCredit}
        onTypeChange={(val) => form.setValue('isReturn', val)}
        onModeChange={(val) => form.setValue('isCredit', val === 'credit')}
      />
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full" dir="rtl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-8">
            <div className="bg-card border rounded-3xl p-8 shadow-soft space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
                <div className="md:col-span-7">
                  <FormField control={form.control} name="supplierId" render={({ field }) => (
                    <FormItem><FormLabel className="font-bold">المورد</FormLabel><Autocomplete options={supplierOptions} value={field.value} onValueChange={field.onChange} isLoading={isLoadingSuppliers} /></FormItem>
                  )} />
                </div>
                <div className="md:col-span-3">
                  <FormField control={form.control} name="invoiceNumber" render={({ field }) => (
                    <FormItem><FormLabel className="font-bold">رقم الفاتورة</FormLabel><FormControl><Input {...field} className="h-12 text-center font-mono" /></FormControl></FormItem>
                  )} />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-10 gap-6">
                <div className="col-span-5">
                   <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem><FormLabel className="font-bold">التاريخ</FormLabel><FormControl><Input type="date" {...field} className="h-12 text-center" /></FormControl></FormItem>
                  )} />
                </div>
                <div className="col-span-5">
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel className="font-bold">الحالة</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12 text-right"><SelectValue /></SelectTrigger></FormControl><SelectContent className="text-right"><SelectItem value="received">تم الاستلام</SelectItem><SelectItem value="pending">قيد الانتظار</SelectItem></SelectContent></Select></FormItem>
                  )} />
                </div>
              </div>
            </div>
            <div className="bg-card border rounded-3xl overflow-hidden shadow-soft">
              <div className="p-6 border-b bg-muted/20 flex items-center justify-between flex-row-reverse">
                <span className="font-display font-bold text-xl flex items-center gap-2"><Package className="size-6 text-pharmav-primary" /> تفاصيل الأصناف</span>
                <Button type="button" onClick={() => append({ productId: '', quantity: 1, costPrice: 0 })} className="bg-pharmav-primary/10 text-pharmav-primary hover:bg-pharmav-primary/20 gap-2 border-none font-bold"><PlusCircle className="size-4" /> إضافة صنف</Button>
              </div>
              <div className="p-6 space-y-4">
                {fields.map((f, index) => (
                  <div key={f.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-muted/5 p-4 rounded-2xl border">
                    <div className="md:col-span-6">
                      <FormField control={form.control} name={`items.${index}.productId`} render={({ field: itField }) => (
                        <FormItem><FormLabel className="text-[10px]">الدواء</FormLabel><Autocomplete options={productOptions} value={itField.value} onValueChange={itField.onChange} /></FormItem>
                      )} />
                    </div>
                    <div className="md:col-span-2">
                      <FormField control={form.control} name={`items.${index}.quantity`} render={({ field: itField }) => (
                        <FormItem><FormLabel className="text-[10px]">الكمية</FormLabel><FormControl><Input type="number" {...itField} onChange={e => itField.onChange(parseInt(e.target.value) || 0)} className="h-12 text-center" /></FormControl></FormItem>
                      )} />
                    </div>
                    <div className="md:col-span-3">
                      <FormField control={form.control} name={`items.${index}.costPrice`} render={({ field: itField }) => (
                        <FormItem><FormLabel className="text-[10px]">التكلفة</FormLabel><FormControl><Input type="number" step="0.01" {...itField} onChange={e => itField.onChange(parseFloat(e.target.value) || 0)} className="h-12 text-center" /></FormControl></FormItem>
                      )} />
                    </div>
                    <div className="md:col-span-1 flex justify-center pb-1">
                      <Button type="button" variant="ghost" onClick={() => remove(index)}><Trash2 className="size-5 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={mutation.isPending} className="h-16 px-12 bg-pharmav-primary font-display font-bold text-xl rounded-2xl shadow-neon-blue">
                {mutation.isPending ? 'جاري الحفظ...' : 'تأكيد وحفظ فاتورة المشتريات'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}