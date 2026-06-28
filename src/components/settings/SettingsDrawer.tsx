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
  Printer, 
  Building2, 
  CreditCard, 
  CloudUpload, 
  CloudDownload, 
  Settings2, 
  Smartphone,
  Globe,
  Lock,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/offline-store';
import { useBackup } from '@/hooks/use-backup';
import { useTheme } from '@/hooks/use-theme';
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
          <SheetDescription className="text-white/80">تخصيص هوية الصيدلية، إدارة النسخ الاحتياطي، وتفضيلات الجهاز.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-8 space-y-10 h-[calc(100vh-160px)]">
          {/* Section 1: Pharmacy Profile */}
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
          {/* Section 2: Backup & Recovery */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 flex-row-reverse">
              <Shield className="size-4" /> الأمان والنسخ الاحتياطي
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
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3">
              <div className="flex items-center gap-2 text-blue-600 flex-row-reverse">
                <Smartphone className="size-4" />
                <span className="text-xs font-bold">تكامل السحابية قريباً</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" disabled className="text-[10px] h-8 bg-blue-500/10 opacity-50">النسخ لـ Google Drive</Button>
                <Button variant="ghost" disabled className="text-[10px] h-8 bg-blue-500/10 opacity-50">الاستعادة من Google Drive</Button>
              </div>
            </div>
          </div>
          {/* Section 3: Subscription Status */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 flex-row-reverse">
              <CreditCard className="size-4" /> الترخيص والاشتراك
            </h3>
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-pharmav-primary/90 to-pharmav-primary text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-y-[-50%] translate-x-[-50%]" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <Badge className="bg-white/20 text-white border-none">الباقة الاحترافية</Badge>
                  <span className="text-2xl font-display font-bold">V 2.5 STABLE</span>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-white/70 text-xs">تاريخ انتهاء الترخيص</p>
                  <p className="text-lg font-bold">25 ديسمبر 2024</p>
                </div>
                <Button className="w-full bg-white text-pharmav-primary hover:bg-white/90 font-bold rounded-xl mt-4">تجديد الاشتراك</Button>
              </div>
            </div>
          </div>
          {/* Section 4: System Preferences */}
          <div className="space-y-6 pb-10">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 flex-row-reverse">
              <Globe className="size-4" /> تفضيلات النظام
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
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl flex-row-reverse border">
                <div className="text-right">
                  <div className="font-bold text-sm">اللغة الافتراضية</div>
                </div>
                <Badge variant="outline">العربية (افتراضي)</Badge>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}