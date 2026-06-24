import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { PosHeader } from '@/components/pos/PosHeader';
import { PosProductGrid } from '@/components/pos/PosProductGrid';
import { PosCart } from '@/components/pos/PosCart';
import { PosPaymentSection } from '@/components/pos/PosPaymentSection';
import type { Product, SaleItem, Customer } from '@shared/types';
import { toast } from 'sonner';
export type PosTransactionType = 'sale' | 'return';
export type PosPaymentMode = 'cash' | 'credit';
export function PosPage() {
  const [transactionType, setTransactionType] = useState<PosTransactionType>('sale');
  const [paymentMode, setPaymentMode] = useState<PosPaymentMode>('cash');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  // Keyboard Shortcuts
  useHotkeys('f1', (e) => {
    e.preventDefault();
    document.getElementById('process-payment-btn')?.click();
  });
  useHotkeys('f2', (e) => {
    e.preventDefault();
    document.getElementById('pos-search-input')?.focus();
  });
  const addToCart = useCallback((product: Product) => {
    if (transactionType === 'sale' && product.stockQuantity <= 0) {
      toast.error('هذا المنتج غير متوفر في المخزون');
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
  }, [transactionType]);
  const updateCartItem = useCallback((productId: string, quantity: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0, quantity);
        return {
          ...item,
          quantity: newQty,
          subtotal: newQty * (item.unitPrice + item.taxAmount - item.discountAmount)
        };
      }
      return item;
    }).filter(item => item.quantity > 0));
  }, []);
  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer(null);
  }, []);
  const isReturn = transactionType === 'return';
  const themeColor = isReturn ? 'text-rose-500 border-rose-500/20' : 'text-pharmav-primary border-pharmav-primary/20';
  return (
    <div className={`min-h-screen bg-background flex flex-col overflow-hidden transition-colors duration-500 ${isReturn ? 'bg-rose-50/10 dark:bg-rose-950/10' : ''}`} dir="rtl">
      <PosHeader 
        type={transactionType} 
        onTypeChange={setTransactionType}
        mode={paymentMode}
        onModeChange={setPaymentMode}
      />
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* Cart & Payment Area (Left for RTL) */}
        <div className="w-full lg:w-[450px] flex flex-col gap-4 overflow-hidden order-2 lg:order-1">
          <PosCart 
            items={cart} 
            onUpdateQuantity={updateCartItem} 
            isReturn={isReturn}
          />
          <PosPaymentSection 
            cart={cart}
            paymentMode={paymentMode}
            transactionType={transactionType}
            customer={selectedCustomer}
            onCustomerChange={setSelectedCustomer}
            onSuccess={clearCart}
          />
        </div>
        {/* Product Selection (Right for RTL) */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden order-1 lg:order-2">
          <PosProductGrid onSelect={addToCart} isReturn={isReturn} />
        </div>
      </main>
      {/* Shortcuts Help Bar */}
      <footer className="bg-muted/50 border-t px-6 py-2 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        <div className="flex gap-4">
          <span>F1: تأكيد الدفع</span>
          <span>F2: البحث</span>
          <span>F4: تبديل نقدي/آجل</span>
        </div>
        <div>نظام فارمافولت POS | الإصدار 2.5</div>
      </footer>
    </div>
  );
}