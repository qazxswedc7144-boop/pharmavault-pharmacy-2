import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, Tag, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { SaleItem, Product } from '@shared/types';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
interface PosCartProps {
  items: SaleItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onUpdateDiscount: (id: string, discount: number) => void;
  isReturn: boolean;
}
export function PosCart({ items, onUpdateQuantity, onUpdateDiscount, isReturn }: PosCartProps) {
  const { data: productsData } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api<{ items: Product[] }>('/api/products')
  });
  const products = productsData?.items ?? [];
  return (
    <div className="flex-1 flex flex-col bg-card border rounded-3xl shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between flex-row-reverse">
        <h2 className="flex items-center gap-2 font-display font-bold text-lg">
          <ShoppingCart className={`size-5 ${isReturn ? 'text-rose-500' : 'text-pharmav-primary'}`} />
          سلة المشتريات
        </h2>
        <Badge variant="secondary" className="rounded-full px-3">{items.length} أصناف</Badge>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Table dir="rtl" className="text-right">
          <TableHeader className="bg-muted/20 sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-[55%] text-right font-bold py-3 px-4">اسم الصنف</TableHead>
              <TableHead className="w-[15%] text-center font-bold">الكمية</TableHead>
              <TableHead className="w-[15%] text-center font-bold">السعر</TableHead>
              <TableHead className="w-[15%] text-left font-bold px-4">الإجمالي</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <ScrollArea className="flex-1">
          <Table dir="rtl" className="text-right">
            <TableBody>
              <AnimatePresence initial={false}>
                {items.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  const discountPercent = ((item.discountAmount / item.unitPrice) * 100).toFixed(0);
                  return (
                    <motion.tr
                      key={item.productId}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group border-b hover:bg-muted/10 transition-colors"
                    >
                      <TableCell className="w-[55%] py-4 px-4">
                        <div className="flex flex-col text-right">
                          <span className="font-bold text-sm leading-tight line-clamp-1">
                            {product?.name || 'منتج غير معروف'}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            {product?.sku || item.productId.slice(0,8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="w-[15%]">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 h-6 w-6 rounded-md hover:bg-white"
                              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 h-6 w-6 rounded-md hover:bg-white"
                              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-[15%]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-medium">{item.unitPrice.toFixed(2)}</span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="flex items-center gap-0.5 text-[9px] font-bold text-pharmav-primary hover:underline">
                                <Tag className="size-2" />
                                {item.discountAmount > 0 ? `-${discountPercent}%` : 'خصم'}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-3" align="center">
                              <div className="space-y-2 text-right">
                                <label className="text-[10px] font-bold">نسبة الخصم للصنف (%)</label>
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    className="h-8 text-center text-xs"
                                    placeholder="0"
                                    defaultValue={discountPercent}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      onUpdateDiscount(item.productId, (val / 100) * item.unitPrice);
                                    }}
                                  />
                                  <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                                    <Percent className="size-3" />
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </TableCell>
                      <TableCell className="w-[15%] px-4">
                        <div className="flex items-center justify-between gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-600 hover:bg-rose-50 rounded-full shrink-0"
                            onClick={() => onUpdateQuantity(item.productId, 0)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                          <div className="text-left flex-1">
                            <div className="text-sm font-bold font-display">{item.subtotal.toFixed(2)}</div>
                          </div>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
          {items.length === 0 && (
            <div className="py-20 text-center text-muted-foreground space-y-4">
              <div className="size-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                <ShoppingCart className="size-8 opacity-20" />
              </div>
              <div>
                <p className="text-lg font-display font-bold">السلة فارغة حالياً</p>
                <p className="text-sm opacity-70">اختر أدوية من القائمة للمتابعة</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}