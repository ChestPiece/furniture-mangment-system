import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle, Users, ShoppingCart, DollarSign, Clock, ArrowRight } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/StatusBadge'

// Mock Data (Replace with real data fetching later)
const recentOrders: any[] = [] // Set to [] to test empty state
const stats = {
  todaySales: 0,
  pendingPayments: 0,
  activeOrders: 0,
}

export default function DashboardPage() {
  const hasOrders = recentOrders.length > 0

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Good Morning!</h1>
          <p className="text-muted-foreground mt-1">
            Here is what is happening in your shop today.
          </p>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button asChild className="flex-1 sm:flex-none text-white">
            <Link href="/dashboard/orders/new">
              <PlusCircle className=" h-4 w-4 text-white" />
              <span className="text-white">New Order</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 sm:flex-none ">
            <Link href="/dashboard/customers/new">
              <Users className="mr-2 h-4 w-4" /> Add Customer
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Today's Sales"
          value={`$${stats.todaySales}`}
          icon={DollarSign}
          description="Total collected today"
          // trend={{ value: 12, label: 'from yesterday', direction: 'up' }}
        />
        <StatsCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={Clock}
          description="Orders with due amount"
          className="border-yellow-200 bg-yellow-50/30 dark:border-yellow-900/50 dark:bg-yellow-900/10"
        />
        <StatsCard
          title="Active Orders"
          value={stats.activeOrders}
          icon={ShoppingCart}
          description="In progress or pending"
          linkUrl="/dashboard/orders"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-6">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">Recent Orders</CardTitle>
              <CardDescription>Latest orders placed in your shop.</CardDescription>
            </div>
            {hasOrders && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/orders">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {hasOrders ? (
              <div className="space-y-4">
                {recentOrders.map((order, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{order.customerName}</span>
                      <span className="text-xs text-muted-foreground">{order.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={order.status} />
                      <span className="font-bold text-sm">${order.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No orders yet"
                description="You haven't created any orders yet. Start by creating a new one."
                icon={ShoppingCart}
                actionLabel="Create First Order"
                actionUrl="/dashboard/orders/new"
                className="h-[200px]"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
