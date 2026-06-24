import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Shield, Rocket, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/lib/offline-store';
import { cn } from '@/lib/utils';
import type { SubscriptionPlanId, BillingCycle, SubscriptionInfo } from '@shared/types';
import { toast } from 'sonner';
interface PlanUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPlanId?: SubscriptionPlanId;
}
export function PlanUpgradeModal({ open, onOpenChange, initialPlanId }: PlanUpgradeModalProps) {
  const currentSub = useAppStore(s => s.subscription);
  const setSubscription = useAppStore(s => s.setSubscription);
  const addBillingRecord = useAppStore(s => s.addBillingRecord);
  const [cycle, setCycle] = useState<BillingCycle>(currentSub.billingCycle);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>(initialPlanId || currentSub.planId);
  const [step, setStep] = useState<'selection' | 'checkout' | 'success'>('selection');
  const [isProcessing, setIsProcessing] = useState(false);
  const plans = [
    {
      id: 'starter' as const,
      name: 'الباقة المبتدئة',
      price: cycle === 'monthly' ? 49 : 490,
      description: 'مثالية للصيدليات الصغيرة المستقلة.',
      features: ['حتى 500 منتج', 'مستخدم واحد', 'تقارير أساسية', 'دعم عبر البريد'],
      icon: Shield
    },
    {
      id: 'pro' as const,
      name: 'الباقة الاحترافية',
      price: cycle === 'monthly' ? 99 : 990,
      description: 'الخيار الأمثل للصيدليات المزدحمة.',
      features: ['منتجات غير محدودة', '5 مستخدمين', 'تقارير متقدمة', 'تنبيهات الصلاحية', 'دعم فني أولوية'],
      icon: Zap,
      featured: true
    },
    {
      id: 'enterprise' as const,
      name: 'باقة المؤسسات',
      price: cycle === 'monthly' ? 249 : 2490,
      description: 'حلول متكاملة للمستشفيات والسلاسل.',
      features: ['مستخدمين غير محدودين', 'مزامنة فروع متعددة', 'دخول API كامل', 'مدير حساب مخصص'],
      icon: Rocket
    }
  ];
  const handleUpgrade = () => {
    if (selectedPlan === currentSub.planId && cycle === currentSub.billingCycle) {
      onOpenChange(false);
      return;
    }
    setStep('checkout');
  };
  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const plan = plans.find(p => p.id === selectedPlan);
      const newSub: SubscriptionInfo = {
        planId: selectedPlan,
        status: 'active',
        billingCycle: cycle,
        nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + (cycle === 'monthly' ? 1 : 12))).toISOString()
      };
      setSubscription(newSub);
      addBillingRecord({
        id: `INV-${Math.floor(Math.random() * 90000) + 10000}`,
        date: new Date().toISOString(),
        amount: plan?.price || 0,
        planId: selectedPlan,
        invoiceUrl: '#',
        status: 'paid'
      });
      setIsProcessing(false);
      setStep('success');
      toast.success('تم تحديث اشتراكك بنجاح!');
    }, 2500);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-[2rem]" dir="rtl">
        <AnimatePresence mode="wait">
          {step === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader className="p-10 bg-muted/30 text-right">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <DialogTitle className="text-3xl font-display font-bold">اختر الخطة المناسبة لنموك</DialogTitle>
                    <DialogDescription className="text-lg">قم بترقية ميزات صيدليتك وزد كفاءة فريقك اليوم.</DialogDescription>
                  </div>
                  <div className="bg-background p-1 rounded-2xl flex items-center gap-1 border shadow-sm self-start">
                    <button
                      onClick={() => setCycle('monthly')}
                      className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", cycle === 'monthly' ? "bg-pharmav-primary text-white" : "text-muted-foreground")}
                    >شهري</button>
                    <button
                      onClick={() => setCycle('yearly')}
                      className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2", cycle === 'yearly' ? "bg-pharmav-primary text-white" : "text-muted-foreground")}
                    >
                      سنوي
                      <Badge className="bg-green-500/20 text-green-600 border-none text-[10px] h-4">وفر 20%</Badge>
                    </button>
                  </div>
                </div>
              </DialogHeader>
              <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={cn(
                      "flex flex-col text-right p-8 rounded-[2.5rem] border-2 transition-all duration-300 relative group",
                      selectedPlan === plan.id ? "border-pharmav-primary bg-pharmav-primary/5 shadow-glow" : "border-border hover:border-pharmav-primary/40",
                      currentSub.planId === plan.id && "ring-4 ring-offset-4 ring-pharmav-primary/10"
                    )}
                  >
                    {currentSub.planId === plan.id && (
                      <Badge className="absolute top-4 left-4 bg-pharmav-primary text-white">خطتك الحالية</Badge>
                    )}
                    <div className={cn("size-12 rounded-2xl flex items-center justify-center mb-6", plan.featured ? "bg-pharmav-primary text-white" : "bg-muted")}>
                      <plan.icon className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4 flex-row-reverse">
                      <span className="text-4xl font-display font-bold text-pharmav-primary">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">ر.س / {cycle === 'monthly' ? 'شهر' : 'سنة'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-8 line-clamp-2 h-10">{plan.description}</p>
                    <div className="space-y-4 flex-1">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 flex-row-reverse">
                          <div className="size-5 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                            <Check className="size-3" />
                          </div>
                          <span className="text-sm font-medium">{f}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-10 pt-0 flex justify-end">
                <Button 
                  onClick={handleUpgrade}
                  className="h-16 px-12 rounded-2xl bg-pharmav-primary text-lg font-bold shadow-neon-blue w-full md:w-auto"
                >تأكيد الاختيار والمتابعة</Button>
              </div>
            </motion.div>
          )}
          {step === 'checkout' && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-20 flex flex-col items-center text-center space-y-8"
            >
              <div className="size-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
                <CreditCard className="size-10 text-pharmav-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold">تأكيد عملية الدفع</h2>
                <p className="text-muted-foreground">سيتم خصم مبلغ <span className="font-bold text-foreground">{plans.find(p => p.id === selectedPlan)?.price} ر.س</span> من بطاقتك المسجلة.</p>
              </div>
              <div className="w-full max-w-sm space-y-4">
                <div className="p-4 rounded-2xl border bg-muted/30 flex items-center justify-between flex-row-reverse">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <div className="size-10 rounded-lg bg-background border flex items-center justify-center">VISA</div>
                    <div className="text-right">
                      <div className="text-sm font-bold">Visa Ending in 4242</div>
                      <div className="text-xs text-muted-foreground">ينتهي في 12/26</div>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-xs font-bold text-pharmav-primary">تغيير</Button>
                </div>
                <Button 
                  onClick={handleCheckout} 
                  disabled={isProcessing}
                  className="w-full h-16 rounded-2xl bg-pharmav-primary text-xl font-bold shadow-neon-blue"
                >
                  {isProcessing ? <Loader2 className="size-6 animate-spin" /> : 'تأكيد الدفع والاشتراك'}
                </Button>
                <Button variant="ghost" onClick={() => setStep('selection')} className="w-full">العودة لتعديل الخطة</Button>
              </div>
            </motion.div>
          )}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-20 flex flex-col items-center text-center space-y-8"
            >
              <div className="size-32 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="size-16" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-display font-bold text-gradient-pharmav">تهانينا! تم التفعيل</h2>
                <p className="text-xl text-muted-foreground">أنت الآن مشترك في <span className="font-bold text-foreground">{plans.find(p => p.id === selectedPlan)?.name}</span> بنجاح.</p>
              </div>
              <Button 
                onClick={() => onOpenChange(false)}
                className="h-16 px-16 rounded-2xl bg-pharmav-primary text-xl font-bold shadow-neon-blue"
              >ابدأ استكشاف الميزات الجديدة</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}