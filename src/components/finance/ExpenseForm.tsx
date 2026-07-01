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
  amount: z.coerce.number().min(0.01, 'المبلغ يجب أن يكون أكبر من صفر').default(0),
  category: z.string().min(1, 'الوسم/النوع مطلوب'),
  description: z.string().min(3, 'يرجى كتابة وصف بسيط للمصروف'),
  status: z.enum(['paid', 'pending'] as const),
  date: z.string().min(1, 'تاريخ المصروف مطلوب')
});
type ExpenseFormValues = z.output<typeof expenseSchema>;
interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
}
export function ExpenseForm({ open, onOpenChange, expense }: ExpenseFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as Resolver<ExpenseFormValues>,
    defaultValues: {
      status: 'paid',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      accountId: '',
      paymentAccountId: ''
    }
  });
  const { data: accountsData } = useQuery<{ items: Account[] }>({
    queryKey: ['accounts'],
    queryFn: () => api<{ items: Account[] }>('/api/accounts')
  });
  const mutation = useMutation({
    mutationFn: (values: ExpenseFormValues) => {
      const payload = { ...values, date: new Date(values.date).getTime() };
      return expense
        ? api<Expense>(`/api/expenses/${expense.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : api<Expense>('/api/expenses', { method: 'POST', body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['report-data'] });
      toast.success('تم تسجيل المصروف وتحديث أرصدة الحسابات بنجاح');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('حدث خطأ أثناء معالجة تسجيل المصروف')
  });
  useEffect(() => {
    if (open) {
      if (expense) {
        form.reset({
          accountId: expense.accountId,
          paymentAccountId: expense.paymentAccountId,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          status: expense.status,
          date: new Date(expense.date).toISOString().split('T')[0]
        });
      } else {
        form.reset({
          status: 'paid',
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          category: '',
          description: '',
          accountId: '',
          paymentAccountId: ''
        });
      }
    }
  }, [open, expense, form]);
  const onSubmit: SubmitHandler<ExpenseFormValues> = (values) => {
    mutation.mutate(values);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right font-display text-xl font-bold">تسجيل مصروفات الصيدلية</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField<ExpenseFormValues>
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تصنيف المصروف</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-right border-2">
                          <SelectValue placeholder="اختر التصنيف" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="text-right font-sans">
                        {accountsData?.items.filter(a => a.type === 'expense').map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<ExpenseFormValues>
                control={form.control}
                name="paymentAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حساب الدفع (المصدر)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-right border-2">
                          <SelectValue placeholder="اختر الحساب" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="text-right font-sans">
                        {accountsData?.items.filter(a => a.type === 'asset').map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField<ExpenseFormValues>
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ المصروف (ر.س)</FormLabel>
                    <FormControl>
                      <Input
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        type="number"
                        step="0.01"
                        value={String(field.value ?? "")}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="h-12 text-left font-bold text-red-600 text-xl border-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<ExpenseFormValues>
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حالة السداد</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-right border-2">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="text-right font-sans">
                        <SelectItem value="paid">تم السداد بالكامل</SelectItem>
                        <SelectItem value="pending">قيد الانتظار / معلق</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField<ExpenseFormValues>
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>بيان المصروف (الوصف)</FormLabel>
                  <FormControl>
                    <Input
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={String(field.value ?? "")}
                      onChange={field.onChange}
                      className="h-12 text-right border-2"
                      placeholder="مثلاً: سداد إيجار الشهر..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField<ExpenseFormValues>
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوسم / القسم</FormLabel>
                  <FormControl>
                    <Input
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={String(field.value ?? "")}
                      onChange={field.onChange}
                      className="h-12 text-right border-2"
                      placeholder="إيجار، فواتير..."
                    />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<ExpenseFormValues>
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ العملية</FormLabel>
                  <FormControl>
                    <Input
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      type="date"
                      value={String(field.value ?? "")}
                      onChange={field.onChange}
                      className="h-12 text-center border-2 font-bold"
                    />
                  </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-8">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full h-14 bg-pharmav-primary font-bold text-lg shadow-glow"
              >
                {mutation.isPending ? "جاري المعالجة..." : "تسجيل العملية المالية"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}