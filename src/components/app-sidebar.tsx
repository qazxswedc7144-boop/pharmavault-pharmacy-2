import React from "react";
import {
  Home,
  ClipboardList,
  ShoppingCart,
  Truck,
  FileText,
  Settings,
  Pill,
  Users,
  Layers
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
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const navItems = [
    { name: "Dashboard", icon: <Home className="size-4" />, href: "/dashboard" },
    { name: "Inventory", icon: <ClipboardList className="size-4" />, href: "/inventory" },
    { name: "Categories", icon: <Layers className="size-4" />, href: "/categories" },
    { name: "Sales / POS", icon: <ShoppingCart className="size-4" />, href: "#" },
    { name: "Suppliers", icon: <Truck className="size-4" />, href: "/suppliers" },
    { name: "Staff", icon: <Users className="size-4" />, href: "#" },
    { name: "Reports", icon: <FileText className="size-4" />, href: "#" },
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
      <SidebarFooter className="p-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-muted">
              <Settings className="size-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="mt-4 text-[10px] text-muted-foreground/60 font-mono text-center">
          V2.0.4-STABLE
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}