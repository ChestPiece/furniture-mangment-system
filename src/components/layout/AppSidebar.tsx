'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Settings,
  Menu,
  X,
  ChevronLeft,
  LogOut,
  Truck,
  Factory,
  ClipboardList,
  FileText,
  Warehouse,
  DollarSign,
  BarChart3,
  Wallet, // Added Wallet import
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthActions } from '@convex-dev/auth/react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button' // Import Button
import { Avatar, AvatarFallback } from '@/components/ui/avatar' // Import Avatar

interface SidebarProps {
  user?: any // Kept for compatibility, but ignored in favor of Convex
  branding?: any
}

export function AppSidebar({ user: initialUser, branding }: SidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { signOut } = useAuthActions()
  const user = useQuery(api.users.viewer)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const menuItems = [
    {
      title: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Orders',
      href: '/dashboard/orders',
      icon: ShoppingCart,
    },
    {
      title: 'Job Cards',
      href: '/dashboard/job-cards',
      icon: ClipboardList,
    },
    {
      title: 'Production',
      href: '/dashboard/production',
      icon: Factory,
    },
    {
      title: 'Inventory',
      href: '/dashboard/products',
      icon: Package,
    },
    {
      title: 'Warehouses',
      href: '/dashboard/warehouses',
      icon: Warehouse,
    },
    {
      title: 'Purchase Orders',
      href: '/dashboard/purchase-orders',
      icon: FileText,
    },
    {
      title: 'Suppliers',
      href: '/dashboard/suppliers',
      icon: Truck,
    },
    {
      title: 'Customers',
      href: '/dashboard/customers',
      icon: Users,
    },
    {
      title: 'Deliveries',
      href: '/dashboard/deliveries',
      icon: Truck,
    },
    {
      title: 'Finance',
      href: '/dashboard/finance',
      icon: DollarSign,
    },
    {
      title: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 transition-all duration-300 md:relative',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          isCollapsed ? 'w-20' : 'w-64',
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header / Branding */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
            {!isCollapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate font-heading">
                {branding?.companyName || 'FurnitureOS'}
              </span>
            )}
            {isCollapsed && <span className="text-xl font-bold text-blue-600 mx-auto">F</span>}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft
                size={16}
                className={cn('transition-transform', isCollapsed && 'rotate-180')}
              />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              // Quick fix for dashboard root match
              const isExactDashboard = item.href === '/dashboard' && pathname === '/dashboard'
              const isActiveLink = item.href === '/dashboard' ? isExactDashboard : isActive

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden',
                    isActiveLink
                      ? 'bg-blue-50 text-blue-700 font-medium shadow-sm ring-1 ring-blue-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    isCollapsed && 'justify-center px-2',
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  {isActiveLink && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                  )}
                  <item.icon
                    size={20}
                    className={cn(
                      'transition-colors',
                      isActiveLink ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600',
                    )}
                  />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-100">
            {user === undefined ? (
              // Loading state
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-slate-200" />
                {!isCollapsed && (
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-20" />
                    <div className="h-3 bg-slate-200 rounded w-28" />
                  </div>
                )}
              </div>
            ) : user === null ? (
              // Not logged in
              <div className="text-center">
                <Link href="/login" className="text-sm font-medium text-blue-600 hover:underline">
                  {!isCollapsed && 'Sign In'}
                </Link>
              </div>
            ) : (
              // Logged in
              <div
                className={cn('flex items-center gap-3', isCollapsed && 'flex-col justify-center')}
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold border border-blue-200 shadow-sm">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                )}
                <button
                  onClick={() => signOut()}
                  className={cn(
                    'p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors',
                    isCollapsed && 'mt-2',
                  )}
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
