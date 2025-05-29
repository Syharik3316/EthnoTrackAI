'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { MountainSnow, Map, Route, BookOpenText, Mic, Sparkles, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname();
  const appName = "EthnoTrack AI";

  const navItems = [
    { href: '/dashboard', label: "Интерактивная Карта", icon: Map },
    { href: '/route-planner', label: "Планировщик Маршрута", icon: Route },
    { href: '/journal', label: "Цифровой Дневник", icon: BookOpenText },
    { href: '/voice-notes', label: "Голосовые Заметки", icon: Mic },
    { href: '/ai-guide', label: "AI Гид", icon: Sparkles },
  ];

  const bottomNavItems = [
    { href: '/settings', label: "Настройки", icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between p-2">
           <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
            <MountainSnow className="h-6 w-6 text-sidebar-primary" />
            <span className="group-data-[collapsible=icon]:hidden">{appName}</span>
          </Link>
          <div className="group-data-[collapsible=icon]:hidden">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarMenu className="p-2">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior={false} passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  tooltip={item.label}
                  className={cn(
                    "justify-start",
                    (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/80"
                  )}
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t border-sidebar-border p-2">
        <SidebarMenu>
           {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior={false} passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                  className="justify-start"
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={"Выйти"} className="justify-start">
                <LogOut className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">{"Выйти"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
