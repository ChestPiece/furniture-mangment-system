import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import ProductionRunForm from './ProductionRunForm'

export default async function NewProductionRunPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-lg font-medium">Unauthorized Access</h3>
        <p className="text-muted-foreground mb-4">You must be logged in to access production.</p>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    )
  }

  // Fetch recent orders that are not delivered yet?
  // For now, fetch recent 50 orders to select from.
  const { docs: orders } = await payload.find({
    collection: 'orders',
    where: {
      tenant: {
        equals: user.tenant,
      },
      // You might want to filter by status not equals 'delivered' if production only happens on active orders
      status: {
        not_equals: 'delivered',
      },
    },
    sort: '-createdAt',
    limit: 50,
  })

  // We need to pass serializable data.
  // Payload returns docs mostly serializable, but ensure types match what Form expects.
  // The Form expects: id, orderDate, customer.name, items: [{id, product: {id, name, sku}, quantity}]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/production">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Initiate Production Run</h1>
          <p className="text-muted-foreground">Start production for an order.</p>
        </div>
      </div>

      <ProductionRunForm orders={orders as any} />
    </div>
  )
}
