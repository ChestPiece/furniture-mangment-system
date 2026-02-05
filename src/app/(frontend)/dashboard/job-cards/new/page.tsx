import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import JobCardForm from './JobCardForm'

export default async function NewJobCardPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <h3 className="text-lg font-medium">Unauthorized Access</h3>
        <p className="mb-4">You must be logged in to assign tasks.</p>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    )
  }

  // Fetch active production runs and users (workers)
  const [{ docs: productionRuns }, { docs: workers }] = await Promise.all([
    payload.find({
      collection: 'production-runs',
      where: {
        tenant: { equals: user.tenant },
        status: { not_equals: 'completed' }, // Only show active runs
      },
      sort: '-createdAt',
    }),
    payload.find({
      collection: 'users',
      where: {
        tenant: { equals: user.tenant },
      },
      sort: 'email',
    }),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/job-cards">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assign Job Card</h1>
          <p className="text-muted-foreground">Create a new task for production.</p>
        </div>
      </div>

      <JobCardForm productionRuns={productionRuns} workers={workers} />
    </div>
  )
}
