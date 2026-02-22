'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle, Loader2 } from 'lucide-react'
import { CustomersTable, type Customer } from '@/components/dashboard/CustomersTable'
import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'

export default function CustomersPage() {
  const tenant = useQuery(api.tenants.getMine)
  const customers = useQuery(api.customers.list, tenant ? { tenantId: tenant._id } : 'skip')

  if (customers === undefined) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  // Map Convex docs to Customer type if needed
  // Assuming Customer type matches mostly, or we cast it.
  // We need to check useId vs _id.
  const mappedCustomers = customers.map((c: any) => ({
    ...c,
    id: c._id,
    createdAt: new Date(c._creationTime).toISOString(),
    updatedAt: new Date(c._creationTime).toISOString(), // Convex doesn't have updatedAt by default
    tenant: c.tenantId,
  })) as Customer[]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
        <CustomersTable customers={mappedCustomers} />
      </div>
    </div>
  )
}
