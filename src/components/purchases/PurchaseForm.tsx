import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  date: z.string().min(1, 'تاريخ الفاتورة مطلوب')
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
    defaultValues: {
      invoiceNumber: '',
      supplierId: '',
      status: 'pending',
      items: [{ productId: '', quantity: 1, costPrice: 0 }],
      notes: '',
      date: new Date().toISOString().split('T')[0]
    }
  });
  const { fields, append, remove } = useFieldArray<PurchaseFormValues>({
    control: form.control,
    name: 'items'
  });
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
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('تم إنشاء طلب الشراء بنجاح');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('فشل في إرسال طلب الشراء')
  });
  const supplierOptions = React.useMemo(() => (suppliers?.items || []).map(s => ({ label: s.name, value: s.id })), [suppliers]);
  const productOptions = React.useMemo(() => (products?.items || []).map(p => ({ label: p.name, value: p.id })), [products]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto text-right p-0 border-none" dir="rtl">
        <DialogHeader className="p-6 bg-pharmav-primary text-white rounded-t-lg">
          <DialogTitle className="text-right font-display text-2xl font-bold flex items-center justify-between flex-row-reverse">
            فاتورة مشتريات جديدة
            <Package className="size-6" />
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
              <div className="md:col-span-7 space-y-6">
                <FormField<PurchaseFormValues>
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold">المورد / الشركة</FormLabel>
                      <Autocomplete
                        options={supplierOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="ابحث عن مورد..."
                        isLoading={isLoadingSuppliers}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<PurchaseFormValues>
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold">ملاحظات الفاتورة</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ''}
                            className="h-12 pr-4 pl-12 text-right bg-white border-2 border-transparent focus:border-pharmav-primary"
                            placeholder="أضف أي ملاحظات أو تفاصيل إضافية..."
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-pharmav-primary"
                        >
                          <Camera className="size-5" />
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-3 space-y-6 bg-muted/30 p-4 rounded-2xl border border-dashed">
                <FormField<PurchaseFormValues>
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between flex-row-reverse mb-2">
                        <FormLabel className="text-sm font-bold">رقم فاتورة المورد</FormLabel>
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px] py-0 h-4">يدوي</Badge>
                      </div>
                      <div className="relative">
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} className="h-12 bg-white font-mono text-center pr-10" placeholder="أدخل الرقم..." />
                        </FormControl>
                        <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<PurchaseFormValues>
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold">تاريخ الفاتورة</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ''} className="h-12 text-center bg-white border-2 border-transparent focus:border-pharmav-primary" />
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
                      <FormLabel className="text-sm font-bold">حالة التوريد</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-white text-right">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="text-right">
                          <SelectItem value="pending">قيد الانتظار</SelectItem>
                          <SelectItem value="received">تم الاستلام</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-row-reverse border-b pb-2">
                <span className="font-bold flex items-center gap-2 text-lg">
                  <Package className="size-5 text-pharmav-primary" /> تفاصيل الأصناف
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ productId: '', quantity: 1, costPrice: 0 })}
                  className="h-9 gap-2 border-pharmav-primary text-pharmav-primary hover:bg-pharmav-primary/10"
                >
                  <PlusCircle className="size-4" /> إضافة صنف جديد
                </Button>
              </div>
              <div className="space-y-3">
                {fields.map((fieldItem, index) => (
                  <div key={fieldItem.id} className="grid grid-cols-12 gap-3 items-end bg-card border p-4 rounded-2xl shadow-sm">
                    <div className="col-span-12 lg:col-span-6">
                      <FormField<PurchaseFormValues>
                        control={form.control}
                        name={`items.${index}.productId` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">اسم المنتج</FormLabel>
                            <Autocomplete
                              options={productOptions}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="اختر المنتج..."
                              className="h-10 bg-white"
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-5 lg:col-span-2">
                      <FormField<PurchaseFormValues>
                        control={form.control}
                        name={`items.${index}.quantity` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">الكمية</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value ?? 1}
                                onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseInt(e.target.value))}
                                className="h-10 text-center font-bold bg-white"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-5 lg:col-span-3">
                      <FormField<PurchaseFormValues>
                        control={form.control}
                        name={`items.${index}.costPrice` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">التكلفة</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                value={field.value ?? 0}
                                onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                className="h-10 text-center font-bold bg-white"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2 lg:col-span-1 flex justify-center pb-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className="mt-12 sticky bottom-0 bg-background py-4 border-t">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full h-14 bg-pharmav-primary font-bold text-lg shadow-neon-blue rounded-2xl"
              >
                {mutation.isPending ? 'جاري الحفظ...' : 'تأكيد وحفظ فاتورة المشتريات'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}