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
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function ReportsPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dailyStats, setDailyStats] = useState<any>(null)
  const [pendingStats, setPendingStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [date])

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

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reports</h1>

      {/* Daily Sales Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Daily Sales</CardTitle>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-[180px]"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-4 text-center text-muted-foreground">Loading stats...</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md border bg-muted/50">
                  <span className="block text-sm font-medium text-muted-foreground">
                    Total Orders
                  </span>
                  <span className="block text-2xl font-bold text-foreground">
                    {dailyStats?.totalOrders || 0}
                  </span>
                </div>
                <div className="p-4 rounded-md border bg-muted/50">
                  <span className="block text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </span>
                  <span className="block text-2xl font-bold text-green-600">
                    {dailyStats?.totalSales || 0}
                  </span>
                </div>
              </div>

              {dailyStats?.orders?.length > 0 && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyStats.orders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id.slice(-6)}</TableCell>
                          <TableCell>{order.total}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{order.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Payments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-4 text-center text-muted-foreground">
              Loading pending payments...
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md border bg-red-50 dark:bg-red-900/20">
                  <span className="block text-sm font-medium text-red-800 dark:text-red-300">
                    Pending Orders
                  </span>
                  <span className="block text-2xl font-bold text-red-900 dark:text-red-100">
                    {pendingStats?.pendingPaymentCount || 0}
                  </span>
                </div>
                <div className="p-4 rounded-md border bg-red-50 dark:bg-red-900/20">
                  <span className="block text-sm font-medium text-red-800 dark:text-red-300">
                    Total Amount Due
                  </span>
                  <span className="block text-2xl font-bold text-red-900 dark:text-red-100">
                    {pendingStats?.totalPendingAmount || 0}
                  </span>
                </div>
              </div>

              {pendingStats?.orders?.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Due Amount</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingStats.orders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id.slice(-6)}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{order.totalAmount}</TableCell>
                          <TableCell className="text-destructive font-bold">
                            {order.dueAmount}
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
                <div className="text-center py-8 text-muted-foreground">
                  No pending payments found.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
