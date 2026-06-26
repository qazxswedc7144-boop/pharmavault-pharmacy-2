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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Autocomplete } from '@/components/ui/autocomplete';
import { api } from '@/lib/api-client';
import type { Product, Supplier, PurchaseOrder } from '@shared/types';
import { Trash2, PlusCircle, Package, Camera, Pencil } from 'lucide-react';
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
  const { data: products } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api<{ items: Product[] }>('/api/products')
  });
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery<{ items: Supplier[] }>({
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
  const supplierOptions = React.useMemo(() => (suppliers?.items || []).map(s => ({ label: s.name, value: s.id })), [suppliers]);
  const productOptions = React.useMemo(() => (products?.items || []).map(p => ({ label: p.name, value: p.id })), [products]);
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
              {/* Row 1: 70/30 Grid */}
              <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
                <div className="md:col-span-7">
                  <FormField<PurchaseFormValues>
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">المورد المعتمد</FormLabel>
                        <Autocomplete
                          options={supplierOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="ابحث عن شركة أو مورد..."
                          isLoading={isLoadingSuppliers}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="md:col-span-3">
                  <FormField<PurchaseFormValues>
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between flex-row-reverse mb-1">
                          <FormLabel className="font-bold">رقم فاتورة المورد</FormLabel>
                          <Badge className="bg-orange-500 text-white text-[10px] px-2 py-0">يدوي</Badge>
                        </div>
                        <div className="relative">
                          <FormControl>
                            <Input {...field} className="h-12 font-mono text-center text-lg focus:ring-orange-500/20" placeholder="000000" />
                          </FormControl>
                          <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {/* Row 2: 30/70 Grid */}
              <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
                <div className="md:col-span-3">
                  <FormField<PurchaseFormValues>
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">ملاحظات إضافية</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input {...field} className="h-12 pl-12 text-right bg-muted/30 border-none" placeholder="اكتب ملاحظة..." />
                          </FormControl>
                          <Button type="button" variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 hover:text-pharmav-primary">
                            <Camera className="size-5" />
                          </Button>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="md:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField<PurchaseFormValues>
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">تاريخ الاستلام</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="h-12 text-center" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField<PurchaseFormValues>
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">حالة الفاتورة</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 text-right"><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent className="text-right">
                            <SelectItem value="received">تم الاستلام</SelectItem>
                            <SelectItem value="pending">بانتظار التوريد</SelectItem>
                            <SelectItem value="cancelled">ملغاة</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            {/* Items Table */}
            <div className="bg-card border rounded-3xl overflow-hidden shadow-soft">
              <div className="p-6 border-b bg-muted/20 flex items-center justify-between flex-row-reverse">
                <span className="font-display font-bold text-xl flex items-center gap-2">
                  <Package className="size-6 text-pharmav-primary" /> تفاصيل الأصناف الموردة
                </span>
                <Button type="button" onClick={() => append({ productId: '', quantity: 1, costPrice: 0 })} className="bg-pharmav-primary/10 text-pharmav-primary hover:bg-pharmav-primary/20 gap-2 border-none font-bold">
                  <PlusCircle className="size-4" /> إضافة صنف
                </Button>
              </div>
              <div className="p-6 space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-muted/5 p-4 rounded-2xl border">
                    <div className="md:col-span-6">
                      <FormField<PurchaseFormValues>
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">الدواء</FormLabel>
                            <Autocomplete options={productOptions} value={f.value} onValueChange={f.onChange} placeholder="اختر الدواء..." className="h-12" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FormField<PurchaseFormValues>
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">الكمية</FormLabel>
                            <FormControl><Input type="number" {...f} className="h-12 text-center font-bold" /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <FormField<PurchaseFormValues>
                        control={form.control}
                        name={`items.${index}.costPrice`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">سعر التكلفة (ر.س)</FormLabel>
                            <FormControl><Input type="number" step="0.01" {...f} className="h-12 text-center font-bold" /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-center pb-1">
                      <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => remove(index)}>
                        <Trash2 className="size-5" />
                      </Button>
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