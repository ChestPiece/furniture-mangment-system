import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { PlusCircle, Users } from 'lucide-react'

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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-gray-500">Manage your customer base.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/customers/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Added On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center mr-2">
                      <Users className="h-4 w-4 text-slate-500" />
                    </div>
                    {customer.name}
                  </div>
                </TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <span className="text-xs text-muted-foreground mr-4">
                    View History (Coming Soon)
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
