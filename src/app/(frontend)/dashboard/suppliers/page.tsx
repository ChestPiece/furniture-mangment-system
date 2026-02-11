import Link from 'next/link'
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { PlusCircle, Truck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/ErrorState'

export default async function SuppliersPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    return (
      <ErrorState
        title="Unauthorized Access"
        message="You must be logged in and associated with a shop to view suppliers."
        actionLabel="Return to Dashboard"
        actionUrl="/dashboard"
      />
    )
  }

  const { docs: suppliers } = await payload.find({
    collection: 'suppliers',
    where: {
      tenant: {
        equals: user.tenant,
      },
    },
    sort: '-createdAt',
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage your vendors and partners.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/suppliers/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Supplier
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <div className="bg-muted p-4 rounded-full mb-3">
              <Truck className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-1">No suppliers found</h3>
            <p className="max-w-xs mx-auto mb-4">
              Add suppliers to track where you buy materials from.
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/suppliers/new">Add Supplier</Link>
            </Button>
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Contact Person
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {suppliers.map((supplier: any) => (
                  <tr
                    key={supplier.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">{supplier.name}</td>
                    <td className="p-4 align-middle">{supplier.contactPerson || '-'}</td>
                    <td className="p-4 align-middle">{supplier.email || '-'}</td>
                    <td className="p-4 align-middle">{supplier.phone || '-'}</td>
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
