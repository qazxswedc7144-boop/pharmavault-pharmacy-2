import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Truck, 
  Users, 
  Users2, 
  BarChart, 
  PackageX, 
  Banknote, 
  Clock, 
  Diff,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReportType } from '@/pages/ReportsPage';
interface ReportSidebarProps {
  active: ReportType;
  onSelect: (type: ReportType) => void;
}
export function ReportSidebar({ active, onSelect }: ReportSidebarProps) {
  const groups = [
    {
      title: 'التقارير المالية',
      items: [
        { id: 'pnl', label: 'الأرباح والخسائر', icon: TrendingUp },
        { id: 'cash', label: 'حركة النقدية', icon: Banknote },
        { id: 'comparison', label: 'مقارنة الفترات', icon: Diff },
      ]
    },
    {
      title: 'تقارير العمليات',
      items: [
        { id: 'sales', label: 'سجل المبيعات', icon: ShoppingBag },
        { id: 'purchases', label: 'سجل المشتريات', icon: Truck },
        { id: 'cust-bal', label: 'ذمم العملاء', icon: Users },
        { id: 'sup-bal', label: 'ذمم الموردين', icon: Users2 },
      ]
    },
    {
      title: 'تقارير المخزون',
      items: [
        { id: 'top-selling', label: 'الأكثر مبيعاً', icon: BarChart },
        { id: 'slow-moving', label: 'الأصناف الراكدة', icon: PackageX },
        { id: 'expiry', label: 'انتهاء الصلاحية', icon: Clock },
      ]
    }
  ];
  return (
    <div className="glass-card rounded-3xl overflow-hidden border shadow-soft sticky top-24">
      <div className="p-6 bg-muted/30 border-b">
        <h3 className="font-display font-bold text-lg text-right">فئات التقارير</h3>
      </div>
      <div className="p-4 space-y-6">
        {groups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right px-2 mb-3">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id as ReportType)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl transition-all group",
                      isActive 
                        ? "bg-pharmav-primary text-white shadow-glow translate-x-1" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <ChevronLeft className={cn("size-4 transition-transform", isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50")} />
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <Icon className={cn("size-5", isActive ? "text-white" : "text-pharmav-primary/70")} />
                      <span className="font-bold text-sm">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}