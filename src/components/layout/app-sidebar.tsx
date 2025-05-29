'use client';

// import Link from 'next/link'; // Use next-intl Link
import { Link, usePathname } from '@/navigation'; // Use next-intl Link and usePathname
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Sidebar');
  const tApp = useTranslations(); // For EthnoTrackAI

  const navItems = [
    { href: '/dashboard', labelKey: 'interactiveMap', icon: Map },
    { href: '/route-planner', labelKey: 'routePlanner', icon: Route },
    { href: '/journal', labelKey: 'digitalJournal', icon: BookOpenText },
    { href: '/voice-notes', labelKey: 'voiceNotes', icon: Mic },
    { href: '/ai-guide', labelKey: 'aiGuide', icon: Sparkles },
  ];

  const bottomNavItems = [
    { href: '/settings', labelKey: 'settings', icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between p-2">
           <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
            <MountainSnow className="h-6 w-6 text-sidebar-primary" />
            <span className="group-data-[collapsible=icon]:hidden">{tApp('EthnoTrackAI')}</span>
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
                  tooltip={t(item.labelKey)}
                  className={cn(
                    "justify-start",
                    (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/80"
                  )}
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{t(item.labelKey)}</span>
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
                  tooltip={t(item.labelKey)}
                  className="justify-start"
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{t(item.labelKey)}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={t('logout')} className="justify-start">
                <LogOut className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">{t('logout')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
