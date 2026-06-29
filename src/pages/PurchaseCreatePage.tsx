import React, { useMemo, useState } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PurchaseHeader } from '@/components/purchases/PurchaseHeader';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Autocomplete } from '@/components/ui/autocomplete';
import { api } from '@/lib/api-client';
import type { Product, Supplier, PurchaseOrder } from '@shared/types';
import { Trash2, PlusCircle, History, Truck, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { PurchaseAddItemModal } from '@/components/purchases/PurchaseAddItemModal';
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
  date: z.string().min(1, 'تاريخ الفاتورة مطلوب'),
  isCredit: z.boolean().default(false),
  isReturn: z.boolean().default(false)
});
type PurchaseFormValues = z.infer<typeof purchaseSchema>;
export function PurchaseCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      invoiceNumber: '',
      supplierId: '',
      items: [],
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
    const items = formItems || [];
    return items.reduce((sum, item) => {
      return sum + (Number(item.quantity || 0) * Number(item.costPrice || 0));
    }, 0);
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
      toast.success('تم تسجيل فاتورة المشتريات بنجاح');
      navigate('/purchases');
    },
    onError: () => toast.error('فشل في حفظ الفاتورة')
  });
  const supplierOptions = useMemo(() => (suppliersData?.items || []).map(s => ({ label: s.name, value: s.id })), [suppliersData]);
  const getProductName = (id: string) => productsData?.items.find(p => p.id === id)?.name || 'منتج غير معروف';
  const filteredFields = useMemo(() => {
    if (!itemSearch) return fields;
    return fields.filter(field => {
      const name = getProductName(field.productId).toLowerCase();
      return name.includes(itemSearch.toLowerCase());
    });
  }, [fields, itemSearch, productsData]);
  const onSubmit: SubmitHandler<PurchaseFormValues> = (values) => {
    mutation.mutate(values);
  };
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Row 1: Supplier (70%) & Date (30%) */}
            <div className="grid grid-cols-10 gap-4">
              <div className="col-span-10 md:col-span-7">
                <FormField control={form.control} name="supplierId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold flex items-center gap-2">
                      <Truck className="size-4 text-pharmav-primary" /> المورد / الشركة
                    </FormLabel>
                    <Autocomplete 
                      options={supplierOptions} 
                      value={field.value} 
                      onValueChange={field.onChange} 
                      isLoading={isLoadingSuppliers}
                      placeholder="ابحث عن مورد..."
                    />
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="col-span-10 md:col-span-3">
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold flex items-center gap-2">
                      <History className="size-4 text-pharmav-primary" /> تاريخ التوريد
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-12 text-center font-bold border-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
            {/* Row 2: Invoice Number (30%) & Notes (70%) */}
            <div className="grid grid-cols-10 gap-4">
              <div className="col-span-10 md:col-span-3">
                <FormField control={form.control} name="invoiceNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">رقم فاتورة المورد</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="رقم الفاتورة..." className="h-12 font-mono text-center text-lg border-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="col-span-10 md:col-span-7">
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold flex items-center gap-2">
                      <FileText className="size-4 text-pharmav-primary" /> بيان / ملاحظات إضافية
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أدخل أي تفاصيل إضافية عن هذه الفاتورة..." className="h-12 text-right border-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
            {/* Items Table Section */}
            <div className="bg-card border rounded-3xl overflow-hidden shadow-soft">
              <div className="p-6 border-b bg-muted/20 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full md:max-w-md">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="ابحث عن صنف في هذه الفاتورة..." 
                    className="pr-10 h-11 bg-background text-right"
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                  />
                </div>
                <Button type="button" onClick={() => setIsAddItemOpen(true)} className="w-full md:w-auto gap-2 bg-pharmav-primary font-bold px-8 h-11">
                   <PlusCircle className="size-4" /> إضافة صنف
                </Button>
              </div>
              <div className="p-0 overflow-x-auto">
                <Table className="text-right min-w-[800px]">
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-right">المنتج</TableHead>
                      <TableHead className="text-center">الكمية</TableHead>
                      <TableHead className="text-center">سعر التكلفة</TableHead>
                      <TableHead className="text-left">الإجمالي</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFields.map((field, index) => {
                      const realIndex = fields.findIndex(f => f.id === field.id);
                      return (
                        <TableRow key={field.id} className="hover:bg-muted/10">
                          <TableCell className="font-bold">{getProductName(field.productId)}</TableCell>
                          <TableCell className="text-center font-display font-bold">{field.quantity}</TableCell>
                          <TableCell className="text-center">{field.costPrice.toFixed(2)} ر.س</TableCell>
                          <TableCell className="text-left font-bold">{(field.quantity * field.costPrice).toFixed(2)} ر.س</TableCell>
                          <TableCell className="text-left">
                            <Button variant="ghost" size="icon" onClick={() => remove(realIndex)} className="text-destructive">
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {fields.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-20 text-center text-muted-foreground italic">
                          لم يتم إدراج أي أدوية في هذه الفاتورة حتى الآن.
                        </TableCell>
                      </TableRow>
                    )}
                    {fields.length > 0 && filteredFields.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-muted-foreground italic">
                          لا توجد نتائج تطابق البحث في الفاتورة.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="bg-pharmav-primary/10 p-8 rounded-3xl flex justify-between items-center">
               <span className="text-2xl font-bold">إجمالي قيمة الفاتورة:</span>
               <span className="text-4xl font-display font-bold text-pharmav-primary">{totals.toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-end pt-4 pb-12">
              <Button type="submit" disabled={mutation.isPending || fields.length === 0} className="h-16 px-16 bg-pharmav-primary font-bold text-xl rounded-2xl shadow-neon-blue">
                حفظ الفاتورة النهائية
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <PurchaseAddItemModal
        open={isAddItemOpen}
        onOpenChange={setIsAddItemOpen}
        onAdd={(item) => append(item)}
      />
    </AppLayout>
  );
}