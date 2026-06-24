import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
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
  const isOnline = useAppStore(s => s.isOnline);
  const addToOfflineQueue = useAppStore(s => s.addToOfflineQueue);
  const queryClient = useQueryClient();
  const { data: productsData, isLoading } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api<{ items: Product[] }>('/api/products')
  });
  const products = productsData?.items ?? [];
  const filteredProducts = useMemo(() => {
    if (!search) return products;
    const s = search.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(s) || 
      p.sku.toLowerCase().includes(s)
    );
  }, [products, search]);
  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      toast.error('Product out of stock');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        quantity: 1,
        unitPrice: product.price,
        subtotal: product.price
      }];
    });
  };
  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty, subtotal: newQty * item.unitPrice };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };
  const total = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const saleMutation = useMutation({
    mutationFn: (transaction: Transaction) => 
      api('/api/transactions', { method: 'POST', body: JSON.stringify(transaction) }),
    onSuccess: () => {
      toast.success('Sale processed successfully');
      setCart([]);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      toast.error('Server error. Sale saved to offline queue.');
    }
  });
  const handleProcessSale = async () => {
    if (cart.length === 0) return;
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      userId: 'u1', // Mock admin for now
      items: cart,
      totalAmount: total,
      paymentMethod,
      status: 'completed',
      timestamp: Date.now()
    };
    if (!isOnline) {
      addToOfflineQueue(transaction);
      toast.info('Offline: Sale queued for sync');
      setCart([]);
    } else {
      saleMutation.mutate(transaction);
    }
  };
  return (
    <AppLayout container contentClassName="max-w-full lg:px-8">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
        {/* Product Selection Pane */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search products by name or SKU..." 
                className="pl-10 h-12 text-lg glass-card"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {!isOnline && (
              <Badge variant="outline" className="h-12 px-4 gap-2 text-orange-500 border-orange-500/50 bg-orange-500/5">
                <AlertCircle className="size-4" /> Offline Mode
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
                  className="flex flex-col items-start p-4 bg-card border rounded-xl hover:border-pharmav-primary/40 hover:shadow-soft transition-all text-left group"
                >
                  <Badge variant="outline" className="mb-2 text-[10px] opacity-70">{product.sku}</Badge>
                  <span className="font-bold text-sm line-clamp-2 mb-1 group-hover:text-pharmav-primary">{product.name}</span>
                  <span className="text-xs text-muted-foreground mb-4">{product.stockQuantity} {product.unit}s left</span>
                  <span className="mt-auto text-lg font-display font-bold text-pharmav-primary">${product.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
        {/* Checkout Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col glass-card border-none shadow-glow overflow-hidden">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="size-5" /> Current Order
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
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex items-center gap-3"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-bold line-clamp-1">{product?.name}</div>
                            <div className="text-xs text-muted-foreground">${item.unitPrice.toFixed(2)} / {product?.unit}</div>
                          </div>
                          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="size-7 h-7 w-7" 
                              onClick={() => updateQuantity(item.productId, -1)}
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="size-7 h-7 w-7" 
                              onClick={() => updateQuantity(item.productId, 1)}
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>
                          <div className="text-sm font-bold w-16 text-right">${item.subtotal.toFixed(2)}</div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {cart.length === 0 && (
                    <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <ShoppingCart className="size-8 opacity-20" />
                      <p className="text-sm">Cart is empty</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 bg-muted/30 border-t space-y-4">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xl font-display font-bold">
                  <span>Total</span>
                  <span className="text-pharmav-primary">${total.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', icon: <Banknote className="size-4" />, label: 'Cash' },
                    { id: 'card', icon: <CreditCard className="size-4" />, label: 'Card' },
                    { id: 'transfer', icon: <Receipt className="size-4" />, label: 'Transfer' },
                  ].map(method => (
                    <Button
                      key={method.id}
                      variant={paymentMethod === method.id ? 'default' : 'outline'}
                      className="flex-col h-16 gap-1"
                      onClick={() => setPaymentMethod(method.id as any)}
                    >
                      {method.icon}
                      <span className="text-[10px]">{method.label}</span>
                    </Button>
                  ))}
                </div>
                <Button 
                  className="w-full h-14 text-lg font-bold shadow-neon-blue" 
                  disabled={cart.length === 0 || saleMutation.isPending}
                  onClick={handleProcessSale}
                >
                  Process Sale
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}