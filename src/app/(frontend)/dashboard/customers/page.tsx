import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { CustomersTable } from '@/components/dashboard/CustomersTable'

export default async function CustomersPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    return <div>Unauthorized</div>
  }

  const { docs: customers } = await payload.find({
    collection: 'customers',
    where: {
      tenant: {
        equals: user.tenant,
      },
    },
    sort: 'name',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-heading">Customers</h2>
          <p className="text-muted-foreground">Manage your customer base and view history.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/customers/new">
            <PlusCircle className="h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <CustomersTable customers={customers as any} />
      </div>
    </div>
  )
}
