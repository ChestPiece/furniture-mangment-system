'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  PieChart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
// import { Separator } from '@/components/ui/separator' // Removed unused import
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

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Customers',
    href: '/dashboard/customers',
    icon: Users,
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: PieChart,
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
          <span className="font-bold text-lg tracking-tight truncate">
            {branding?.name || 'Furniture Shop'}
          </span>
        )}
        <div className={cn('flex items-center', collapsed && 'w-full justify-center')}>
          {/* Logo could go here if we had one separate from name */}
          {collapsed && <span className="font-bold text-xl">FS</span>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4">
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href))
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
                  collapsed && 'justify-center px-2',
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div className="border-t p-4">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar className="h-9 w-9 border">
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.email.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{user.email}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.roles?.includes('owner') ? 'Owner' : user.roles?.join(', ')}
              </span>
            </div>
          )}
          {!collapsed && (
            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <Link href="/admin/logout" title="Logout">
                <LogOut className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        {collapsed && (
          <div className="mt-2 flex justify-center">
            <Link href="/admin/logout" title="Logout">
              <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Link>
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
            <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-40 lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] max-w-[300px] p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden border-r bg-background transition-all duration-300 lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-10',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <div className="absolute -right-3 top-20 hidden lg:flex">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-full border bg-background shadow-md"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </Button>
        </div>
      </aside>

      {/* Spacer for main content to offset fixed sidebar */}
      <div
        className={cn('hidden lg:block transition-all duration-300', collapsed ? 'w-16' : 'w-64')}
      />
    </>
  )
}
