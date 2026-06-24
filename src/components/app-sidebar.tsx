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
  CloudUpload
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
    { name: "Dashboard", icon: <Home className="size-4" />, href: "/dashboard" },
    { name: "Inventory", icon: <ClipboardList className="size-4" />, href: "/inventory" },
    { name: "Categories", icon: <Layers className="size-4" />, href: "/categories" },
    { name: "Sales / POS", icon: <ShoppingCart className="size-4" />, href: "/sales" },
    { name: "Purchases", icon: <Truck className="size-4" />, href: "/purchases" },
    { name: "Suppliers", icon: <Users className="size-4" />, href: "/suppliers" },
    { name: "Reports", icon: <BarChart className="size-4" />, href: "/reports" },
  ];
  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="pt-6 px-6">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-pharmav-primary flex items-center justify-center text-white shadow-neon-blue">
            <Pill className="size-5" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">PharmaVault</span>
        </Link>
        <SidebarInput placeholder="Quick search..." className="bg-muted/50 border-none focus-visible:ring-1 ring-pharmav-primary/50" />
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarGroup className="mt-4">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.href}
                  className="hover:bg-pharmav-primary/5 hover:text-pharmav-primary transition-colors"
                >
                  <Link to={item.href}>
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-4">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
          isOnline ? "bg-green-500/5 border-green-500/20" : "bg-orange-500/5 border-orange-500/20"
        )}>
          {isOnline ? (
            <Wifi className="size-4 text-green-500" />
          ) : (
            <WifiOff className="size-4 text-orange-500" />
          )}
          <div className="flex-1 text-[10px]">
            <div className="font-bold flex items-center justify-between">
              {isOnline ? 'CLOUD SYNCED' : 'OFFLINE MODE'}
              {offlineQueueCount > 0 && (
                <span className="flex items-center gap-1 animate-pulse text-pharmav-primary">
                  <CloudUpload className="size-3" /> {offlineQueueCount}
                </span>
              )}
            </div>
            <div className="text-muted-foreground/70 uppercase tracking-tighter">
              {isOnline ? 'All records secure' : `${offlineQueueCount} items pending`}
            </div>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/settings'} className="hover:bg-muted">
              <Link to="/settings">
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="text-[10px] text-muted-foreground/60 font-mono text-center">
          V2.2.0-STABLE
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}