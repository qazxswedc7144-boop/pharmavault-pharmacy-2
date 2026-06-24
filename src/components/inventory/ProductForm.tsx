import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api-client';
import type { Product, Category, Supplier } from '@shared/types';
import { toast } from 'sonner';
const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  tradeName: z.string().optional(),
  scientificName: z.string().optional(),
  barcode: z.string().optional(),
  sku: z.string().min(2, 'SKU is required'),
  categoryId: z.string().min(1, 'Category is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  price: z.coerce.number().min(0.01, 'Price must be positive'),
  costPrice: z.coerce.number().min(0, 'Cost price is required'),
  taxRate: z.coerce.number().default(0),
  discountRate: z.coerce.number().default(0),
  stockQuantity: z.coerce.number().min(0),
  unit: z.string().min(1, 'Unit is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  minStockLevel: z.coerce.number().min(0),
});
type ProductFormValues = z.infer<typeof productSchema>;
interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}
export function ProductForm({ open, onOpenChange, product }: ProductFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', tradeName: '', scientificName: '', barcode: '',
      sku: '', categoryId: '', supplierId: '',
      price: 0, costPrice: 0, taxRate: 0, discountRate: 0,
      stockQuantity: 0, unit: 'tablet',
      expiryDate: '', batchNumber: '', minStockLevel: 5
    }
  });
  const { data: categories } = useQuery<{ items: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => api<{ items: Category[] }>('/api/categories')
  });
  const { data: suppliers } = useQuery<{ items: Supplier[] }>({
    queryKey: ['suppliers'],
    queryFn: () => api<{ items: Supplier[] }>('/api/suppliers')
  });
  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      product
        ? api(`/api/products/${product.id}`, { method: 'PUT', body: JSON.stringify(values) })
        : api('/api/products', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(product ? 'Product updated' : 'Product created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('Something went wrong')
  });
  React.useEffect(() => {
    if (open) {
      if (product) {
        form.reset({
          name: product.name,
          tradeName: product.tradeName || '',
          scientificName: product.scientificName || '',
          barcode: product.barcode || '',
          sku: product.sku,
          categoryId: product.categoryId,
          supplierId: product.supplierId,
          price: Number(product.price),
          costPrice: Number(product.costPrice),
          taxRate: Number(product.taxRate || 0),
          discountRate: Number(product.discountRate || 0),
          stockQuantity: Number(product.stockQuantity),
          unit: product.unit,
          expiryDate: product.expiryDate,
          batchNumber: product.batchNumber,
          minStockLevel: Number(product.minStockLevel),
        });
      } else {
        form.reset({
          name: '', tradeName: '', scientificName: '', barcode: '',
          sku: '', categoryId: '', supplierId: '',
          price: 0, costPrice: 0, taxRate: 0, discountRate: 0,
          stockQuantity: 0, unit: 'tablet',
          expiryDate: '', batchNumber: '', minStockLevel: 5
        });
      }
    }
  }, [product, open, form]);
  const onSubmit = (values: ProductFormValues) => mutation.mutate(values);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Primary Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="tradeName" render={({ field }) => (
                <FormItem><FormLabel>Trade Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="scientificName" render={({ field }) => (
                <FormItem><FormLabel>Scientific Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="barcode" render={({ field }) => (
                <FormItem><FormLabel>Barcode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="sku" render={({ field }) => (
                <FormItem><FormLabel>SKU</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Dispensing Unit</FormLabel><FormControl><Input placeholder="tablet, vial, etc" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem><FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger></FormControl>
                  <SelectContent>{categories?.items.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="supplierId" render={({ field }) => (
                <FormItem><FormLabel>Default Supplier</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger></FormControl>
                  <SelectContent>{suppliers?.items.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem><FormLabel>Selling Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="costPrice" render={({ field }) => (
                <FormItem><FormLabel>Cost Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="taxRate" render={({ field }) => (
                <FormItem><FormLabel>Tax (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="discountRate" render={({ field }) => (
                <FormItem><FormLabel>Discount (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="stockQuantity" render={({ field }) => (
                <FormItem><FormLabel>Stock Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="minStockLevel" render={({ field }) => (
                <FormItem><FormLabel>Alert Level</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="batchNumber" render={({ field }) => (
                <FormItem><FormLabel>Batch Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="expiryDate" render={({ field }) => (
              <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={mutation.isPending} className="w-full bg-pharmav-primary">
                {product ? 'Update Inventory Item' : 'Register New Medication'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}