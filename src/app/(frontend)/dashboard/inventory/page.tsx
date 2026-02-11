import Link from 'next/link'
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { History, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ErrorState } from '@/components/ui/ErrorState'

export default async function InventoryPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    return (
      <ErrorState
        title="Unauthorized Access"
        message="You must be logged in and associated with a shop to view inventory."
        actionLabel="Return to Dashboard"
        actionUrl="/dashboard"
      />
    )
  }

  const { docs: transactions } = await payload.find({
    collection: 'stock-transactions',
    where: {
      tenant: {
        equals: user.tenant,
      },
    },
    sort: '-createdAt',
    limit: 50,
  })

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase_receive':
        return { label: 'Received', color: 'bg-green-100 text-green-800' }
      case 'order_deduction':
        return { label: 'Order Fulfilled', color: 'bg-blue-100 text-blue-800' }
      case 'manual_adjust':
        return { label: 'Adjustment', color: 'bg-yellow-100 text-yellow-800' }
      case 'return':
        return { label: 'Return', color: 'bg-purple-100 text-purple-800' }
      case 'waste':
        return { label: 'Waste', color: 'bg-red-100 text-red-800' }
      default:
        return { label: type, color: 'bg-gray-100 text-gray-800' }
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory History</h1>
          <p className="text-muted-foreground">Audit log of all stock movements.</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <div className="bg-muted p-4 rounded-full mb-3">
              <History className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-1">No transactions found</h3>
            <p className="max-w-xs mx-auto mb-4">
              Stock movements will appear here when you receive POs or fulfill orders.
            </p>
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Quantity
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {transactions.map((tx: any) => {
                  const typeInfo = getTransactionTypeLabel(tx.type)
                  const isPositive = tx.quantity > 0
                  return (
                    <tr
                      key={tx.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString()}{' '}
                        <span className="text-xs">{new Date(tx.date).toLocaleTimeString()}</span>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant="outline" className={typeInfo.color}>
                          {typeInfo.label}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle font-medium">
                        {typeof tx.product === 'object' ? tx.product.name : 'Unknown Product'}
                      </td>
                      <td className="p-4 align-middle">
                        <div
                          className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                          ) : (
                            <ArrowDownLeft className="mr-1 h-3 w-3" />
                          )}
                          <span className="font-bold">{Math.abs(tx.quantity)}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground text-sm">
                        {tx.reference || '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
