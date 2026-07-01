import React, { useState } from "react";
import {
  Home,
  ClipboardList,
  ShoppingCart,
  Truck,
  BarChart,
  Settings,
  Pill,
  Users,
  Layers,
  Wifi,
  WifiOff,
  CloudUpload,
  BookOpen,
  Receipt,
  ChevronUp,
  Bell,
  Scale,
  FileSpreadsheet
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInput,
} from "@/components/ui/sidebar";
import { useAppStore } from "@/lib/offline-store";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { SettingsDrawer } from "@/components/settings/SettingsDrawer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const isOnline = useAppStore(s => s.isOnline);
  const offlineQueue = useAppStore(s => s.offlineQueue);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'pharmacist'>('admin');
  const offlineQueueCount = offlineQueue.length;
  const { data: alertsCount } = useQuery<{ count: number }>({
    queryKey: ['alerts-count'],
    queryFn: () => api<{ count: number }>('/api/alerts/count'),
    refetchInterval: 30000,
    enabled: isOnline
  });
  const navItems = [
    { name: "الرئيسية", icon: <Home className="size-4" />, href: "/dashboard", roles: ['admin', 'pharmacist'] },
    { name: "المخزون", icon: <ClipboardList className="size-4" />, href: "/inventory", roles: ['admin', 'pharmacist'] },
    { name: "التنبيهات", icon: <Bell className="size-4" />, href: "/alerts", roles: ['admin', 'pharmacist'], badge: alertsCount?.count },
    { name: "نقطة البيع", icon: <ShoppingCart className="size-4" />, href: "/pos", roles: ['admin', 'pharmacist'] },
    { name: "المشتريات", icon: <Truck className="size-4" />, href: "/purchases", roles: ['admin'] },
    { name: "التقارير", icon: <BarChart className="size-4" />, href: "/reports", roles: ['admin'] },
  ];
  const accountingItems = [
    { name: "دفتر الأستاذ", icon: <FileSpreadsheet className="size-4" />, href: "/ledger", roles: ['admin'] },
    { name: "ميزان المراجعة", icon: <Scale className="size-4" />, href: "/trial-balance", roles: ['admin'] },
    { name: "الحسابات", icon: <BookOpen className="size-4" />, href: "/accounts", roles: ['admin'] },
    { name: "المصاريف", icon: <Receipt className="size-4" />, href: "/expenses", roles: ['admin'] },
    { name: "الموردون", icon: <Users className="size-4" />, href: "/suppliers", roles: ['admin'] },
    { name: "الأصناف", icon: <Layers className="size-4" />, href: "/categories", roles: ['admin', 'pharmacist'] },
  ];
  const filteredNav = navItems.filter(i => i.roles.includes(userRole));
  const filteredAccounting = accountingItems.filter(i => i.roles.includes(userRole));
  return (
    <>
      <Sidebar side="right" className="border-l border-border/50">
        <SidebarHeader className="pt-6 px-6">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-pharmav-primary flex items-center justify-center text-white shadow-neon-blue">
              <Pill className="size-5" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">فارمافولت</span>
          </Link>
          <SidebarInput placeholder="بحث سريع..." className="bg-muted/50 border-none focus-visible:ring-1 ring-pharmav-primary/50 text-right" />
        </SidebarHeader>
        <SidebarContent className="px-4">
          <SidebarGroup className="mt-4">
            <div className="px-2 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">القائمة الرئيسية</div>
            <SidebarMenu>
              {filteredNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    className="hover:bg-pharmav-primary/5 hover:text-pharmav-primary transition-colors flex-row-reverse"
                  >
                    <Link to={item.href} className="flex-row-reverse justify-end w-full">
                      {item.icon}
                      <span className="font-medium mr-2 flex-1 text-right">{item.name}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge variant="destructive" className="ml-auto mr-1 h-5 min-w-5 justify-center px-1 font-bold">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          {filteredAccounting.length > 0 && (
            <SidebarGroup className="mt-4">
              <div className="px-2 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">المالية والإعداد</div>
              <SidebarMenu>
                {filteredAccounting.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.href}
                      className="hover:bg-pharmav-primary/5 hover:text-pharmav-primary transition-colors flex-row-reverse"
                    >
                      <Link to={item.href} className="flex-row-reverse justify-end w-full">
                        {item.icon}
                        <span className="font-medium mr-2">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter className="p-4 space-y-4">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 flex-row-reverse",
            isOnline ? "bg-green-500/5 border-green-500/20" : "bg-orange-500/5 border-orange-500/20"
          )}>
            <div className="flex-row-reverse flex items-center gap-2">
              {isOnline ? (
                <Wifi className="size-4 text-green-500" />
              ) : (
                <WifiOff className="size-4 text-orange-500" />
              )}
              <ThemeToggle className="static" />
            </div>
            <div className="flex-1 text-[10px] text-right">
              <div className="font-bold flex flex-row-reverse items-center justify-between">
                {isOnline ? 'متزامن مع السحابة' : 'وضع العمل بدون اتصال'}
                {offlineQueueCount > 0 && (
                  <span className="flex items-center gap-1 animate-pulse text-pharmav-primary">
                    <CloudUpload className="size-3" /> {offlineQueueCount}
                  </span>
                )}
              </div>
              <div className="text-muted-foreground/70 tracking-tighter uppercase">
                {isOnline ? 'جميع البيانات مؤمنة' : `هناك ${offlineQueueCount} عملية معلقة`}
              </div>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="h-14 p-2 bg-muted/30 rounded-xl flex-row-reverse hover:bg-muted/50 transition-colors">
                    <Avatar className="size-10 rounded-lg">
                      <AvatarFallback className="bg-pharmav-primary text-white font-bold">SS</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-right mr-3 overflow-hidden">
                      <div className="text-xs font-bold truncate">د. سارة سميث</div>
                      <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-pharmav-primary/10 text-pharmav-primary border-none">
                        {userRole === 'admin' ? 'مدير النظام' : 'صيدلي'}
                      </Badge>
                    </div>
                    <ChevronUp className="size-4 text-muted-foreground" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" className="w-56">
                  <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b mb-1 text-right">تغيير الدور (تجريبي)</div>
                  <DropdownMenuItem onClick={() => setUserRole('admin')} className="flex items-center justify-between flex-row-reverse">
                    <span>مدير النظام</span>
                    {userRole === 'admin' && <Pill className="size-3 text-pharmav-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setUserRole('pharmacist')} className="flex items-center justify-between flex-row-reverse">
                    <span>صيدلي</span>
                    {userRole === 'pharmacist' && <Pill className="size-3 text-pharmav-primary" />}
                  </DropdownMenuItem>
                  <div className="h-px bg-border my-1" />
                  <DropdownMenuItem onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2 flex-row-reverse">
                    <Settings className="size-4" />
                    <span className="flex-1 text-right">إعدادات النظام</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SettingsDrawer open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}