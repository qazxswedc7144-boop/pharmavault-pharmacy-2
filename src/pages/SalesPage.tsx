import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/offline-store';
import type { Product, SaleItem, Transaction } from '@shared/types';
import { toast } from 'sonner';
export function SalesPage() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [discountPercent, setDiscountPercent] = useState(0);
  const isOnline = useAppStore(s => s.isOnline);
  const addToOfflineQueue = useAppStore(s => s.addToOfflineQueue);
  const queryClient = useQueryClient();
  const { data: productsData, isLoading } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api<{ items: Product[] }>('/api/products')
  });
  const products = useMemo(() => productsData?.items ?? [], [productsData]);
  const filteredProducts = useMemo(() => {
    if (!search) return products;
    const s = search.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.sku.toLowerCase().includes(s) ||
      p.barcode?.includes(s)
    );
  }, [products, search]);
  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      toast.error('الدواء غير متوفر في المخزون حالياً');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      const tax = product.price * (product.taxRate / 100);
      const discount = product.price * (product.discountRate / 100);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * (item.unitPrice + tax - discount)
              }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        quantity: 1,
        unitPrice: product.price,
        taxAmount: tax,
        discountAmount: discount,
        subtotal: product.price + tax - discount
      }];
    });
  };
  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return {
          ...item,
          quantity: newQty,
          subtotal: newQty * (item.unitPrice + item.taxAmount - item.discountAmount)
        };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };
  const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const totalTax = cart.reduce((acc, item) => acc + (item.taxAmount * item.quantity), 0);
  const productDiscounts = cart.reduce((acc, item) => acc + (item.discountAmount * item.quantity), 0);
  const cartDiscount = (subtotal + totalTax - productDiscounts) * (discountPercent / 100);
  const total = subtotal + totalTax - productDiscounts - cartDiscount;
  const saleMutation = useMutation({
    mutationFn: (transaction: Transaction) =>
      api('/api/transactions', { method: 'POST', body: JSON.stringify(transaction) }),
    onSuccess: () => {
      toast.success('تمت عملية البيع بنجاح');
      setCart([]);
      setDiscountPercent(0);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => toast.error('خطأ في الخادم. فشلت العملية.')
  });
  const handleProcessSale = async () => {
    if (cart.length === 0) return;
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      userId: 'u1',
      items: cart,
      subtotal: subtotal,
      taxTotal: totalTax,
      discountTotal: productDiscounts + cartDiscount,
      totalAmount: total,
      paymentMethod,
      status: 'completed',
      timestamp: Date.now()
    };
    if (!isOnline) {
      addToOfflineQueue(transaction);
      toast.info('تم حفظ العملية محلياً (وضع عدم الاتصال)');
      setCart([]);
      setDiscountPercent(0);
    } else {
      saleMutation.mutate(transaction);
    }
  };
  return (
    <AppLayout container contentClassName="max-w-full lg:px-8">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]" dir="rtl">
        {/* Cart Area (Left in Arabic Layout) */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4 order-2 lg:order-1">
          <Card className="flex-1 flex flex-col glass-card border-none shadow-glow overflow-hidden">
            <CardHeader className="border-b pb-4 text-right">
              <CardTitle className="flex items-center justify-end gap-2">
                <span>سلة المبيعات</span>
                <ShoppingCart className="size-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 px-4">
                <div className="py-4 space-y-4">
                  <AnimatePresence initial={false}>
                    {cart.map(item => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <motion.div
                          key={item.productId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-3 flex-row-reverse"
                        >
                          <div className="flex-1 text-right">
                            <div className="text-sm font-bold line-clamp-1">{product?.name}</div>
                            <div className="text-[10px] text-muted-foreground">السعر: {item.unitPrice.toFixed(2)} ر.س</div>
                          </div>
                          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                            <Button variant="ghost" size="icon" className="size-6" onClick={() => updateQuantity(item.productId, -1)}><Minus className="size-3" /></Button>
                            <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="size-6" onClick={() => addToCart(product!)}><Plus className="size-3" /></Button>
                          </div>
                          <div className="text-sm font-bold w-20 text-left">{item.subtotal.toFixed(2)} ر.س</div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {cart.length === 0 && (
                    <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <ShoppingCart className="size-8 opacity-20" />
                      <p className="text-sm">سلة المبيعات فارغة</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 bg-muted/30 border-t space-y-3">
                <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                  <Input
                    type="number"
                    placeholder="خصم إضافي %"
                    className="h-9 text-xs text-right"
                    value={discountPercent || ''}
                    onChange={e => setDiscountPercent(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1 text-xs text-muted-foreground text-right" dir="rtl">
                  <div className="flex justify-between"><span>المجموع الفرعي:</span><span>{subtotal.toFixed(2)} ر.س</span></div>
                  <div className="flex justify-between"><span>الضريبة:</span><span>+{totalTax.toFixed(2)} ر.س</span></div>
                  <div className="flex justify-between text-red-500"><span>الخصومات:</span><span>-{(productDiscounts + cartDiscount).toFixed(2)} ر.س</span></div>
                </div>
                <div className="flex items-center justify-between text-2xl font-display font-bold border-t pt-2 flex-row-reverse">
                  <span>الإجمالي:</span>
                  <span className="text-pharmav-primary">{total.toFixed(2)} ر.س</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2">
                  {(['cash', 'card', 'transfer'] as const).map(method => (
                    <Button
                      key={method}
                      variant={paymentMethod === method ? 'default' : 'outline'}
                      className="flex-col h-14 gap-1 p-0 bg-pharmav-primary/5 hover:bg-pharmav-primary/10 border-transparent text-foreground data-[state=active]:bg-pharmav-primary"
                      onClick={() => setPaymentMethod(method)}
                      data-state={paymentMethod === method ? 'active' : ''}
                    >
                      {method === 'cash' ? <Banknote className="size-3" /> : method === 'card' ? <CreditCard className="size-3" /> : <Receipt className="size-3" />}
                      <span className="text-[10px] capitalize">{method === 'cash' ? 'نقدي' : method === 'card' ? 'بطاقة' : 'تحويل'}</span>
                    </Button>
                  ))}
                </div>
                <Button
                  className="w-full h-14 text-lg font-bold shadow-neon-blue bg-pharmav-primary"
                  disabled={cart.length === 0 || saleMutation.isPending}
                  onClick={handleProcessSale}
                >
                  تأكيد البيع وطباعة الفاتورة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Product Grid (Right in Arabic Layout) */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden order-1 lg:order-2">
          <div className="flex items-center gap-4 flex-row-reverse">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="ابحث عن دواء أو امسح الباركود..."
                className="pr-10 h-12 text-lg glass-card text-right"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {!isOnline && (
              <Badge variant="outline" className="h-12 px-4 gap-2 text-orange-500 border-orange-500/50 bg-orange-500/5 flex-row-reverse">
                <AlertCircle className="size-4" /> وضع عدم الاتصال
              </Badge>
            )}
          </div>
          <ScrollArea className="flex-1 rounded-2xl border bg-card/50">
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
                ))
              ) : filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="flex flex-col items-end p-4 bg-card border rounded-xl hover:border-pharmav-primary/40 hover:shadow-soft transition-all text-right group"
                >
                  <div className="w-full flex justify-between items-start mb-2 flex-row-reverse">
                    <Badge variant="outline" className="text-[10px] opacity-70">{product.sku}</Badge>
                    {product.taxRate > 0 && <Badge variant="secondary" className="text-[10px]">ضريبة {product.taxRate}%</Badge>}
                  </div>
                  <span className="font-bold text-sm line-clamp-2 mb-1 group-hover:text-pharmav-primary font-display">{product.name}</span>
                  <span className="text-xs text-muted-foreground mb-4">متوفر: {product.stockQuantity} {product.unit}</span>
                  <span className="mt-auto text-lg font-display font-bold text-pharmav-primary">{product.price.toFixed(2)} ر.س</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </AppLayout>
  );
}