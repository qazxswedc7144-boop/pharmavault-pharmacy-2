import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api-client';
import type { Category } from '@shared/types';
import { toast } from 'sonner';
const categorySchema = z.object({
  name: z.string().min(2, 'Category name required'),
  description: z.string().optional()
});
interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}
export function CategoryForm({ open, onOpenChange, category }: CategoryFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '' }
  });
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof categorySchema>) =>
      category
        ? api(`/api/categories/${category.id}`, { method: 'PUT', body: JSON.stringify(values) })
        : api('/api/categories', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category saved');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('Failed to save category')
  });
  React.useEffect(() => {
    if (open && category) form.reset(category);
    else if (open) form.reset({ name: '', description: '' });
  }, [open, category, form]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{category ? 'Edit Category' : 'New Category'}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Category Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter><Button type="submit" disabled={mutation.isPending} className="w-full">Save Category</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}