import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlusCircle, Pencil } from 'lucide-react'
import { ErrorState } from '@/components/ui/ErrorState'

import { OrdersToolbar } from '@/components/dashboard/OrdersToolbar'
import { Pagination } from '@/components/ui/Pagination'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    return (
      <ErrorState
        title="Unauthorized Access"
        message="You must be logged in and associated with a shop to view orders."
        actionLabel="Return to Dashboard"
        actionUrl="/dashboard"
      />
    )
  }

  const resolvedParams = await searchParams
  const page = typeof resolvedParams.page === 'string' ? Number(resolvedParams.page) : 1
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined

  const query: any = {
    tenant: {
      equals: user.tenant,
    },
  }

  if (status && status !== 'all') {
    query.status = {
      equals: status,
    }
  }

  // Basic search implementation (searching by ID or exact match on fields if needed)
  // For extensive search, Payload's local API usually needs specific 'like' queries or full-text search plugins.
  // We'll implemented a basic ID search for now if a search term is provided.
  if (search) {
    query.id = {
      contains: search,
    }
  }

  const { docs: orders, totalPages } = await payload.find({
    collection: 'orders',
    where: query,
    sort: '-createdAt',
    depth: 1,
    limit: 10,
    page,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and payments.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/orders/new">
            <PlusCircle className=" h-4 w-4" />
            <span>Create Order</span>
          </Link>
        </Button>
      </div>

      <OrdersToolbar />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Due Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const customerName =
                typeof order.customer === 'object' ? order.customer?.name : 'Unknown'
              const calculatedDue = Math.max(
                0,
                (order.totalAmount || 0) - (order.advancePaid || 0) - (order.remainingPaid || 0),
              )

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id.slice(-6)}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>{customerName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === 'delivered'
                          ? 'default'
                          : order.status === 'pending'
                            ? 'secondary'
                            : 'outline'
                      }
                      className={
                        order.status === 'delivered'
                          ? 'bg-success text-success-foreground hover:bg-success/90'
                          : order.status === 'pending'
                            ? 'bg-warning text-warning-foreground hover:bg-warning/90 border-none shadow-none'
                            : 'bg-info text-info-foreground hover:bg-info/90 border-none shadow-none'
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.totalAmount}</TableCell>
                  <TableCell>
                    {calculatedDue > 0 ? (
                      <span className="text-destructive font-bold">{calculatedDue}</span>
                    ) : (
                      <span className="text-success font-bold">Paid</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination totalPages={totalPages} />
    </div>
  )
}
