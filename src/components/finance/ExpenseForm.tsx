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
  accountId: z.string().min(1, 'Category required'),
  paymentAccountId: z.string().min(1, 'Source account required'),
  amount: z.coerce.number().min(0.01, 'Amount must be positive'),
  category: z.string().min(1, 'Tag required'),
  description: z.string().min(3, 'Description required'),
  status: z.enum(['paid', 'pending']),
  date: z.string().default(() => new Date().toISOString().split('T')[0])
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
    defaultValues: { status: 'paid', amount: 0, date: new Date().toISOString().split('T')[0] }
  });
  const { data: accounts } = useQuery<{ items: Account[] }>({
    queryKey: ['accounts'],
    queryFn: () => api<{ items: Account[] }>('/api/accounts')
  });
  const mutation = useMutation({
    mutationFn: (values: ExpenseFormValues) =>
      expense
        ? api(`/api/expenses/${expense.id}`, { method: 'PUT', body: JSON.stringify(values) })
        : api('/api/expenses', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Expense recorded');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('Failed to log expense')
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
    }
  }, [open, expense, form]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Log Pharmacy Expense</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="accountId" render={({ field }) => (
                <FormItem><FormLabel>Expense Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {accounts?.items.filter(a => a.type === 'expense').map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="paymentAccountId" render={({ field }) => (
                <FormItem><FormLabel>Source Account</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select Source" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {accounts?.items.filter(a => a.type === 'asset').map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem><FormLabel>Category/Tag</FormLabel><FormControl><Input placeholder="Rent, Utilities, Salary..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter><Button type="submit" disabled={mutation.isPending} className="w-full">Log Expense</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}