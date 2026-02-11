import Link from 'next/link'
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { ErrorState } from '@/components/ui/ErrorState'

export default async function SettingsPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    return (
      <ErrorState
        title="Unauthorized Access"
        message="You must be logged in and associated with a shop to view settings."
        actionLabel="Return to Dashboard"
        actionUrl="/dashboard"
      />
    )
  }

  // Fetch tenant details specifically
  const tenant = await payload.findByID({
    collection: 'tenants',
    id: typeof user.tenant === 'string' ? user.tenant : user.tenant.id,
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-secondary rounded-full">
            <Settings className="h-6 w-6 text-secondary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{tenant.name}</h2>
            <p className="text-sm text-muted-foreground">Manage your shop preferences</p>
          </div>
        </div>

        <div className="grid gap-6 max-w-2xl">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Shop Name
            </label>
            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              {tenant.name}
            </div>
            <p className="text-[0.8rem] text-muted-foreground">
              This is the name displayed on your invoices and dashboard.
            </p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Domain/Slug
            </label>
            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              {tenant.slug}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button variant="default" disabled>
            Save Changes (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  )
}
