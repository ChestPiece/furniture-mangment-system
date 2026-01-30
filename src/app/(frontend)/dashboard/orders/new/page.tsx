import React from 'react'
import OrderForm from './OrderForm' // We will create this next
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

export default async function NewOrderPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    return <div>Unauthorized</div>
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Order</h1>
      <OrderForm customers={customers} config={config} />
    </div>
  )
}
