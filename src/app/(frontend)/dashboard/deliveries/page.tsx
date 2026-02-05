import Link from 'next/link'
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { Button } from '@/components/ui/button'
import { Truck, PlusCircle } from 'lucide-react'
import { ErrorState } from '@/components/ui/ErrorState'
import { Pagination } from '@/components/ui/Pagination'

export default async function DeliveriesPage({
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
        message="You must be logged in and associated with a shop to view deliveries."
        actionLabel="Return to Dashboard"
        actionUrl="/dashboard"
      />
    )
  }

  const resolvedParams = await searchParams
  const page = typeof resolvedParams.page === 'string' ? Number(resolvedParams.page) : 1

  const { docs: deliveries, totalPages } = await payload.find({
    collection: 'deliveries',
    where: {
      tenant: {
        equals: user.tenant,
      },
    },
    sort: '-createdAt',
    depth: 1,
    limit: 10,
    page,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Deliveries</h1>
        <Button asChild>
          <Link href="/dashboard/deliveries/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Schedule Delivery
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <div className="bg-muted p-4 rounded-full mb-3">
              <Truck className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-1">No deliveries scheduled</h3>
            <p className="max-w-xs mx-auto mb-4">
              Manage your logistics by scheduling deliveries for orders.
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/deliveries/new">Schedule Delivery</Link>
            </Button>
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    ID
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Order
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {deliveries.map((delivery: any) => (
                  <tr
                    key={delivery.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">#{delivery.id.substring(0, 8)}</td>
                    <td className="p-4 align-middle">
                      {typeof delivery.order === 'string' ? delivery.order : delivery.order?.id}
                    </td>
                    <td className="p-4 align-middle capitalize">{delivery.status || 'Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination totalPages={totalPages} />
    </div>
  )
}
