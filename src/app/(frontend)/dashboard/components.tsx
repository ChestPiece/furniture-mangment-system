import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  PlusCircle,
  Users,
  ShoppingCart,
  DollarSign,
  ArrowRight,
  Activity,
  CreditCard,
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency } from '@/utilities/formatCurrency'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { ErrorState } from '@/components/ui/ErrorState'
import { StatsCardsRowSkeleton, TableSkeleton } from '@/components/skeletons'

// ============================================================================
// STATS SECTION COMPONENT
// ============================================================================

export async function StatsSection() {
  try {
    const payload = await getPayload({ config: configPromise })
    const headersList = await headers()
    const { user } = await payload.auth({ headers: headersList })

    if (!user?.tenant) {
      return null
    }

    const { docs: orders } = await payload.find({
      collection: 'orders',
      where: {
        tenant: { equals: user.tenant },
      },
      sort: '-createdAt',
      limit: 100,
      depth: 1,
    })

    // Calculate stats
    const today = new Date().toISOString().split('T')[0]
    const todayOrders = orders.filter(
      (o) => new Date(o.orderDate).toISOString().split('T')[0] === today
    )

    const todaySales = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

    const pendingPaymentsCount = orders.filter((o) => {
      const total = o.totalAmount || 0
      const advance = o.advancePaid || 0
      const remaining = o.remainingPaid || 0
      const due = total - advance - remaining
      return due > 0
    }).length

    const activeOrdersCount = orders.filter(
      (o) => o.status === 'pending' || o.status === 'in_progress'
    ).length

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
        <StatsCard
          title="Today's Sales"
          value={<AnimatedCounter value={todaySales} prefix="Rs. " />}
          icon={DollarSign}
          description="Total revenue collected today"
          className="delay-100"
          iconClassName="bg-blue-500/10 text-blue-600"
          trend={{ value: 12, label: 'vs yesterday', direction: 'up' }}
        />
        <StatsCard
          title="Active Orders"
          value={<AnimatedCounter value={activeOrdersCount} />}
          icon={ShoppingCart}
          description="Orders in progress"
          className="delay-200"
          linkUrl="/dashboard/orders"
          iconClassName="bg-violet-500/10 text-violet-600"
          trend={{ value: 4, label: 'new today', direction: 'up' }}
        />
        <StatsCard
          title="Pending Payments"
          value={<AnimatedCounter value={pendingPaymentsCount} />}
          icon={CreditCard}
          description="Unpaid orders needing attention"
          className="delay-300"
          iconClassName="bg-amber-500/10 text-amber-600"
          trend={{ value: 0, label: 'all good', direction: 'neutral' }}
        />
      </div>
    )
  } catch (error) {
    console.error('Error loading stats:', error)
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Today's Sales"
          value="Error"
          icon={DollarSign}
          description="Failed to load stats"
        />
        <StatsCard
          title="Active Orders"
          value="Error"
          icon={ShoppingCart}
          description="Failed to load stats"
        />
        <StatsCard
          title="Pending Payments"
          value="Error"
          icon={CreditCard}
          description="Failed to load stats"
        />
      </div>
    )
  }
}

// ============================================================================
// RECENT ORDERS COMPONENT
// ============================================================================

export async function RecentOrdersSection() {
  try {
    const payload = await getPayload({ config: configPromise })
    const headersList = await headers()
    const { user } = await payload.auth({ headers: headersList })

    if (!user?.tenant) {
      return (
        <ErrorState
          title="Unauthorized"
          message="You must be logged in to view recent orders."
        />
      )
    }

    const { docs: orders } = await payload.find({
      collection: 'orders',
      where: {
        tenant: { equals: user.tenant },
      },
      sort: '-createdAt',
      limit: 5,
      depth: 1,
    })

    const recentOrders = orders.map((order) => {
      const customerName = typeof order.customer === 'object' ? order.customer?.name : 'Unknown'
      return {
        id: order.id,
        customerName,
        date: new Date(order.orderDate).toLocaleDateString(),
        amount: order.totalAmount,
        status: order.status,
      }
    })

    const hasOrders = recentOrders.length > 0

    return (
      <Card className="border-muted/60 bg-white/50 backdrop-blur-sm shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-backwards">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-muted/20">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2 font-heading">
              <Activity className="h-5 w-5 text-primary" />
              Recent Orders
            </CardTitle>
            <CardDescription>Latest transactions from your shop.</CardDescription>
          </div>
          {hasOrders && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-primary hover:text-primary/80 hover:bg-primary/5 rounded-full px-4"
            >
              <Link href="/dashboard/orders">
                View All Orders <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {hasOrders ? (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-muted/20">
                    <TableHead className="font-semibold text-muted-foreground w-[40%]">
                      Customer
                    </TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Date</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right font-semibold text-muted-foreground">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="hover:bg-muted/30 cursor-pointer border-b border-muted/10 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                            {order.customerName.charAt(0)}
                          </div>
                          {order.customerName}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground py-4">{order.date}</TableCell>
                      <TableCell className="py-4">
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground py-4 font-mono">
                        {formatCurrency(order.amount || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No orders yet"
                description="You haven't created any orders yet. Start by creating a new one."
                icon={ShoppingCart}
                actionLabel="Create First Order"
                actionUrl="/dashboard/orders/new"
                className="h-[300px]"
              />
            </div>
          )}
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error('Error loading recent orders:', error)
    return (
      <ErrorState
        title="Error Loading Orders"
        message="There was a problem loading your recent orders. Please try again."
      />
    )
  }
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

export async function DashboardHeader() {
  try {
    const payload = await getPayload({ config: configPromise })
    const headersList = await headers()
    const { user } = await payload.auth({ headers: headersList })

    const userName = user?.email?.split('@')[0] || 'User'

    return (
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent font-heading">
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-2 text-lg font-light">
            Good morning, <span className="font-medium text-foreground">{userName}</span>.
            Here&apos;s your daily overview.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 duration-200"
          >
            <Link href="/dashboard/orders/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              New Order
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full hover:bg-muted/50 transition-all hover:scale-105 active:scale-95 duration-200 border-muted-foreground/20"
          >
            <Link href="/dashboard/customers/new">
              <Users className="mr-2 h-5 w-5" /> Add Customer
            </Link>
          </Button>
        </div>
      </div>
    )
  } catch (error) {
    // Return fallback header if auth fails
    return (
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent font-heading">
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-2 text-lg font-light">
            Welcome back! Here&apos;s your daily overview.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 duration-200"
          >
            <Link href="/dashboard/orders/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              New Order
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full hover:bg-muted/50 transition-all hover:scale-105 active:scale-95 duration-200 border-muted-foreground/20"
          >
            <Link href="/dashboard/customers/new">
              <Users className="mr-2 h-5 w-5" /> Add Customer
            </Link>
          </Button>
        </div>
      </div>
    )
  }
}

// ============================================================================
// FALLBACK COMPONENTS
// ============================================================================

export function StatsSectionFallback() {
  return <StatsCardsRowSkeleton count={3} />
}

export function RecentOrdersSectionFallback() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <TableSkeleton rows={5} columns={4} showHeader={false} />
      </CardContent>
    </Card>
  )
}
