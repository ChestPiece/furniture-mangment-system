'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Factory,
  Truck,
  Wallet,
  Package,
  Settings,
} from 'lucide-react'
import { logout } from '@/app/(auth)/actions'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface SidebarProps {
  user: {
    email: string
    name?: string
    roles?: string[]
  }
  branding?: {
    name?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logo?: any
  } | null
}

const navGroups = [
  {
    group: 'Overview',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    ],
  },
  {
    group: 'Operations',
    items: [
      { title: 'Inventory', href: '/dashboard/products', icon: Package },
      { title: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
      { title: 'Production', href: '/dashboard/production', icon: Factory },
      { title: 'Deliveries', href: '/dashboard/deliveries', icon: Truck },
    ],
  },
  {
    group: 'Management',
    items: [
      { title: 'Customers', href: '/dashboard/customers', icon: Users },
      { title: 'Finance', href: '/dashboard/finance', icon: Wallet },
      { title: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
]

export function AppSidebar({ user, branding }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-card text-card-foreground">
      {/* Header */}
      <div
        className={cn(
          'flex h-16 items-center border-b px-4',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight truncate bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {branding?.name || 'Furniture POS'}
          </span>
        )}
        <div className={cn('flex items-center', collapsed && 'w-full justify-center')}>
          {collapsed && <span className="font-bold text-xl text-indigo-600">FP</span>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {navGroups.map((group, idx) => (
          <div key={idx} className={cn('mb-6 px-3', collapsed ? 'px-2' : 'px-3')}>
            {!collapsed && (
              <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.group}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground',
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground',
                      collapsed && 'justify-center px-2',
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <item.icon className={cn('h-4 w-4', isActive && 'text-primary')} />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                )
              })}
            </div>
            {/* Divider between groups when collapsed to separate visually */}
            {collapsed && idx < navGroups.length - 1 && (
              <div className="my-2 border-t w-full opacity-50" />
            )}
          </div>
        ))}
      </div>

      {/* Footer / User Profile */}
      <div className="border-t p-4 bg-muted/20">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar className="h-9 w-9 border ring-2 ring-background">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user.email.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {user.email.split('@')[0]}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.roles?.includes('owner') ? 'Owner' : user.roles?.join(', ')}
              </span>
            </div>
          )}
          {!collapsed && (
            <form action={logout} className="flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </form>
          )}
        </div>
        {collapsed && (
          <div className="mt-2 flex justify-center">
            <form action={logout}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar (Drawer) */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-4 z-40 lg:hidden bg-white/80 backdrop-blur-sm border shadow-sm"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] max-w-[300px] p-0 border-r">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-10',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <div className="absolute -right-3 top-20 hidden lg:flex">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent text-muted-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </Button>
        </div>
      </aside>

      {/* Spacer for main content to offset fixed sidebar */}
      <div
        className={cn(
          'hidden lg:block transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64',
        )}
      />
    </>
  )
}
