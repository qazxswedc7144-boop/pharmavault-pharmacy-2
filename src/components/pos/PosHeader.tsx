import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CreditCard, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PosTransactionType, PosPaymentMode } from '@/pages/PosPage';
interface PosHeaderProps {
  type: PosTransactionType;
  onTypeChange: (t: PosTransactionType) => void;
  mode: PosPaymentMode;
  onModeChange: (m: PosPaymentMode) => void;
}
export function PosHeader({ type, onTypeChange, mode, onModeChange }: PosHeaderProps) {
  const isReturn = type === 'return';
  const isCredit = mode === 'credit';
  const getTitle = () => {
    let title = isReturn ? 'مردودات مبيعات' : 'فاتورة مبيعات';
    title += isCredit ? ' آجلة' : ' نقدية';
    return title;
  };
  return (
    <header className="border-b bg-background transition-colors duration-300">
      <div className="max-w-full px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/dashboard">
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-8">
          <motion.h1
            key={getTitle()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "text-xl font-display font-bold transition-colors duration-300",
              isReturn ? "text-red-600" : "text-foreground"
            )}
          >
            {getTitle()}
          </motion.h1>
          <button
            onClick={() => onTypeChange(isReturn ? 'sale' : 'return')}
            className={cn(
              "px-6 py-2 rounded-xl border text-sm font-bold transition-all duration-200 active:scale-95 flex items-center gap-2",
              isReturn
                ? "bg-red-50 text-red-600 border-red-200 shadow-sm"
                : "bg-gray-50 text-gray-600 border-gray-200"
            )}
          >
            {isReturn ? "وضع المرتجع نشط" : "مرتجع"}
          </button>
        </div>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl relative overflow-hidden">
          <motion.div
            className="absolute inset-y-1 bg-background rounded-lg shadow-sm w-[48%]"
            animate={{ x: isCredit ? '-104%' : '0%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button
            onClick={() => onModeChange('cash')}
            className={cn(
              "relative z-10 px-4 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors",
              !isCredit ? 'text-pharmav-primary' : 'text-muted-foreground'
            )}
          >
            <Banknote className="size-4" /> نقدي
          </button>
          <button
            onClick={() => onModeChange('credit')}
            className={cn(
              "relative z-10 px-4 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors",
              isCredit ? 'text-pharmav-primary' : 'text-muted-foreground'
            )}
          >
            <CreditCard className="size-4" /> آجل
          </button>
        </div>
      </div>
    </header>
  );
}