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
import type { Account, AccountType } from '@shared/types';
import { toast } from 'sonner';
const accountSchema = z.object({
  name: z.string().min(2, 'Account name required'),
  code: z.string().min(1, 'Account code required'),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  balance: z.coerce.number().default(0),
  description: z.string().optional()
});
type AccountFormValues = z.infer<typeof accountSchema>;
interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account;
}
export function AccountForm({ open, onOpenChange, account }: AccountFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: '', code: '', type: 'asset', balance: 0, description: '' }
  });
  const mutation = useMutation({
    mutationFn: (values: AccountFormValues) =>
      account
        ? api(`/api/accounts/${account.id}`, { method: 'PUT', body: JSON.stringify(values) })
        : api('/api/accounts', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success(account ? 'Account updated' : 'Account created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('Failed to save account')
  });
  React.useEffect(() => {
    if (open && account) {
      form.reset({
        name: account.name,
        code: account.code,
        type: account.type,
        balance: account.balance,
        description: account.description || ''
      });
    } else if (open) {
      form.reset({ name: '', code: '', type: 'asset', balance: 0, description: '' });
    }
  }, [open, account, form]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{account ? 'Edit Account' : 'New Account'}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Account Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem><FormLabel>Account Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>Account Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {['asset', 'liability', 'equity', 'revenue', 'expense'].map(t => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="balance" render={({ field }) => (
              <FormItem><FormLabel>Initial Balance</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter><Button type="submit" disabled={mutation.isPending} className="w-full">Save Account</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}