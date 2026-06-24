import React from 'react';
import { Shield, Wifi, Database, Info, Moon, Sun, Lock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/offline-store';
import { useTheme } from '@/hooks/use-theme';
import { toast } from 'sonner';
export function SettingsPage() {
  const loginLockEnabled = useAppStore(s => s.loginLockEnabled);
  const setLoginLockEnabled = useAppStore(s => s.setLoginLockEnabled);
  const pin = useAppStore(s => s.pin);
  const setPin = useAppStore(s => s.setPin);
  const offlineQueue = useAppStore(s => s.offlineQueue);
  const isOnline = useAppStore(s => s.isOnline);
  const { isDark, toggleTheme } = useTheme();
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
  };
  return (
    <AppLayout container>
      <div className="max-w-4xl mx-auto space-y-8 text-right" dir="rtl">
        <div>
          <h1 className="text-3xl font-display font-bold">الإعدادات</h1>
          <p className="text-muted-foreground">تخصيص تفضيلات وأمان نظام فارمافولت.</p>
        </div>
        <Card className="glass-card overflow-hidden">
          <CardHeader className="bg-muted/30 text-right">
            <div className="flex items-center justify-end gap-2">
              <CardTitle className="text-lg">الأمان والخصوصية</CardTitle>
              <Shield className="size-5 text-pharmav-primary" />
            </div>
            <CardDescription>قم بتأمين بيانات الصيدلية باستخدام رمز مرور خاص.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between flex-row-reverse">
              <div className="space-y-0.5 text-right">
                <Label className="text-base">قفل الدخول</Label>
                <p className="text-sm text-muted-foreground">طلب رمز المرور عند فتح التطبيق.</p>
              </div>
              <Switch
                checked={loginLockEnabled}
                onCheckedChange={setLoginLockEnabled}
              />
            </div>
            {loginLockEnabled && (
              <div className="animate-in slide-in-from-top-2 duration-200 p-4 bg-muted/30 rounded-xl border border-dashed text-right">
                <Label className="text-base mb-2 block">تعيين رمز مرور (4 أرقام)</Label>
                <div className="flex items-center justify-end gap-4">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>حفظ تلقائي</span>
                    <Lock className="size-4" />
                  </div>
                  <Input
                    type="password"
                    placeholder="****"
                    className="max-w-[200px] text-center tracking-[1rem] font-bold text-xl h-12"
                    value={pin || ''}
                    onChange={handlePinChange}
                    maxLength={4}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="bg-muted/30 text-right">
            <div className="flex items-center justify-end gap-2">
              <CardTitle className="text-lg">العمل بدون اتصال والمزامنة</CardTitle>
              <Wifi className="size-5 text-blue-500" />
            </div>
            <CardDescription>متابعة حالة الاتصال والعمليات المعلقة للمزامنة السحابية.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border flex-row-reverse">
              <div className="flex items-center gap-4 flex-row-reverse">
                <div className={`size-3 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-orange-500'}`} />
                <div className="text-right">
                  <div className="font-bold">{isOnline ? 'متصل بالإنترنت' : 'يعمل بدون اتصال'}</div>
                  <div className="text-xs text-muted-foreground">{isOnline ? 'جميع البيانات متزامنة مع السحابة' : 'يتم الحفظ في الذاكرة المحلية'}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info('يتم التحقق من التحديثات...')}>تحديث الحالة</Button>
            </div>
            <div className="flex items-center justify-between flex-row-reverse">
              <div className="flex items-center gap-3 flex-row-reverse">
                <Database className="size-5 text-muted-foreground" />
                <div className="space-y-0.5 text-right">
                  <Label className="text-base">العمليات المعلقة</Label>
                  <p className="text-sm text-muted-foreground">عمليات بانتظار المزامنة عند توفر الاتصال.</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {offlineQueue.length} عملية
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="bg-muted/30 text-right">
            <div className="flex items-center justify-end gap-2">
              <CardTitle className="text-lg">تفضيلات التطبيق</CardTitle>
              <Info className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between flex-row-reverse">
              <div className="space-y-0.5 text-right">
                <Label className="text-base">الوضع الليلي</Label>
                <p className="text-sm text-muted-foreground">تبديل مظهر الواجهة للراحة البصرية.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </Button>
            </div>
            <div className="pt-8 border-t text-xs text-muted-foreground flex justify-between flex-row-reverse">
              <span>الإصدار: 2.5.0-STABLE</span>
              <span>© {new Date().getFullYear()} فارمافولت للأنظمة التقنية</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}