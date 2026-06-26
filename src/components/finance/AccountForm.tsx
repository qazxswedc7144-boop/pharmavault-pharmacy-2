import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import type { Account } from '@shared/types';
import { toast } from 'sonner';
const accountSchema = z.object({
  name: z.string().min(2, 'اسم الحساب مطلوب'),
  code: z.string().min(1, 'كود الحساب مطلوب'),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  balance: z.coerce.number().min(0, 'يجب إدخال رقم صحيح'),
  description: z.string().default('')
});
type AccountFormValues = z.infer<typeof accountSchema>;
interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account;
}
const TYPE_LABELS: Record<string, string> = {
  asset: 'أصول',
  liability: 'خصوم',
  equity: 'حقوق ملكية',
  revenue: 'إيرادات',
  expense: 'مصاريف'
};
export function AccountForm({ open, onOpenChange, account }: AccountFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: '', code: '', type: 'asset', balance: 0, description: '' }
  });
  const mutation = useMutation({
    mutationFn: (values: AccountFormValues) =>
      account
        ? api<Account>(`/api/accounts/${account.id}`, { method: 'PUT', body: JSON.stringify(values) })
        : api<Account>('/api/accounts', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success(account ? 'تم تحديث الحساب بنجاح' : 'تم إنشاء الحساب بنجاح');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('حدث خطأ أثناء حفظ بيانات الحساب')
  });
  React.useEffect(() => {
    if (open) {
      if (account) {
        form.reset({
          name: account.name,
          code: account.code,
          type: account.type,
          balance: account.balance,
          description: account.description || ''
        });
      } else {
        form.reset({ name: '', code: '', type: 'asset', balance: 0, description: '' });
      }
    }
  }, [open, account, form]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right font-display text-xl font-bold">
            {account ? 'تعديل الحساب المالي' : 'إضافة حساب مالي جديد'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-5">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>اسم الحساب</FormLabel>
                <FormControl><Input {...field} className="h-12 text-right" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>كود الحساب</FormLabel>
                  <FormControl><Input {...field} className="h-12 text-right font-mono" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الحساب</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="h-12 text-right"><SelectValue placeholder="اختر النوع" /></SelectTrigger></FormControl>
                    <SelectContent className="text-right">
                      {Object.entries(TYPE_LABELS).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="balance" render={({ field }) => (
              <FormItem>
                <FormLabel>الرصيد الافتتاحي (ر.س)</FormLabel>
                <FormControl><Input type="number" {...field} className="h-12 text-left font-bold" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>ملاحظات إضافية</FormLabel>
                <FormControl><Input {...field} className="h-12 text-right" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="mt-8">
              <Button type="submit" disabled={mutation.isPending} className="w-full font-bold h-14 text-lg bg-pharmav-primary shadow-neon-blue">
                حفظ بيانات الحساب المالي
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}