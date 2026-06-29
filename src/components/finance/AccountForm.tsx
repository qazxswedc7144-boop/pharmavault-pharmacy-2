import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import type { Account, AccountType } from '@shared/types';
import { toast } from 'sonner';
const accountSchema = z.object({
  name: z.string().min(2, 'اسم الحساب مطلوب'),
  code: z.string().min(1, 'كود الحساب مطلوب'),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense'] as const),
  balance: z.coerce.number().min(0, 'يجب إدخال رقم صحيح').default(0),
  description: z.string().default(''),
});
type AccountFormValues = z.infer<typeof accountSchema>;
interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account;
}
const TYPE_LABELS: Record<AccountType, string> = {
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
    defaultValues: {
      name: '',
      code: '',
      type: 'asset',
      balance: 0,
      description: ''
    }
  });
  const mutation = useMutation({
    mutationFn: (values: AccountFormValues) =>
      account
        ? api<Account>(`/api/accounts/${account.id}`, { method: 'PUT', body: JSON.stringify(values) })
        : api<Account>('/api/accounts', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success(account ? 'تم تحديث الحساب المالي بنجاح' : 'تم إنشاء الحساب المالي الجديد');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('فشل في حفظ بيانات الحساب')
  });
  useEffect(() => {
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
        form.reset({
          name: '',
          code: '',
          type: 'asset',
          balance: 0,
          description: ''
        });
      }
    }
  }, [open, account, form]);
  const onSubmit: SubmitHandler<AccountFormValues> = (values) => {
    mutation.mutate(values);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right font-display text-xl font-bold">
            {account ? 'تعديل الحساب المالي' : 'إضافة حساب مالي جديد'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>اسم الحساب</FormLabel>
                <FormControl><Input {...field} className="h-12 text-right border-2" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>كود الحساب</FormLabel>
                  <FormControl><Input {...field} className="h-12 text-right font-mono border-2" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الحساب</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="h-12 text-right border-2"><SelectValue placeholder="اختر النوع" /></SelectTrigger></FormControl>
                    <SelectContent className="text-right font-sans">
                      {(Object.entries(TYPE_LABELS) as [AccountType, string][]).map(([val, label]) => (
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
                <FormLabel>الرصيد المفتوح (ر.س)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className="h-12 text-left font-bold text-xl border-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>البيان / ملاحظات</FormLabel>
                <FormControl><Input {...field} className="h-12 text-right border-2" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="mt-8">
              <Button type="submit" disabled={mutation.isPending} className="w-full font-bold h-14 text-lg bg-pharmav-primary shadow-neon-blue">
                {mutation.isPending ? "جاري الحفظ..." : "حفظ بيانات الحساب المالي"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}