import React from 'react';
import { useForm } from 'react-hook-form';
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
  accountId: z.string().min(1, 'تصنيف المصروف مطلوب'),
  paymentAccountId: z.string().min(1, 'حساب الدفع مطلوب'),
  amount: z.coerce.number().min(0.01, 'يجب أن يكون المبلغ أكبر من صفر'),
  category: z.string().min(1, 'الوسم مطلوب'),
  description: z.string().min(3, 'الوصف مطلوب'),
  status: z.enum(['paid', 'pending']),
  date: z.string()
});
type ExpenseFormValues = z.infer<typeof expenseSchema>;
interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
}
export function ExpenseForm({ open, onOpenChange, expense }: ExpenseFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { status: 'paid', amount: 0, date: new Date().toISOString().split('T')[0], category: '', description: '', accountId: '', paymentAccountId: '' }
  });
  const { data: accounts } = useQuery<{ items: Account[] }>({
    queryKey: ['accounts'],
    queryFn: () => api<{ items: Account[] }>('/api/accounts')
  });
  const mutation = useMutation({
    mutationFn: (values: ExpenseFormValues) =>
      expense
        ? api<Expense>(`/api/expenses/${expense.id}`, { method: 'PUT', body: JSON.stringify(values) })
        : api<Expense>('/api/expenses', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('تم تسجيل المصروف بنجاح');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('فشل في تسجيل المصروف')
  });
  React.useEffect(() => {
    if (open && expense) {
      form.reset({
        accountId: expense.accountId,
        paymentAccountId: expense.paymentAccountId,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        status: expense.status,
        date: new Date(expense.date).toISOString().split('T')[0]
      });
    } else if (open) {
      form.reset({ status: 'paid', amount: 0, date: new Date().toISOString().split('T')[0], category: '', description: '', accountId: '', paymentAccountId: '' });
    }
  }, [open, expense, form]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right" dir="rtl">
        <DialogHeader><DialogTitle className="text-right font-display">تسجيل مصروفات الصيدلية</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField<ExpenseFormValues, 'accountId'> control={form.control} name="accountId" render={({ field }) => (
                <FormItem><FormLabel>تصنيف المصروف</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="text-right"><SelectValue placeholder="اختر التصنيف" /></SelectTrigger></FormControl>
                  <SelectContent className="text-right">
                    {accounts?.items.filter(a => a.type === 'expense').map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
              )} />
              <FormField<ExpenseFormValues, 'paymentAccountId'> control={form.control} name="paymentAccountId" render={({ field }) => (
                <FormItem><FormLabel>حساب الدفع</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="text-right"><SelectValue placeholder="اختر المصدر" /></SelectTrigger></FormControl>
                  <SelectContent className="text-right">
                    {accounts?.items.filter(a => a.type === 'asset').map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField<ExpenseFormValues, 'amount'> control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>المبلغ</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField<ExpenseFormValues, 'status'> control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>الحالة</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="text-right"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent className="text-right">
                    <SelectItem value="paid">تم الدفع</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
              )} />
            </div>
            <FormField<ExpenseFormValues, 'description'> control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>الوصف</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField<ExpenseFormValues, 'category'> control={form.control} name="category" render={({ field }) => (
              <FormItem><FormLabel>الوسم (إيجار، رواتب، إلخ)</FormLabel><FormControl><Input placeholder="مثال: فاتورة كهرباء" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter className="mt-6"><Button type="submit" disabled={mutation.isPending} className="w-full bg-pharmav-primary font-bold">تسجيل العملية</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}