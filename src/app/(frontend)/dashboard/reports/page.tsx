'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { formatCurrency } from '@/utilities/formatCurrency'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { ShoppingBag, DollarSign, AlertCircle, Calendar } from 'lucide-react'
import { ReportsSkeleton } from '@/components/dashboard/ReportsSkeleton'
import { StatusBadge } from '@/components/ui/StatusBadge'

export const dynamic = 'force-dynamic'

export default function ReportsPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dailyStats, setDailyStats] = useState<any>(null)
  const [pendingStats, setPendingStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        const [salesRes, pendingRes] = await Promise.all([
          fetch(`/api/reports/daily-sales?date=${date}`),
          fetch(`/api/reports/pending-payments`),
        ])

        const salesData = await salesRes.json()
        const pendingData = await pendingRes.json()

        setDailyStats(salesData)
        setPendingStats(pendingData)
      } catch (err) {
        console.error('Failed to fetch reports', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [date])

  if (loading) {
    return <ReportsSkeleton />
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-heading">Reports</h1>
      </div>

      {/* Daily Sales Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
          <CardTitle className="text-lg font-medium">Daily Sales</CardTitle>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-[160px] h-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatsCard
                title="Total Orders"
                value={dailyStats?.totalOrders || 0}
                icon={ShoppingBag}
              />
              <StatsCard
                title="Total Revenue"
                value={formatCurrency(dailyStats?.totalSales || 0)}
                icon={DollarSign}
                className="text-green-600"
              />
            </div>

            {dailyStats?.orders?.length > 0 && (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="py-2">Order ID</TableHead>
                      <TableHead className="py-2">Total</TableHead>
                      <TableHead className="py-2">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyStats.orders.map((order: any) => (
                      <TableRow key={order.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs">#{order.id.slice(-6)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} className="scale-90 origin-left" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {(!dailyStats?.orders || dailyStats.orders.length === 0) && (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                No sales recorded for this date.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Payments Section */}
      <Card>
        <CardHeader className="pb-2 border-b border-border">
          <CardTitle className="text-lg font-medium">Pending Payments</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatsCard
                title="Pending Orders"
                value={pendingStats?.pendingPaymentCount || 0}
                icon={AlertCircle}
                className="bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30"
              />
              <StatsCard
                title="Total Amount Due"
                value={formatCurrency(pendingStats?.totalPendingAmount || 0)}
                icon={DollarSign}
                className="bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400"
              />
            </div>

            {pendingStats?.orders?.length > 0 ? (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="py-2">Order ID</TableHead>
                      <TableHead className="py-2">Customer</TableHead>
                      <TableHead className="py-2">Total</TableHead>
                      <TableHead className="py-2">Due Amount</TableHead>
                      <TableHead className="text-right py-2">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingStats.orders.map((order: any) => (
                      <TableRow key={order.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs">#{order.id.slice(-6)}</TableCell>
                        <TableCell className="font-medium">{order.customerName}</TableCell>
                        <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            {formatCurrency(order.dueAmount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="text-sm font-medium hover:underline text-primary"
                          >
                            View
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                No pending payments found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
