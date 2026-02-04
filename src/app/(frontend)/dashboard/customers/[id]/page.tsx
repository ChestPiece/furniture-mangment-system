import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrdersTable } from '@/components/dashboard/OrdersTable'
import { CustomerForm } from './CustomerForm'

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    return notFound()
  }

  // Fetch Customer
  const customers = await payload.find({
    collection: 'customers',
    where: {
      and: [{ id: { equals: id } }, { tenant: { equals: user.tenant } }],
    },
    limit: 1,
  })

  const customer = customers.docs[0]

  if (!customer) {
    return notFound()
  }

  // Fetch Order History
  const orders = await payload.find({
    collection: 'orders',
    where: {
      and: [{ customer: { equals: id } }, { tenant: { equals: user.tenant } }],
    },
    sort: '-orderDate',
    limit: 50,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-heading">{customer.name}</h2>
          <p className="text-muted-foreground">Customer Profile & History</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Edit Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Edit Details</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerForm customer={customer} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <OrdersTable orders={orders.docs as any[]} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
