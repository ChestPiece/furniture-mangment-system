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

export default async function OrdersPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    return <div>Unauthorized</div>
  }

  const { docs: orders } = await payload.find({
    collection: 'orders',
    where: {
      tenant: {
        equals: user.tenant,
      },
    },
    sort: '-createdAt',
    depth: 1,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Orders</h1>
          <p className="text-gray-500">Manage customer orders and payments.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/orders/new">
            <PlusCircle className=" h-4 w-4 text-white" />
            <span className="text-white">Create Order</span>
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white">
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
                          ? 'default' // default is primary/black, or green if styled
                          : order.status === 'pending'
                            ? 'secondary'
                            : 'outline'
                      }
                      className={
                        order.status === 'delivered'
                          ? 'bg-green-600 hover:bg-green-700'
                          : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none shadow-none'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-none shadow-none'
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.totalAmount}</TableCell>
                  <TableCell>
                    {calculatedDue > 0 ? (
                      <span className="text-red-600 font-bold">{calculatedDue}</span>
                    ) : (
                      <span className="text-green-600 font-bold">Paid</span>
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
    </div>
  )
}
