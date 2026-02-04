import Link from 'next/link'
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { ErrorState } from '@/components/ui/ErrorState'

import { OrdersToolbar } from '@/components/dashboard/OrdersToolbar'
import { Pagination } from '@/components/ui/Pagination'
import { OrdersTable } from '@/components/dashboard/OrdersTable'

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
      <OrdersToolbar />

      <div className="rounded-lg border border-border bg-card">
        <OrdersTable orders={orders as any} />
      </div>
      <div className="flex items-center justify-between">
        <Button asChild>
          <Link href="/dashboard/orders/new">
            <PlusCircle className=" h-4 w-4" />
            <span>Create Order</span>
          </Link>
        </Button>
      </div>

      <Pagination totalPages={totalPages} />
    </div>
  )
}
