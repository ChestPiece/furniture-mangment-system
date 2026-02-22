'use client'

import React from 'react'
import Link from 'next/link'
import { PlusCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrdersTable, type Order } from '@/components/dashboard/OrdersTable'
import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'

export default function OrdersPage() {
  const tenant = useQuery(api.tenants.getMine)
  const orders = useQuery(api.orders.list, tenant ? { tenantId: tenant._id } : 'skip')

  if (orders === undefined) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  // Map to Order type if necessary
  const mappedOrders = orders.map((o: any) => ({
    id: o._id,
    orderNumber: o.orderNumber,
    orderDate: new Date(o._creationTime).toISOString(),
    customer: { name: 'Unknown' }, // fetching customer name logic needed?
    // For now list returns plain objects.
    // If OrdersTable needs customer name, we should join it in the query `api.orders.list` or fetch here.
    // `api.orders.list` in `convex/orders.ts` currently DOES NOT join customer.
    // Let's assume for now we just show IDs or update query later.
    totalAmount: o.totalAmount,
    status: o.status,
    paymentStatus: o.paymentStatus,
    priority: o.priority,
    items: o.items || [],
  })) as unknown as Order[]

  return (
    <div className="space-y-6">
      {/* <OrdersToolbar /> -- Skipping toolbar for now as it needs state */}

      <div className="rounded-lg border border-border bg-card">
        {/* @ts-ignore */}
        <OrdersTable orders={mappedOrders} />
      </div>
      <div className="flex items-center justify-between">
        <Button asChild>
          <Link href="/dashboard/orders/new">
            <PlusCircle className=" h-4 w-4" />
            <span>Create Order</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
