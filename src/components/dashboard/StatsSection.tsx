'use client'

import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Activity } from 'lucide-react'

export function StatsSection() {
  const tenant = useQuery(api.tenants.getMine)
  const stats = useQuery(api.orders.getStats, tenant ? { tenantId: tenant._id } : 'skip')

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">+20.1% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground">+180.1% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeOrders}</div>
          <p className="text-xs text-muted-foreground">+19% from last month</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function StatsSectionFallback() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
      ))}
    </div>
  )
}
