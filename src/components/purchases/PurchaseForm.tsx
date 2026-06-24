import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import type { Product, Supplier, PurchaseOrder } from '@shared/types';
import { Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
const purchaseSchema = z.object({
  supplierId: z.string().min(1, 'Supplier required'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product required'),
    quantity: z.coerce.number().min(1),
    costPrice: z.coerce.number().min(0)
  })).min(1, 'Add at least one item'),
  status: z.enum(['pending', 'received', 'cancelled']).default('pending')
});
type PurchaseFormValues = z.infer<typeof purchaseSchema>;
interface PurchaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function PurchaseForm({ open, onOpenChange }: PurchaseFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { supplierId: '', status: 'pending', items: [{ productId: '', quantity: 1, costPrice: 0 }] }
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });
  const { data: products } = useQuery<{ items: Product[] }>({ queryKey: ['products'], queryFn: () => api<{ items: Product[] }>('/api/products') });
  const { data: suppliers } = useQuery<{ items: Supplier[] }>({ queryKey: ['suppliers'], queryFn: () => api<{ items: Supplier[] }>('/api/suppliers') });
  const mutation = useMutation({
    mutationFn: (values: PurchaseFormValues) => {
      const total = values.items.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0);
      return api('/api/purchases', { method: 'POST', body: JSON.stringify({ ...values, totalCost: total }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Purchase order created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('Failed to create order')
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="supplierId" render={({ field }) => (
                <FormItem><FormLabel>Supplier</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger></FormControl>
                  <SelectContent>{suppliers?.items.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Order Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="received">Received (Stock Updated)</SelectItem>
                  </SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold uppercase">Order Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1, costPrice: 0 })}>
                  <PlusCircle className="size-4 mr-2" /> Add Item
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end bg-muted/20 p-2 rounded-lg">
                  <div className="col-span-6">
                    <FormField control={form.control} name={`items.${index}.productId`} render={({ field }) => (
                      <FormItem><FormLabel className="sr-only">Product</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger></FormControl>
                        <SelectContent>{products?.items.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                      </Select></FormItem>
                    )} />
                  </div>
                  <div className="col-span-2">
                    <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                      <FormItem><FormLabel className="sr-only">Qty</FormLabel><FormControl><Input type="number" {...field} placeholder="Qty" /></FormControl></FormItem>
                    )} />
                  </div>
                  <div className="col-span-3">
                    <FormField control={form.control} name={`items.${index}.costPrice`} render={({ field }) => (
                      <FormItem><FormLabel className="sr-only">Cost</FormLabel><FormControl><Input type="number" step="0.01" {...field} placeholder="Cost" /></FormControl></FormItem>
                    )} />
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}><Trash2 className="size-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter><Button type="submit" disabled={mutation.isPending} className="w-full">Create Order</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}