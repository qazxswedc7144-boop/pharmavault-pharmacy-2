import React, { useMemo, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Autocomplete } from '@/components/ui/autocomplete';
import { api } from '@/lib/api-client';
import type { Product, Supplier, PurchaseOrder } from '@shared/types';
import { Trash2, PlusCircle, Package, Camera, Edit3, Calculator, History } from 'lucide-react';
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
  const items = form.watch('items');
  const totals = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  }, [items]);
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
            {/* Header Info: 70/30 Split */}
            <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
              {/* Left Column (70%) - Supplier and Invoice Main Details */}
              <div className="md:col-span-7 bg-card border rounded-3xl p-8 shadow-soft space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="supplierId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold flex items-center gap-2">
                        <Truck className="size-4 text-pharmav-primary" /> المورد / الشركة
                      </FormLabel>
                      <Autocomplete options={supplierOptions} value={field.value} onValueChange={field.onChange} isLoading={isLoadingSuppliers} />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="invoiceNumber" render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="font-bold">رقم فاتورة المورد</FormLabel>
                        <Badge variant="outline" className="bg-muted/50 border-dashed text-[10px] gap-1 flex-row-reverse">
                          <Edit3 className="size-3" /> إدخال يدوي
                        </Badge>
                      </div>
                      <FormControl><Input {...field} className="h-12 font-mono text-center text-lg border-2" placeholder="أدخل رقم الفاتورة الورقية..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold">ملاحظات إضافية</Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsFileAttached(!isFileAttached)}
                      className={cn("gap-2", isFileAttached ? "text-pharmav-secondary" : "text-muted-foreground")}
                    >
                      <Camera className="size-4" /> {isFileAttached ? "تم إرفاق صورة" : "إرفاق فاتورة مصورة"}
                    </Button>
                  </div>
                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormControl><Textarea {...field} className="min-h-[100px] border-2 bg-muted/20" placeholder="اكتب أي تفاصيل إضافية هنا..." /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>
              {/* Right Column (30%) - Meta Data & Totals Preview */}
              <div className="md:col-span-3 space-y-6">
                <div className="bg-card border rounded-3xl p-6 shadow-soft space-y-6">
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold flex items-center gap-2">
                        <History className="size-4" /> تاريخ التوريد
                      </FormLabel>
                      <FormControl><Input type="date" {...field} className="h-12 text-center font-bold" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
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
                {/* Total Preview Card */}
                <div className="bg-pharmav-primary rounded-3xl p-6 text-white shadow-neon-blue relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 space-y-2">
                    <span className="text-sm font-bold opacity-80 flex items-center gap-2 flex-row-reverse">
                      <Calculator className="size-4" /> إجمالي الفاتورة
                    </span>
                    <div className="text-4xl font-display font-bold tabular-nums">
                      {totals.toLocaleString()} <span className="text-sm font-normal">ر.س</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Items Table Section */}
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
                      <FormField control={form.control} name={`items.${index}.productId`} render={({ field: itField }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold text-muted-foreground mb-1 block">اختر الدواء</FormLabel>
                          <Autocomplete options={productOptions} value={itField.value} onValueChange={itField.onChange} className="bg-white" />
                        </FormItem>
                      )} />
                    </div>
                    <div className="lg:col-span-2">
                      <FormField control={form.control} name={`items.${index}.quantity`} render={({ field: itField }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold text-muted-foreground mb-1 block">الكمية</FormLabel>
                          <FormControl><Input type="number" {...itField} onChange={e => itField.onChange(parseInt(e.target.value) || 0)} className="h-12 text-center text-lg font-bold" /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                    <div className="lg:col-span-3">
                      <FormField control={form.control} name={`items.${index}.costPrice`} render={({ field: itField }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold text-muted-foreground mb-1 block">سعر التكلفة (ر.س)</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...itField} onChange={e => itField.onChange(parseFloat(e.target.value) || 0)} className="h-12 text-center text-lg font-bold text-pharmav-primary" /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                    <div className="lg:col-span-1 flex justify-center pb-1">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => remove(index)}
                        className="h-12 w-12 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      >
                        <Trash2 className="size-5" />
                      </Button>
                    </div>
                  </div>
                ))}
                {fields.length === 0 && (
                  <div className="py-20 text-center text-muted-foreground italic bg-muted/10 rounded-2xl">
                    يرجى إضافة صنف واحد على الأقل للمتابعة...
                  </div>
                )}
              </div>
            </div>
            {/* Bottom Actions */}
            <div className="flex justify-end pt-4 pb-12">
              <Button 
                type="submit" 
                disabled={mutation.isPending || fields.length === 0} 
                className="h-16 px-16 bg-pharmav-primary font-display font-bold text-xl rounded-2xl shadow-neon-blue flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {mutation.isPending ? "جاري المعالجة..." : isReturn ? "تأكيد مرتجع المشتريات" : "حفظ وترحيل الفاتورة للمخزن"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}