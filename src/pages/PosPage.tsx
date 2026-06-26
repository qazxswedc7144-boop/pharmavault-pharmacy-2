import React, { useState, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { PosHeader } from '@/components/pos/PosHeader';
import { PosInvoiceHeader } from '@/components/pos/PosInvoiceHeader';
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
  }, { enableOnFormTags: true });
  useHotkeys('f2', (e) => {
    e.preventDefault();
    document.getElementById('pos-search-input')?.focus();
  }, { enableOnFormTags: true });
  useHotkeys('f4', (e) => {
    e.preventDefault();
    setPaymentMode(prev => prev === 'cash' ? 'credit' : 'cash');
  }, { enableOnFormTags: true });
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
                subtotal: (item.quantity + 1) * (item.unitPrice + tax - item.discountAmount)
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
  const updateDiscount = useCallback((productId: string, discount: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          discountAmount: discount,
          subtotal: item.quantity * (item.unitPrice + item.taxAmount - discount)
        };
      }
      return item;
    }));
  }, []);
  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer(null);
  }, []);
  const handleCustomerChange = (customerId: string) => {
    // Selection handled by the object fetch inside PosPaymentSection normally,
    // but we can simulate/update here for shared state if needed.
  };
  const isReturn = transactionType === 'return';
  return (
    <div className={`h-screen flex flex-col bg-background overflow-hidden transition-colors duration-500 ${isReturn ? 'bg-rose-50/10 dark:bg-rose-950/20' : ''}`} dir="rtl">
      <PosHeader
        type={transactionType}
        onTypeChange={setTransactionType}
        mode={paymentMode}
        onModeChange={setPaymentMode}
      />
      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        <PosInvoiceHeader
          isReturn={isReturn}
          selectedCustomerId={selectedCustomer?.id}
          onCustomerChange={(id) => handleCustomerChange(id)}
        />
        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
          {/* Right Column: Product Selection (Order 1 on Desktop RTL) */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden order-1">
            <PosProductGrid onSelect={addToCart} isReturn={isReturn} />
          </div>
          {/* Left Column: Cart & Summary (Order 2 on Desktop RTL) */}
          <div className="w-full lg:w-[450px] flex flex-col gap-4 overflow-hidden order-2">
            <PosCart
              items={cart}
              onUpdateQuantity={updateCartItem}
              onUpdateDiscount={updateDiscount}
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
        </div>
      </main>
      <footer className="bg-muted/50 border-t px-6 h-10 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest shrink-0">
        <div className="flex gap-6">
          <span className="flex items-center gap-1"><kbd className="bg-background px-1 rounded border">F1</kbd> تأكيد الدفع</span>
          <span className="flex items-center gap-1"><kbd className="bg-background px-1 rounded border">F2</kbd> البحث</span>
          <span className="flex items-center gap-1"><kbd className="bg-background px-1 rounded border">F4</kbd> تبديل (نقدي/آجل)</span>
        </div>
        <div className="flex items-center gap-2">
          <span>نظام فارمافولت لإدارة نقاط البيع</span>
          <span className="px-2 py-0.5 rounded bg-pharmav-primary/10 text-pharmav-primary">V 2.5 STABLE</span>
        </div>
      </footer>
    </div>
  );
}