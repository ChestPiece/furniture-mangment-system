import Link from 'next/link'
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { PlusCircle, Warehouse } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default async function WarehousesPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <h3 className="text-lg font-medium">Unauthorized Access</h3>
        <p className="mb-4">You must be logged in to view warehouses.</p>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    )
  }

  const { docs: warehouses } = await payload.find({
    collection: 'warehouses',
    where: {
      tenant: {
        equals: user.tenant,
      },
    },
    sort: '-createdAt',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
          <p className="text-muted-foreground">Manage your storage locations.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/warehouses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Warehouse
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {warehouses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <div className="bg-muted p-4 rounded-full mb-3">
              <Warehouse className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-1">No warehouses found</h3>
            <p className="max-w-xs mx-auto mb-4">
              Add your first warehouse to start tracking inventory storage.
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/warehouses/new">Add Warehouse</Link>
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
                    Address
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Default
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {warehouses.map((warehouse: any) => (
                  <tr
                    key={warehouse.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">{warehouse.name}</td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {warehouse.address || '-'}
                    </td>
                    <td className="p-4 align-middle">
                      {warehouse.isDefault ? (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          Default
                        </span>
                      ) : (
                        '-'
                      )}
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
