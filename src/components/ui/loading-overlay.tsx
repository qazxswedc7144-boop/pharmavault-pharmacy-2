import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
interface LoadingOverlayProps {
  show: boolean;
  message?: string;
}
export function LoadingOverlay({ show, message = "جاري معالجة طلبك..." }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          dir="rtl"
        >
          <div className="bg-card p-8 rounded-3xl shadow-glow border-2 border-pharmav-primary/20 flex flex-col items-center gap-6 text-center max-w-sm mx-4">
            <div className="relative">
              <Loader2 className="size-16 text-pharmav-primary animate-spin" />
              <div className="absolute inset-0 bg-pharmav-primary/20 blur-2xl rounded-full -z-10 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl text-foreground">{message}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                نقوم بتوليد التقرير المالي عالي الدقة. يرجى الانتظار قليلاً وعدم إغلاق هذه النافذة.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}