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
  name: z.string().min(2, 'Company name required'),
  contactPerson: z.string().min(2, 'Contact person required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(5, 'Phone required'),
  address: z.string().min(5, 'Address required')
});
interface SupplierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier;
}
export function SupplierForm({ open, onOpenChange, supplier }: SupplierFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: '', contactPerson: '', email: '', phone: '', address: '' }
  });
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof supplierSchema>) =>
      supplier
        ? api(`/api/suppliers/${supplier.id}`, { method: 'PUT', body: JSON.stringify(values) })
        : api('/api/suppliers', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier profile saved');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('Failed to save supplier')
  });
  React.useEffect(() => {
    if (open && supplier) form.reset(supplier);
    else if (open) form.reset({ name: '', contactPerson: '', email: '', phone: '', address: '' });
  }, [open, supplier, form]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{supplier ? 'Edit Supplier' : 'New Supplier'}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="contactPerson" render={({ field }) => (
              <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter><Button type="submit" disabled={mutation.isPending} className="w-full">Save Supplier</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}