import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, RotateCcw, Loader2, Printer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import type { Customer, SaleItem, Transaction } from '@shared/types';
import type { PosTransactionType, PosPaymentMode } from '@/pages/PosPage';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
interface PosPaymentSectionProps {
  cart: SaleItem[];
  paymentMode: PosPaymentMode;
  transactionType: PosTransactionType;
  customer: Customer | null;
  onCustomerChange: (c: Customer | null) => void;
  onSuccess: () => void;
}
export function PosPaymentSection({
  cart,
  paymentMode,
  transactionType,
  customer,
  onCustomerChange,
  onSuccess
}: PosPaymentSectionProps) {
  const [cashReceived, setCashReceived] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(false);
  const queryClient = useQueryClient();
  const isReturn = transactionType === 'return';
  const isCredit = paymentMode === 'credit';
  const { data: customersData } = useQuery<{ items: Customer[] }>({
    queryKey: ['customers'],
    queryFn: () => api<{ items: Customer[] }>('/api/customers')
  });
  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
    const tax = cart.reduce((acc, i) => acc + (i.taxAmount * i.quantity), 0);
    const discount = cart.reduce((acc, i) => acc + (i.discountAmount * i.quantity), 0);
    return { subtotal, tax, discount, total: subtotal + tax - discount };
  }, [cart]);
  const change = useMemo(() => {
    const received = parseFloat(cashReceived) || 0;
    const diff = received - totals.total;
    return diff > 0 ? diff : 0;
  }, [cashReceived, totals.total]);
  const mutation = useMutation({
    mutationFn: (tx: Transaction) => api<Transaction>('/api/transactions', { method: 'POST', body: JSON.stringify(tx) }),
    onSuccess: () => {
      setIsPrinting(true);
      setTimeout(() => {
        setIsPrinting(false);
        toast.success(isReturn ? 'تمت عملية الاسترجاع بنجاح' : 'تمت عملية البيع بنجاح');
        onSuccess();
        setCashReceived('');
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }, 1500);
    },
    onError: () => toast.error('فشل في إتمام العملية')
  });
  const handleConfirm = () => {
    if (cart.length === 0) {
      toast.error('السلة فارغة');
      return;
    }
    if (isCredit && !customer) {
      toast.warning('يرجى اختيار عميل لإتمام البيع الآجل');
      return;
    }
    const tx: Transaction = {
      id: crypto.randomUUID(),
      userId: 'u1',
      customerId: customer?.id,
      items: cart,
      subtotal: totals.subtotal,
      taxTotal: totals.tax,
      discountTotal: totals.discount,
      totalAmount: totals.total,
      paymentMethod: isCredit ? 'transfer' : 'cash',
      status: 'completed',
      timestamp: Date.now()
    };
    mutation.mutate(tx);
  };
  return (
    <Card className={cn(
      "border-none shadow-glow overflow-hidden transition-colors duration-500",
      isReturn ? "bg-rose-600 text-white" : "bg-card"
    )}>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2 text-right">
          <Label className={cn("text-xs font-bold", isReturn ? "text-white/80" : "text-muted-foreground")}>العميل / المريض</Label>
          <Select
            value={customer?.id || ''}
            onValueChange={(id) => onCustomerChange(customersData?.items.find(c => c.id === id) || null)}
          >
            <SelectTrigger className={cn("text-right h-12 rounded-xl", isReturn ? "bg-white/10 border-white/20 text-white" : "bg-muted border-none")}>
              <SelectValue placeholder="اختر العميل (اختياري)..." />
            </SelectTrigger>
            <SelectContent className="text-right">
              {customersData?.items?.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isCredit && customer && customer.currentBalance >= customer.creditLimit && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-orange-200 mt-1 justify-end animate-pulse">
              <span>تجاوز الحد الائتماني المسموح به</span>
              <AlertTriangle className="size-3" />
            </div>
          )}
        </div>
        {!isCredit && !isReturn && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-right">
              <Label className={cn("text-xs font-bold", isReturn ? "text-white/80" : "text-muted-foreground")}>المبلغ المستلم</Label>
              <Input
                type="number"
                value={cashReceived}
                onChange={e => setCashReceived(e.target.value)}
                className={cn("h-12 text-center text-xl font-bold rounded-xl", isReturn ? "bg-white/10 border-white/20 text-white" : "bg-muted border-none")}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2 text-right">
              <Label className={cn("text-xs font-bold", isReturn ? "text-white/80" : "text-muted-foreground")}>المتبقي للعميل</Label>
              <div className={cn("h-12 flex items-center justify-center text-2xl font-display font-bold rounded-xl", isReturn ? "bg-white/20" : "bg-green-500/10 text-green-600")}>
                {change.toFixed(2)}
              </div>
            </div>
          </div>
        )}
        <div className={cn("p-4 rounded-2xl space-y-2", isReturn ? "bg-black/10" : "bg-muted/50")}>
          <div className="flex justify-between items-center text-sm opacity-80 flex-row-reverse">
            <span>المجموع:</span>
            <span>{totals.subtotal.toFixed(2)} ر.س</span>
          </div>
          <div className="flex justify-between items-center text-sm opacity-80 flex-row-reverse">
            <span>الضريبة المضافة:</span>
            <span>+{totals.tax.toFixed(2)} ر.س</span>
          </div>
          <div className="flex justify-between items-center text-sm text-rose-400 flex-row-reverse">
            <span>إجمالي الخصم:</span>
            <span>-{totals.discount.toFixed(2)} ر.س</span>
          </div>
          <div className="pt-2 border-t border-current/10 flex justify-between items-center flex-row-reverse">
            <span className="text-xl font-display font-bold">صافي الفاتورة:</span>
            <div className="text-3xl font-display font-bold tracking-tighter">
              {totals.total.toFixed(2)} <span className="text-sm font-normal">ر.س</span>
            </div>
          </div>
        </div>
        <Button
          id="process-payment-btn"
          disabled={cart.length === 0 || mutation.isPending || isPrinting}
          onClick={handleConfirm}
          className={cn(
            "w-full h-16 text-xl font-display font-bold rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3",
            isReturn
              ? "bg-white text-rose-600 hover:bg-rose-50"
              : "bg-pharmav-primary hover:bg-pharmav-primary/90 shadow-neon-blue text-white"
          )}
        >
          {isPrinting ? (
            <>
              <Printer className="size-6 animate-bounce" />
              جاري طباعة الإيصال...
            </>
          ) : mutation.isPending ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <>
              {isReturn ? <RotateCcw className="size-6" /> : <CheckCircle2 className="size-6" />}
              {isReturn ? 'تأكيد المرتجع' : 'تأكيد البيع والطباعة (F1)'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}