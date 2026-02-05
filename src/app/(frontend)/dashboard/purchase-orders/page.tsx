import Link from 'next/link'
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { PlusCircle, ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function PurchaseOrdersPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <h3 className="text-lg font-medium">Unauthorized Access</h3>
        <p className="mb-4">You must be logged in to view purchase orders.</p>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    )
  }

  const { docs: purchaseOrders } = await payload.find({
    collection: 'purchase-orders',
    where: {
      tenant: {
        equals: user.tenant,
      },
    },
    sort: '-createdAt',
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-green-100 text-green-800 hover:bg-green-100/80'
      case 'ordered':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80'
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-100/80'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage your material procurement.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/purchase-orders/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create PO
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {purchaseOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <div className="bg-muted p-4 rounded-full mb-3">
              <ShoppingCart className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-1">No purchase orders found</h3>
            <p className="max-w-xs mx-auto mb-4">
              Create a purchase order to restock your inventory.
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/purchase-orders/new">Create PO</Link>
            </Button>
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    PO ID
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Supplier
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Total Cost
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Expected Delivery
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {purchaseOrders.map((po: any) => (
                  <tr
                    key={po.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">#{po.id.slice(-6)}</td>
                    <td className="p-4 align-middle">
                      {typeof po.supplier === 'object' ? po.supplier.name : po.supplier}
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant="outline" className={getStatusColor(po.status)}>
                        {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle font-medium">
                      ${po.totalCost?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {po.expectedDeliveryDate
                        ? new Date(po.expectedDeliveryDate).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
