import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  ArrowLeftRight, 
  Package, 
  FileSpreadsheet, 
  ShieldCheck, 
  ChevronLeft,
  X
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
interface TransactionSummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  amount: number;
  steps: {
    label: string;
    description: string;
    icon: any;
    status: 'success' | 'pending';
  }[];
  journalId?: string;
}
export function TransactionSummary({ 
  open, 
  onOpenChange, 
  title, 
  amount, 
  steps, 
  journalId 
}: TransactionSummaryProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-glow rounded-[2rem]" dir="rtl">
        <div className="bg-green-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="size-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-md"
          >
            <CheckCircle2 className="size-10" />
          </motion.div>
          <h2 className="text-3xl font-display font-bold mb-2">{title}</h2>
          <div className="text-4xl font-display font-bold tracking-tight">
            {amount.toLocaleString()} <span className="text-sm font-normal opacity-80">ر.س</span>
          </div>
        </div>
        <div className="p-8 space-y-6 bg-card">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">نظام ربط العمليات (الربط المالي)</h4>
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 flex-row-reverse p-3 rounded-2xl bg-muted/30 border border-transparent hover:border-border transition-colors"
              >
                <div className="size-10 rounded-xl bg-background flex items-center justify-center text-pharmav-primary shadow-sm">
                  <step.icon className="size-5" />
                </div>
                <div className="flex-1 text-right">
                  <div className="text-sm font-bold">{step.label}</div>
                  <div className="text-[10px] text-muted-foreground">{step.description}</div>
                </div>
                <div className="size-5 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
                  <CheckCircle2 className="size-3" />
                </div>
              </motion.div>
            ))}
          </div>
          {journalId && (
            <div className="p-4 rounded-2xl bg-pharmav-primary/5 border border-pharmav-primary/10 flex items-center justify-between flex-row-reverse">
              <div className="flex items-center gap-3 flex-row-reverse">
                <FileSpreadsheet className="size-5 text-pharmav-primary" />
                <div className="text-right">
                  <div className="text-xs font-bold">قيد محاسبي تلقائي</div>
                  <div className="text-[10px] font-mono opacity-60">#{journalId.slice(0, 8)}</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-8 text-[10px] font-bold">
                <Link to={`/ledger?referenceId=${journalId}`}>عرض في الدفتر</Link>
              </Button>
            </div>
          )}
        </div>
        <DialogFooter className="p-6 bg-muted/30 border-t flex flex-row-reverse gap-4">
          <Button 
            className="flex-1 h-14 bg-pharmav-primary font-bold text-lg rounded-2xl shadow-neon-blue"
            onClick={() => onOpenChange(false)}
          >
            إغلاق ومتابعة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}