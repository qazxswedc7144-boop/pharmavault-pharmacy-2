import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, Tag, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4">
          <AnimatePresence initial={false}>
            {items.map(item => {
              const product = products.find(p => p.id === item.productId);
              const discountPercent = ((item.discountAmount / item.unitPrice) * 100).toFixed(0);
              return (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="group flex items-center gap-4 p-3 rounded-2xl border bg-muted/10 hover:bg-muted/30 transition-colors flex-row-reverse"
                >
                  <div className="flex-1 text-right">
                    <div className="font-bold text-sm leading-tight line-clamp-1">
                      {product?.name || 'منتج غير معروف'}
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {item.unitPrice.toFixed(2)} ر.س / للوحدة
                      </span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="flex items-center gap-1 text-[9px] font-bold text-pharmav-primary hover:underline">
                            <Tag className="size-2" />
                            {item.discountAmount > 0 ? `خصم ${discountPercent}%` : 'أضف خصم'}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-3" align="end">
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
                  </div>
                  <div className="flex items-center gap-2 bg-background border rounded-xl p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg hover:bg-green-50 hover:text-green-600"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <div className="text-sm font-bold font-display">{item.subtotal.toFixed(2)}</div>
                    <div className="text-[9px] text-muted-foreground uppercase">ر.س</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-600"
                    onClick={() => onUpdateQuantity(item.productId, 0)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
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
        </div>
      </ScrollArea>
    </div>
  );
}