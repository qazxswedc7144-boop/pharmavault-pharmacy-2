import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw, CreditCard, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
    <header className={`border-b transition-colors duration-500 ${isReturn ? 'bg-rose-500 text-white' : 'bg-background'}`}>
      <div className="max-w-full px-6 h-16 flex items-center justify-between">
        {/* Right side: Back Button only (Icon-only as requested) */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className={isReturn ? 'text-white hover:bg-white/10 rounded-full' : 'rounded-full'}>
            <Link to="/dashboard">
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </div>
        {/* Center: Return Toggle and Title */}
        <div className="flex items-center gap-8">
          <motion.h1
            key={getTitle()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-display font-bold"
          >
            {getTitle()}
          </motion.h1>
          <div className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${isReturn ? 'bg-white/10 border-white/20' : 'bg-muted/50 border-border'}`}>
            <Label htmlFor="return-mode" className="text-sm font-bold cursor-pointer flex items-center gap-2">
              <RotateCcw className={`size-3 ${isReturn ? 'animate-spin-slow' : ''}`} />
              مرتجع
            </Label>
            <Switch
              id="return-mode"
              checked={isReturn}
              onCheckedChange={(checked) => onTypeChange(checked ? 'return' : 'sale')}
            />
          </div>
        </div>
        {/* Left side: Payment Mode Toggle */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl relative overflow-hidden">
          <motion.div
            className="absolute inset-y-1 bg-background rounded-lg shadow-sm w-[48%]"
            animate={{ x: isCredit ? '-104%' : '0%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button
            onClick={() => onModeChange('cash')}
            className={`relative z-10 px-4 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${!isCredit ? 'text-pharmav-primary' : 'text-muted-foreground'}`}
          >
            <Banknote className="size-4" /> نقدي
          </button>
          <button
            onClick={() => onModeChange('credit')}
            className={`relative z-10 px-4 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${isCredit ? 'text-pharmav-primary' : 'text-muted-foreground'}`}
          >
            <CreditCard className="size-4" /> آجل
          </button>
        </div>
      </div>
    </header>
  );
}