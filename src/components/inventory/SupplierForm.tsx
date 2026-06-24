import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import type { Supplier } from '@shared/types';
import { toast } from 'sonner';
const supplierSchema = z.object({
  name: z.string().min(2, 'اسم الشركة مطلوب'),
  contactPerson: z.string().min(2, 'مسؤول التواصل مطلوب'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  phone: z.string().min(5, 'رقم الهاتف مطلوب'),
  address: z.string().min(5, 'العنوان مطلوب')
});
type SupplierFormValues = z.infer<typeof supplierSchema>;
interface SupplierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier;
}
export function SupplierForm({ open, onOpenChange, supplier }: SupplierFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: '', contactPerson: '', email: '', phone: '', address: '' }
  });
  const mutation = useMutation({
    mutationFn: (values: SupplierFormValues) =>
      supplier
        ? api(`/api/suppliers/${supplier.id}`, { method: 'PUT', body: JSON.stringify(values) })
        : api('/api/suppliers', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('تم حفظ بيانات المورد بنجاح');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('فشل في حفظ بيانات المورد')
  });
  React.useEffect(() => {
    if (open && supplier) form.reset(supplier);
    else if (open) form.reset({ name: '', contactPerson: '', email: '', phone: '', address: '' });
  }, [open, supplier, form]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right" dir="rtl">
        <DialogHeader><DialogTitle className="text-right font-display">{supplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>اسم الشركة/المورد</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="contactPerson" render={({ field }) => (
              <FormItem><FormLabel>مسؤول التواصل</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>البريد الإلكتروني</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>رقم الهاتف</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem><FormLabel>العنوان</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter className="mt-6"><Button type="submit" disabled={mutation.isPending} className="w-full bg-pharmav-primary font-bold">حفظ المورد</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}