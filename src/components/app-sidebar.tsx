import React, { useState, useMemo } from "react";
import {
  Home, ClipboardList, ShoppingCart, Truck, BarChart, Pill, Users, BookOpen, ChevronDown, ShieldCheck, Users2, HelpCircle, Code, LogOut
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInput } from "@/components/ui/sidebar";
import { useAppStore } from "@/lib/offline-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import type { Role } from "@shared/types";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const currentUser = useAppStore(s => s.currentUser);
  const setCurrentUser = useAppStore(s => s.setCurrentUser);
  const role = currentUser?.role || 'viewer';
  const navItems = useMemo(() => {
    const items = [
      { name: "الرئيسية", icon: <Home className="size-4" />, href: "/dashboard", roles: ['admin', 'pharmacist', 'viewer'] },
      { name: "المخزون", icon: <ClipboardList className="size-4" />, href: "/inventory", roles: ['admin', 'pharmacist', 'viewer'] },
      { name: "نقطة البيع", icon: <ShoppingCart className="size-4" />, href: "/pos", roles: ['admin', 'pharmacist'] },
      { name: "المشتريات", icon: <Truck className="size-4" />, href: "/purchases", roles: ['admin', 'pharmacist'] },
      { name: "الحسابات المرجعية", icon: <BarChart className="size-4" />, href: "/accounts", roles: ['admin'] },
      { name: "التقارير", icon: <BarChart className="size-4" />, href: "/reports", roles: ['admin'] },
      { name: "الموظفين", icon: <Users2 className="size-4" />, href: "/users", roles: ['admin'] },
      { name: "حول النظام", icon: <HelpCircle className="size-4" />, href: "/about", roles: ['admin', 'pharmacist', 'viewer'] },
    ];
    return items.filter(item => item.roles.includes(role));
  }, [role]);
  const handleRoleSwitch = (newRole: Role) => {
    const roles: Record<Role, string> = {
      admin: 'د/ عبدالله (مدير)',
      pharmacist: 'أحمد (صيدلي مناوب)',
      viewer: 'زائر (للعرض فقط)'
    };
    setCurrentUser({
      id: crypto.randomUUID(),
      name: roles[newRole],
      role: newRole
    });
  };
  return (
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
      <SidebarFooter className="p-4 border-t bg-muted/20">
        <div className="flex flex-col gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-accent transition-colors flex-row-reverse">
                <div className="flex items-center gap-3 flex-row-reverse">
                  {currentUser && (
                    <Avatar className="size-8 border-2 border-pharmav-primary/20">
                      <AvatarFallback className="bg-pharmav-primary text-white text-xs">
                        {currentUser.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="text-right">
                    <p className="text-xs font-bold truncate max-w-[120px]">{currentUser?.name}</p>
                    <Badge variant="outline" className="text-[9px] h-4 py-0 bg-background capitalize">
                      {role === 'admin' ? 'مدير' : role === 'pharmacist' ? 'صيدلي' : 'مشاهد'}
                    </Badge>
                  </div>
                </div>
                <ChevronDown className="size-4 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="text-right">تبديل الحساب (تجريبي)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex-row-reverse gap-2" onClick={() => handleRoleSwitch('admin')}>
                <ShieldCheck className="size-4 text-pharmav-primary" /> مدير النظام
              </DropdownMenuItem>
              <DropdownMenuItem className="flex-row-reverse gap-2" onClick={() => handleRoleSwitch('pharmacist')}>
                <Users className="size-4 text-blue-500" /> صيدلي مناوب
              </DropdownMenuItem>
              <DropdownMenuItem className="flex-row-reverse gap-2" onClick={() => handleRoleSwitch('viewer')}>
                <BookOpen className="size-4 text-muted-foreground" /> زائر للعرض
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex-row-reverse gap-2 text-rose-600">
                <LogOut className="size-4" /> تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="text-right space-y-1">
             <div className="flex items-center justify-end gap-2 text-pharmav-primary">
              <Code className="size-3" />
              <span className="text-[9px] font-bold">المطور: م/ عبدالله طاهر</span>
            </div>
            <Badge className="w-full justify-center bg-pharmav-primary/10 text-pharmav-primary border-none text-[9px] h-5">V 2.5 STABLE • RBAC ACTIVE</Badge>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}