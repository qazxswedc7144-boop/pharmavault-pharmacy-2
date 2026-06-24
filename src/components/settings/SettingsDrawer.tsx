import React, { useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Shield,
  Building2,
  Settings2,
  CloudUpload,
  CloudDownload,
  Moon,
  Sun,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/offline-store';
import { useBackup } from '@/hooks/use-backup';
import { useTheme } from '@/hooks/use-theme';
import { SubscriptionManager } from './SubscriptionManager';
interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function SettingsDrawer({ open, onOpenChange }: SettingsDrawerProps) {
  const settings = useAppStore(s => s.settings);
  const updateSettings = useAppStore(s => s.updateSettings);
  const { isDark, toggleTheme } = useTheme();
  const { exportData, restoreData } = useBackup();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) restoreData(file);
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 overflow-hidden border-l" dir="rtl">
        <SheetHeader className="p-8 bg-pharmav-primary text-white text-right">
          <div className="flex items-center gap-3 justify-end mb-2">
            <SheetTitle className="text-2xl font-display text-white">إعدادات النظام المتقدمة</SheetTitle>
            <Settings2 className="size-6" />
          </div>
          <SheetDescription className="text-white/80">تخصيص هوية الصيدلية، إدارة الاشتراك، والنسخ الاحتياطي.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-8 space-y-10 h-[calc(100vh-160px)] scrollbar-hide">
          {/* Section: Subscription Management */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 flex-row-reverse">
              <Shield className="size-4" /> خطة الاشتراك الحالية
            </h3>
            <SubscriptionManager />
          </div>
          {/* Section: Pharmacy Profile */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 flex-row-reverse">
              <Building2 className="size-4" /> هوية الصيدلية والطباعة
            </h3>
            <div className="grid gap-4">
              <div className="space-y-2 text-right">
                <Label>اسم المنشأة</Label>
                <Input
                  value={settings.name}
                  onChange={(e) => updateSettings({ name: e.target.value })}
                  className="h-12 border-2 text-right"
                />
              </div>
              <div className="space-y-2 text-right">
                <Label>عنوان الصيدلية (يظهر في الفاتورة)</Label>
                <Input
                  value={settings.address}
                  onChange={(e) => updateSettings({ address: e.target.value })}
                  className="h-12 border-2 text-right"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl flex-row-reverse border border-dashed">
                <div className="text-right">
                  <div className="font-bold text-sm">الطباعة التلقائية</div>
                  <div className="text-xs text-muted-foreground">طباعة الفاتورة فور تأكيد العملية في POS.</div>
                </div>
                <Switch
                  checked={settings.printInvoiceAuto}
                  onCheckedChange={(val) => updateSettings({ printInvoiceAuto: val })}
                />
              </div>
            </div>
          </div>
          {/* Section: Backup & Recovery */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 flex-row-reverse">
              <CloudUpload className="size-4" /> النسخ الاحتياطي والمزامنة
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 rounded-3xl border-2 hover:bg-pharmav-primary/5 hover:border-pharmav-primary/40 transition-all"
                onClick={exportData}
              >
                <CloudDownload className="size-6 text-pharmav-primary" />
                <span className="font-bold">تصدير للجهاز</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 rounded-3xl border-2 hover:bg-pharmav-primary/5 hover:border-pharmav-primary/40 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <CloudUpload className="size-6 text-pharmav-primary" />
                <span className="font-bold">استيراد من الجهاز</span>
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
            </div>
          </div>
          {/* Section: System Preferences */}
          <div className="space-y-6 pb-10">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 flex-row-reverse">
              <Globe className="size-4" /> تفضيلات المظهر
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl flex-row-reverse border">
                <div className="text-right">
                  <div className="font-bold text-sm">الوضع الليلي</div>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                  {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
                </Button>
              </div>
            </div>
            <div className="pt-8 border-t text-center space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">PharmaVault Operating System</p>
              <p className="text-[9px] text-muted-foreground">Version 2.5.0-STABLE • Build 2024.12.20</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}