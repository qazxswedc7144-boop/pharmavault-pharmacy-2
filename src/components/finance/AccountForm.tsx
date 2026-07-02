import React, { useEffect } from 'react';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
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
type AccountFormValues = z.output<typeof accountSchema>;
interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account;
}
const TYPE_LABELS: Record<AccountType, string> = {
  asset: 'أصول', liability: 'خصوم', equity: 'حقوق ملكية', revenue: 'إيرادات', expense: 'مصاريف'
};
export function AccountForm({ open, onOpenChange, account }: AccountFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema) as Resolver<AccountFormValues>,
    defaultValues: { name: '', code: '', type: 'asset', balance: 0, description: '' }
  });
  const mutation = useMutation({
    mutationFn: (values: AccountFormValues) =>
      account
        ? api<Account>(`/api/accounts/${account.id}`, { method: 'PUT', body: JSON.stringify(values) })
        : api<Account>('/api/accounts', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success(account ? 'تم التحديث بنجاح' : 'تم الإنشاء بنجاح');
      onOpenChange(false);
      form.reset();
    }
  });
  useEffect(() => {
    if (open && account) form.reset(account);
    else if (open) form.reset({ name: '', code: '', type: 'asset', balance: 0, description: '' });
  }, [open, account, form]);
  const onSubmit: SubmitHandler<AccountFormValues> = (v) => mutation.mutate(v);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right" dir="rtl">
        <DialogHeader><DialogTitle className="text-right font-display text-xl font-bold">{account ? 'تعديل الحساب' : 'إضافة حساب جديد'}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField<AccountFormValues> control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>اسم الحساب</FormLabel><FormControl><Input name={field.name} ref={field.ref} onBlur={field.onBlur} value={String(field.value ?? "")} onChange={field.onChange} className="h-12 text-right border-2" /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField<AccountFormValues> control={form.control} name="code" render={({ field }) => (
                <FormItem><FormLabel>كود الحساب</FormLabel><FormControl><Input name={field.name} ref={field.ref} onBlur={field.onBlur} value={String(field.value ?? "")} onChange={field.onChange} className="h-12 font-mono border-2" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField<AccountFormValues> control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>نوع الحساب</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12"><SelectValue /></SelectTrigger></FormControl><SelectContent>{Object.entries(TYPE_LABELS).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
                <FormMessage /></FormItem>
              )} />
            </div>
            <FormField<AccountFormValues> control={form.control} name="balance" render={({ field }) => (
              <FormItem><FormLabel>الرصيد الافتتاحي</FormLabel>
                <FormControl><Input name={field.name} ref={field.ref} onBlur={field.onBlur} type="number" step="0.01" value={String(field.value ?? "0")} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} className="h-12 text-left font-bold text-xl border-2" /></FormControl>
              <FormMessage /></FormItem>
            )} />
            <DialogFooter className="mt-8"><Button type="submit" disabled={mutation.isPending} className="w-full font-bold h-14 bg-pharmav-primary shadow-neon-blue">حفظ البيانات</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}