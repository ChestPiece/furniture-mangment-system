'use client'

import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function RecentOrdersSection() {
  const tenant = useQuery(api.tenants.getMine)
  const orders = useQuery(api.orders.list, tenant ? { tenantId: tenant._id } : 'skip')

  if (!orders) {
    return <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-xl" />
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>You made {orders.length} sales this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order._id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback>OM</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">Customer ID: {order.customerId}</p>
              </div>
              <div className="ml-auto font-medium">+${order.totalAmount.toFixed(2)}</div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No recent orders found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function RecentOrdersSectionFallback() {
  return <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-xl" />
}
