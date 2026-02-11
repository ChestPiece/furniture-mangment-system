import React from 'react'
import OrderForm from './OrderForm'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { ErrorState } from '@/components/ui/ErrorState'

export default async function NewOrderPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    return (
      <ErrorState
        title="Unauthorized Access"
        message="You must be logged in and associated with a shop to create orders."
        actionLabel="Return to Dashboard"
        actionUrl="/dashboard"
      />
    )
  }

  // Fetch customers for the dropdown
  const { docs: customers } = await payload.find({
    collection: 'customers',
    where: {
      tenant: {
        equals: user.tenant,
      },
    },
    sort: 'name',
    limit: 1000,
  })

  // Fetch tenant configuration for custom fields
  const { docs: configs } = await payload.find({
    collection: 'configurations',
    where: {
      tenant: {
        equals: user.tenant,
      },
    },
  })
  const config = configs[0] || null

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <h3 className="text-2xl font-bold mb-6">Create New Order</h3>
      <OrderForm customers={customers} config={config} />
    </div>
  )
}
