import Link from 'next/link'
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { PlusCircle, ClipboardList } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ErrorState } from '@/components/ui/ErrorState'

export default async function JobCardsPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    return (
      <ErrorState
        title="Unauthorized Access"
        message="You must be logged in and associated with a shop to view job cards."
        actionLabel="Return to Dashboard"
        actionUrl="/dashboard"
      />
    )
  }

  const { docs: jobCards } = await payload.find({
    collection: 'job-cards',
    where: {
      tenant: {
        equals: user.tenant,
      },
    },
    sort: '-createdAt',
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 hover:bg-green-100/80'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80'
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Cards</h1>
          <p className="text-muted-foreground">Manage production tasks and assignments.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/job-cards/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Assign Task
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {jobCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <div className="bg-muted p-4 rounded-full mb-3">
              <ClipboardList className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-1">No job cards found</h3>
            <p className="max-w-xs mx-auto mb-4">
              Assign tasks to your workers to track production progress.
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/job-cards/new">Assign Task</Link>
            </Button>
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Job ID
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Operation
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Assigned To
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {jobCards.map((card: any) => (
                  <tr
                    key={card.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td
                      className="p-4 align-middle font-medium max-w-[150px] truncate"
                      title={card.id}
                    >
                      #{card.id.slice(-6)}
                    </td>
                    <td className="p-4 align-middle font-medium">
                      {card.stage}
                      <div className="text-xs text-muted-foreground">
                        Run:{' '}
                        {typeof card.productionRun === 'object'
                          ? card.productionRun.id.slice(-6)
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {typeof card.worker === 'object'
                        ? card.worker.name || card.worker.email
                        : 'Unknown'}
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant="outline" className={getStatusColor(card.status)}>
                        {card.status
                          .replace('_', ' ')
                          .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
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
