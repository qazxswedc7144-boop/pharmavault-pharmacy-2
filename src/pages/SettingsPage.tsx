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
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure PharmaVault security and preferences.</p>
        </div>
        <Card className="glass-card overflow-hidden">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-pharmav-primary" />
              <CardTitle className="text-lg">Security & Privacy</CardTitle>
            </div>
            <CardDescription>Secure your pharmacy data with an optional PIN lock.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Login Lock</Label>
                <p className="text-sm text-muted-foreground">Require a PIN every time the app starts.</p>
              </div>
              <Switch
                checked={loginLockEnabled}
                onCheckedChange={setLoginLockEnabled}
              />
            </div>
            {loginLockEnabled && (
              <div className="animate-in slide-in-from-top-2 duration-200 p-4 bg-muted/30 rounded-xl border border-dashed">
                <Label className="text-base mb-2 block">Set 4-Digit PIN</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="password"
                    placeholder="Enter 4 digits"
                    className="max-w-[200px] text-center tracking-[1rem] font-bold text-xl h-12"
                    value={pin || ''}
                    onChange={handlePinChange}
                    maxLength={4}
                  />
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lock className="size-4" /> Auto-saved
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center gap-2">
              <Wifi className="size-5 text-blue-500" />
              <CardTitle className="text-lg">Offline & Synchronization</CardTitle>
            </div>
            <CardDescription>Monitor your connectivity and pending data syncs.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
              <div className="flex items-center gap-4">
                <div className={`size-3 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-orange-500'}`} />
                <div>
                  <div className="font-bold">{isOnline ? 'Online' : 'Offline'}</div>
                  <div className="text-xs text-muted-foreground">{isOnline ? 'Connected to Cloud' : 'Using local cache'}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info('Checking for updates...')}>Refresh</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="size-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label className="text-base">Pending Sync</Label>
                  <p className="text-sm text-muted-foreground">Transactions waiting for cloud sync.</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {offlineQueue.length} items
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center gap-2">
              <Info className="size-5 text-muted-foreground" />
              <CardTitle className="text-lg">Application</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Adjust the interface for better visibility.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </Button>
            </div>
            <div className="pt-4 border-t text-xs text-muted-foreground flex justify-between">
              <span>Version: 2.1.0-STABLE</span>
              <span>© {new Date().getFullYear()} PharmaVault Systems</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}