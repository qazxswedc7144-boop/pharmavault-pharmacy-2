import React, { useEffect } from 'react';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import type { Expense, Account } from '@shared/types';
import { toast } from 'sonner';
const expenseSchema = z.object({
  accountId: z.string().min(1, 'يجب اختيار تصنيف المصروف'),
  paymentAccountId: z.string().min(1, 'يجب اختيار حساب الدفع'),
  amount: z.coerce.number().min(0.01, 'المبلغ مطلوب').default(0),
  category: z.string().min(1, 'النوع مطلوب'),
  description: z.string().min(3, 'الوصف مطلوب'),
  status: z.enum(['paid', 'pending'] as const),
  date: z.string().min(1, 'التاريخ مطلوب')
});
type ExpenseFormValues = z.output<typeof expenseSchema>;
export interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
}
export function ExpenseForm({ open, onOpenChange, expense }: ExpenseFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as Resolver<ExpenseFormValues>,
    defaultValues: { status: 'paid', amount: 0, date: new Date().toISOString().split('T')[0], category: '', description: '', accountId: '', paymentAccountId: '' }
  });
  const { data: accountsData } = useQuery<{ items: Account[] }>({
    queryKey: ['accounts'],
    queryFn: () => api<{ items: Account[] }>('/api/accounts')
  });
  const mutation = useMutation({
    mutationFn: (values: ExpenseFormValues) => {
      const payload = { ...values, date: new Date(values.date).getTime() };
      return expense ? api(`/api/expenses/${expense.id}`, { method: 'PUT', body: JSON.stringify(payload) }) : api('/api/expenses', { method: 'POST', body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('تم التسجيل بنجاح');
      onOpenChange(false);
      form.reset();
    }
  });
  useEffect(() => {
    if (open && expense) form.reset({ ...expense, date: new Date(expense.date).toISOString().split('T')[0] });
    else if (open) form.reset({ status: 'paid', amount: 0, date: new Date().toISOString().split('T')[0], category: '', description: '', accountId: '', paymentAccountId: '' });
  }, [open, expense, form]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right max-w-lg" dir="rtl">
        <DialogHeader><DialogTitle className="text-right font-display text-xl font-bold">تسجيل مصروف</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField<ExpenseFormValues>
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تصنيف المصروف</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-12"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{accountsData?.items.filter(a => a.type === 'expense').map(a => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField<ExpenseFormValues>
                control={form.control}
                name="paymentAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حساب الدفع</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-12"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{accountsData?.items.filter(a => a.type === 'asset').map(a => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <FormField<ExpenseFormValues>
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      value={String(field.value ?? "")}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      className="h-12 text-left font-bold border-2"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField<ExpenseFormValues>
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={String(field.value ?? "")}
                      className="h-12 text-right border-2"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField<ExpenseFormValues>
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القسم</FormLabel>
                    <FormControl><Input {...field} value={String(field.value ?? "")} className="h-12 text-right border-2" /></FormControl>
                  </FormItem>
                )}
              />
              <FormField<ExpenseFormValues>
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التاريخ</FormLabel>
                    <FormControl><Input type="date" {...field} value={String(field.value ?? "")} className="h-12 text-center border-2 font-bold" /></FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-8">
              <Button type="submit" disabled={mutation.isPending} className="w-full h-14 bg-pharmav-primary">تسجيل العملية</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}