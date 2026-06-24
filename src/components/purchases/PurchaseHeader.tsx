import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw, CreditCard, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
interface PurchaseHeaderProps {
  isReturn: boolean;
  isCredit: boolean;
  onTypeChange: (val: boolean) => void;
  onModeChange: (val: 'cash' | 'credit') => void;
}
export function PurchaseHeader({ isReturn, isCredit, onTypeChange, onModeChange }: PurchaseHeaderProps) {
  const getTitle = () => {
    let title = isReturn ? 'مرتجع مشتريات' : 'فاتورة مشتريات';
    title += isCredit ? ' آجلة' : ' نقدية';
    return title;
  };
  return (
    <header className={`border-b sticky top-0 z-50 transition-all duration-500 ${isReturn ? 'bg-rose-600 text-white shadow-xl' : 'bg-background shadow-sm'}`} dir="rtl">
      <div className="max-w-full px-6 h-20 flex items-center justify-between">
        {/* Element 1: Back Button */}
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" asChild className={isReturn ? 'text-white hover:bg-white/10 rounded-full' : 'text-foreground rounded-full'}>
            <Link to="/purchases">
              <ArrowRight className="size-6" />
            </Link>
          </Button>
        </div>
        {/* Element 2: Dynamic Title & Return Toggle */}
        <div className="flex items-center gap-10">
          <motion.div
            key={getTitle()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <h1 className="text-2xl font-display font-bold whitespace-nowrap">{getTitle()}</h1>
            <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all ${isReturn ? 'bg-white/10 border-white/20' : 'bg-muted/50 border-border shadow-inner'}`}>
              <Label htmlFor="purchase-return-toggle" className="text-sm font-bold cursor-pointer flex items-center gap-2">
                <RotateCcw className={`size-4 ${isReturn ? 'animate-spin-slow' : ''}`} />
                مرتجع
              </Label>
              <Switch
                id="purchase-return-toggle"
                checked={isReturn}
                onCheckedChange={onTypeChange}
                className="data-[state=checked]:bg-rose-400"
              />
            </div>
          </motion.div>
        </div>
        {/* Element 3: Cash/Credit Switcher */}
        <div className="flex items-center gap-1 bg-muted/80 p-1.5 rounded-2xl relative overflow-hidden w-64 border border-border/50">
          <motion.div
            className="absolute inset-y-1.5 bg-background rounded-xl shadow-sm w-[47%]"
            animate={{ x: isCredit ? '-106%' : '0%' }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          />
          <button
            type="button"
            onClick={() => onModeChange('cash')}
            className={`flex-1 relative z-10 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors ${!isCredit ? 'text-pharmav-primary' : 'text-muted-foreground'}`}
          >
            <Banknote className="size-4" /> نقدي
          </button>
          <button
            type="button"
            onClick={() => onModeChange('credit')}
            className={`flex-1 relative z-10 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors ${isCredit ? 'text-pharmav-primary' : 'text-muted-foreground'}`}
          >
            <CreditCard className="size-4" /> آجل
          </button>
        </div>
      </div>
    </header>
  );
}