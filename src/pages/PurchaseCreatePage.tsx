import React, { useMemo, useState } from 'react';
import { useForm, useFieldArray, Control } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { Autocomplete } from '@/components/ui/autocomplete';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import type { Product, Supplier, PurchaseOrder } from '@shared/types';
import { Trash2, PlusCircle, Package, Camera, Edit3, Calculator, History, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
const purchaseSchema = z.object({
  invoiceNumber: z.string().min(1, 'رقم فاتورة المورد مطلوب'),
  supplierId: z.string().min(1, 'يجب اختيار المورد'),
  items: z.array(z.object({
    productId: z.string().min(1, 'يجب اختيار المنتج'),
    quantity: z.coerce.number().min(1, 'الكمية يجب أن تكون 1 على الأقل'),
    costPrice: z.coerce.number().min(0, 'التكلفة مطلوبة')
  })).min(1, 'أضف صنفاً واحداً على الأقل'),
  status: z.enum(['pending', 'received', 'cancelled'] as const),
  notes: z.string().default(''),
  date: z.string().min(1, 'تاريخ الفاتورة مطلوب'),
  isCredit: z.boolean().default(false),
  isReturn: z.boolean().default(false)
});
type PurchaseFormValues = z.infer<typeof purchaseSchema>;
export function PurchaseCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isFileAttached, setIsFileAttached] = useState(false);
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      invoiceNumber: '',
      supplierId: '',
      status: 'received',
      items: [{ productId: '', quantity: 1, costPrice: 0 }],
      notes: '',
      date: new Date().toISOString().split('T')[0],
      isCredit: false,
      isReturn: false
    }
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  });
  const isReturn = form.watch('isReturn');
  const isCredit = form.watch('isCredit');
  const formItems = form.watch('items');
  const totals = useMemo(() => {
    return (formItems || []).reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.costPrice || 0)), 0);
  }, [formItems]);
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
      return api<PurchaseOrder>('/api/purchases', {
        method: 'POST',
        body: JSON.stringify({ ...values, totalCost: totals, timestamp: new Date(values.date).getTime() })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success('تم تسجيل فاتورة المشتريات بنجاح');
      navigate('/purchases');
    },
    onError: () => toast.error('فشل في حفظ الفاتورة، يرجى التحقق من البيانات')
  });
  const supplierOptions = useMemo(() => (suppliersData?.items || []).map(s => ({ label: s.name, value: s.id })), [suppliersData]);
  const productOptions = useMemo(() => (productsData?.items || []).map(p => ({ label: p.name, value: p.id })), [productsData]);
  const control = form.control as unknown as Control<PurchaseFormValues>;
  return (
    <AppLayout className="bg-muted/10 min-h-screen">
      <PurchaseHeader
        isReturn={isReturn}
        isCredit={isCredit}
        onTypeChange={(val) => form.setValue('isReturn', val)}
        onModeChange={(val) => form.setValue('isCredit', val === 'credit')}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
              <div className="md:col-span-7 bg-card border rounded-3xl p-8 shadow-soft space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={control} name="supplierId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold flex items-center gap-2">
                        <Truck className="size-4 text-pharmav-primary" /> المورد / الشركة
                      </FormLabel>
                      <Autocomplete options={supplierOptions} value={field.value} onValueChange={field.onChange} isLoading={isLoadingSuppliers} />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={control} name="invoiceNumber" render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="font-bold">رقم فاتورة المورد</FormLabel>
                      </div>
                      <FormControl><Input {...field} className="h-12 font-mono text-center text-lg border-2" placeholder="رقم الفاتورة..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
              <div className="md:col-span-3 space-y-6">
                <div className="bg-card border rounded-3xl p-6 shadow-soft space-y-6">
                  <FormField control={control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold flex items-center gap-2">
                        <History className="size-4" /> تاريخ التوريد
                      </FormLabel>
                      <FormControl><Input type="date" {...field} className="h-12 text-center font-bold" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">حالة الطلبية</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-12 text-right"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent className="text-right">
                          <SelectItem value="received">تم الاستلام والمراجعة</SelectItem>
                          <SelectItem value="pending">في انتظار الشحن</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
              </div>
            </div>
            <div className="bg-card border rounded-3xl overflow-hidden shadow-soft">
              <div className="p-6 border-b bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-pharmav-primary/10 text-pharmav-primary">
                    <Package className="size-5" />
                  </div>
                  <span className="font-display font-bold text-xl">قائمة الأصناف الواردة</span>
                </div>
                <Button
                  type="button"
                  onClick={() => append({ productId: '', quantity: 1, costPrice: 0 })}
                  className="bg-pharmav-primary hover:bg-pharmav-primary/90 text-white gap-2 font-bold px-6 h-11 rounded-xl"
                >
                  <PlusCircle className="size-4" /> إضافة صنف
                </Button>
              </div>
              <div className="p-6 space-y-4">
                {fields.map((f, index) => (
                  <div key={f.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end bg-muted/5 p-5 rounded-2xl border-2 border-dashed border-border/60 hover:border-pharmav-primary/30 transition-all">
                    <div className="lg:col-span-6">
                      <FormField control={control} name={`items.${index}.productId`} render={({ field: itField }) => (
                        <FormItem>
                          <Autocomplete options={productOptions} value={itField.value} onValueChange={itField.onChange} className="bg-white" />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-4 pb-12">
              <Button
                type="submit"
                disabled={mutation.isPending || fields.length === 0}
                className="h-16 px-16 bg-pharmav-primary font-display font-bold text-xl rounded-2xl shadow-neon-blue"
              >
                {mutation.isPending ? "جاري المعالجة..." : "حفظ الفاتورة"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}