import React, { useState } from "react";
import {
  Home, ClipboardList, ShoppingCart, Truck, BarChart, Settings, Pill, Users, Layers, Wifi, WifiOff, BookOpen, Receipt, ChevronUp, Bell, Scale, FileSpreadsheet, Users2, HelpCircle, Code
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInput } from "@/components/ui/sidebar";
import { useAppStore } from "@/lib/offline-store";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { SettingsDrawer } from "@/components/settings/SettingsDrawer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const isOnline = useAppStore(s => s.isOnline);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'pharmacist'>('admin');
  const navItems = [
    { name: "الرئيسية", icon: <Home className="size-4" />, href: "/dashboard", roles: ['admin', 'pharmacist'] },
    { name: "المخزون", icon: <ClipboardList className="size-4" />, href: "/inventory", roles: ['admin', 'pharmacist'] },
    { name: "نقطة البيع", icon: <ShoppingCart className="size-4" />, href: "/pos", roles: ['admin', 'pharmacist'] },
    { name: "المشتريات", icon: <Truck className="size-4" />, href: "/purchases", roles: ['admin'] },
    { name: "التقارير", icon: <BarChart className="size-4" />, href: "/reports", roles: ['admin'] },
    { name: "حول النظام", icon: <HelpCircle className="size-4" />, href: "/about", roles: ['admin', 'pharmacist'] },
  ];
  return (
    <>
      <Sidebar side="right" className="border-l border-border/50 shadow-xl">
        <SidebarHeader className="pt-6 px-6">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-pharmav-primary flex items-center justify-center text-white shadow-neon-blue rotate-3">
              <Pill className="size-5" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">فارمافولت</span>
          </Link>
          <SidebarInput placeholder="بحث سريع..." className="text-right" />
        </SidebarHeader>
        <SidebarContent className="px-4">
          <SidebarGroup className="mt-4">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href} className="flex-row-reverse">
                    <Link to={item.href} className="flex-row-reverse justify-end w-full">
                      {item.icon}<span className="font-medium mr-2 flex-1 text-right">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-6 border-t bg-muted/20">
          <div className="text-right space-y-4">
            <div className="flex items-center justify-end gap-2 text-pharmav-primary">
              <Code className="size-4" />
              <span className="text-[10px] font-bold">مطور النظام</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold font-display">د/ عبدالله طاهر مفرح</p>
              <p className="text-[10px] text-muted-foreground font-mono">772093714</p>
            </div>
            <Badge className="w-full justify-center bg-pharmav-primary/10 text-pharmav-primary border-none text-[9px] h-5">V 2.5 STABLE • 2026</Badge>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SettingsDrawer open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}