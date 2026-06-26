import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Pill, RotateCcw, CreditCard, Banknote } from 'lucide-react';
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
    <header className={`border-b sticky top-0 z-50 transition-colors duration-500 ${isReturn ? 'bg-rose-600 text-white shadow-lg' : 'bg-background shadow-sm'}`}>
      <div className="max-w-full px-6 h-20 flex items-center justify-between">
        {/* Right side (Back and Brand) */}
        <div className="flex items-center gap-6">
          <Button variant="ghost" asChild className={isReturn ? 'text-white hover:bg-white/10' : ''}>
            <Link to="/purchases" className="flex items-center gap-2 font-bold">
              <ArrowRight className="size-4" /> العودة
            </Link>
          </Button>
          <div className="flex items-center gap-2 pr-6 border-r border-current/20">
            <Pill className={`size-6 ${isReturn ? 'text-white' : 'text-pharmav-primary'}`} />
            <span className="font-display font-bold text-xl tracking-tight">فارمافولت <span className="text-xs font-normal opacity-60 uppercase">Purchases</span></span>
          </div>
        </div>
        {/* Center (Title and Mode Toggle) */}
        <div className="flex items-center gap-8">
          <motion.h1
            key={getTitle()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl font-display font-bold"
          >
            {getTitle()}
          </motion.h1>
          <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all ${isReturn ? 'bg-white/10 border-white/20' : 'bg-muted/50 border-border shadow-inner'}`}>
            <Label htmlFor="purchase-return-mode" className="text-sm font-bold cursor-pointer flex items-center gap-2">
              <RotateCcw className={`size-4 ${isReturn ? 'animate-spin-slow' : ''}`} />
              مرتجع
            </Label>
            <Switch
              id="purchase-return-mode"
              checked={isReturn}
              onCheckedChange={onTypeChange}
            />
          </div>
        </div>
        {/* Left side (Payment Mode Switcher) */}
        <div className="flex items-center gap-1 bg-muted/80 p-1 rounded-2xl relative overflow-hidden w-64 border border-border/50">
          <motion.div
            className="absolute inset-y-1 bg-background rounded-xl shadow-sm w-[48%]"
            animate={{ x: isCredit ? '-104%' : '0%' }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          />
          <button
            onClick={() => onModeChange('cash')}
            className={`flex-1 relative z-10 px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors ${!isCredit ? 'text-pharmav-primary' : 'text-muted-foreground'}`}
          >
            <Banknote className="size-4" /> نقدي
          </button>
          <button
            onClick={() => onModeChange('credit')}
            className={`flex-1 relative z-10 px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors ${isCredit ? 'text-pharmav-primary' : 'text-muted-foreground'}`}
          >
            <CreditCard className="size-4" /> آجل
          </button>
        </div>
      </div>
    </header>
  );
}