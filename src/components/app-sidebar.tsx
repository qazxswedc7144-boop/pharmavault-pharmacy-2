import React from "react";
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
  Receipt
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const isOnline = useAppStore(s => s.isOnline);
  const offlineQueue = useAppStore(s => s.offlineQueue);
  const offlineQueueCount = offlineQueue.length;
  const navItems = [
    { name: "الرئيسية", icon: <Home className="size-4" />, href: "/dashboard" },
    { name: "المخزون", icon: <ClipboardList className="size-4" />, href: "/inventory" },
    { name: "نقطة البيع", icon: <ShoppingCart className="size-4" />, href: "/sales" },
    { name: "المشتريات", icon: <Truck className="size-4" />, href: "/purchases" },
    { name: "التقارير", icon: <BarChart className="size-4" />, href: "/reports" },
  ];
  const accountingItems = [
    { name: "الحسابات", icon: <BookOpen className="size-4" />, href: "/accounts" },
    { name: "المصاريف", icon: <Receipt className="size-4" />, href: "/expenses" },
    { name: "الموردون", icon: <Users className="size-4" />, href: "/suppliers" },
    { name: "الأصناف", icon: <Layers className="size-4" />, href: "/categories" },
  ];
  return (
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
            {navItems.map((item) => (
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
        <SidebarGroup className="mt-4">
          <div className="px-2 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">المالية والإعداد</div>
          <SidebarMenu>
            {accountingItems.map((item) => (
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
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-4">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 flex-row-reverse",
          isOnline ? "bg-green-500/5 border-green-500/20" : "bg-orange-500/5 border-orange-500/20"
        )}>
          {isOnline ? (
            <Wifi className="size-4 text-green-500" />
          ) : (
            <WifiOff className="size-4 text-orange-500" />
          )}
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
            <SidebarMenuButton asChild isActive={location.pathname === '/settings'} className="hover:bg-muted flex-row-reverse">
              <Link to="/settings" className="flex-row-reverse justify-end w-full">
                <Settings className="size-4" />
                <span className="mr-2">الإعدادات</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}