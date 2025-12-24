"use client"

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Code, 
  PanelLeft,
  LayoutDashboard, 
  Folder, 
  Share2, 
  Settings, 
  HelpCircle,
  FileText,
  User,
  Shield
} from 'lucide-react'
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarSeparator
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/constants'

const mainNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'My Projects', icon: Folder },
  { href: '/dashboard/shared', label: 'Shared with me', icon: Share2 },
  { href: '/dashboard/templates', label: 'Templates', icon: FileText },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
]

const footerNav = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/help', label: 'Help & Support', icon: HelpCircle },
  { href: '/admin/login', label: 'Admin Panel', icon: Shield },
]

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const isCollapsed = state === 'collapsed'

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-sidebar-foreground">
                <Code className="size-6" />
                {!isCollapsed && <span>{APP_NAME}</span>}
            </Link>
            {!isCollapsed && (
                <Button variant="ghost" size="icon" className="size-7" onClick={toggleSidebar}>
                    <PanelLeft />
                </Button>
            )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarMenu>
            {mainNav.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
         <SidebarSeparator />
         <SidebarGroup>
          <SidebarMenu>
            {footerNav.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </>
  )
}
