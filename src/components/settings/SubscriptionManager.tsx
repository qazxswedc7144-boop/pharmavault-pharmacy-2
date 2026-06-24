import React, { useState } from 'react';
import { 
  CreditCard, 
  Calendar, 
  Zap, 
  ChevronLeft, 
  AlertCircle,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/offline-store';
import { cn } from '@/lib/utils';
import { PlanUpgradeModal } from './PlanUpgradeModal';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
export function SubscriptionManager() {
  const subscription = useAppStore(s => s.subscription);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const plans = {
    starter: { name: 'الباقة المبتدئة', color: 'bg-blue-500', icon: LayoutDashboard, limit: 500 },
    pro: { name: 'الباقة الاحترافية', color: 'bg-pharmav-primary', icon: Zap, limit: 5000 },
    enterprise: { name: 'باقة المؤسسات', color: 'bg-amber-500', icon: Clock, limit: Infinity }
  };
  const currentPlan = plans[subscription.planId];
  const usagePercentage = subscription.planId === 'enterprise' ? 10 : 75; // Mock usage
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-[2rem] bg-gradient-to-br from-card to-muted/30 border shadow-soft relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-32 h-32 bg-pharmav-primary/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform" />
        <div className="flex items-center justify-between mb-8 flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className={cn("size-12 rounded-2xl flex items-center justify-center text-white shadow-lg", currentPlan.color)}>
              <currentPlan.icon className="size-6" />
            </div>
            <div className="text-right">
              <h4 className="text-lg font-display font-bold">{currentPlan.name}</h4>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-none text-[10px] h-5">
                {subscription.status === 'active' ? 'نشط' : 'معلق'}
              </Badge>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsUpgradeOpen(true)}
            className="rounded-xl h-10 border-2 font-bold hover:bg-pharmav-primary/5 hover:text-pharmav-primary"
          >
            تغيير الخطة
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground flex-row-reverse">
            <span>استهلاك المنتجات</span>
            <span>{usagePercentage}%</span>
          </div>
          <Progress value={usagePercentage} className="h-2 rounded-full" />
          <p className="text-[10px] text-muted-foreground text-right">
            استخدمت 375 من أصل {currentPlan.limit === Infinity ? '∞' : currentPlan.limit} صنف مسموح.
          </p>
        </div>
        <div className="mt-8 pt-6 border-t flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-2 flex-row-reverse">
            <Calendar className="size-4 text-muted-foreground" />
            <div className="text-right">
              <p className="text-[9px] font-bold text-muted-foreground uppercase">موعد التجديد القادم</p>
              <p className="text-xs font-bold">{format(new Date(subscription.nextBillingDate), 'dd MMMM yyyy', { locale: ar })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-row-reverse">
            <CreditCard className="size-4 text-muted-foreground" />
            <div className="text-right">
              <p className="text-[9px] font-bold text-muted-foreground uppercase">طريقة الدفع</p>
              <p className="text-xs font-bold">Visa •••• 4242</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <Button 
          variant="ghost" 
          className="justify-between h-14 rounded-2xl px-6 hover:bg-muted group flex-row-reverse"
        >
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="size-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <AlertCircle className="size-4" />
            </div>
            <span className="font-bold">سجل الفواتير والمدفوعات</span>
          </div>
          <ChevronLeft className="size-4 text-muted-foreground group-hover:translate-x-[-4px] transition-transform" />
        </Button>
      </div>
      <PlanUpgradeModal 
        open={isUpgradeOpen} 
        onOpenChange={setIsUpgradeOpen} 
        initialPlanId={subscription.planId} 
      />
    </div>
  );
}