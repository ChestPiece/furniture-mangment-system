import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import PurchaseOrderForm from './PurchaseOrderForm'

export default async function NewPurchaseOrderPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <h3 className="text-lg font-medium">Unauthorized Access</h3>
        <p className="mb-4">You must be logged in to create purchase orders.</p>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    )
  }

  // Fetch required data
  const [{ docs: suppliers }, { docs: products }] = await Promise.all([
    payload.find({
      collection: 'suppliers',
      where: {
        tenant: { equals: user.tenant },
      },
      sort: 'name',
    }),
    payload.find({
      collection: 'products',
      where: {
        tenant: { equals: user.tenant },
        // Optionally filter by type: 'raw_material' if strict mapping is needed
      },
      sort: 'name',
    }),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/purchase-orders">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Purchase Order</h1>
          <p className="text-muted-foreground">Order materials from your suppliers.</p>
        </div>
      </div>

      <PurchaseOrderForm suppliers={suppliers} products={products} />
    </div>
  )
}
