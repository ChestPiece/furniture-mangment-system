'use client'

import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Factory, PlusCircle, Loader2 } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'

export default function ProductionPage() {
  const tenant = useQuery(api.tenants.getMine)
  const runs = useQuery(
    api.procurement.listProductionRuns,
    tenant ? { tenantId: tenant._id } : 'skip',
  )

  if (runs === undefined) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Production Runs</h1>
        <Button asChild>
          <Link href="/dashboard/production/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Start Run
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <div className="bg-muted p-4 rounded-full mb-3">
              <Factory className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-1">No production runs active</h3>
            <p className="max-w-xs mx-auto mb-4">
              Start tracking your manufacturing process by creating a new run.
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/production/new">Start Production Run</Link>
            </Button>
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Run ID
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {runs.map((run: any) => (
                  <tr
                    key={run._id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">#{run._id.substring(0, 8)}</td>
                    <td className="p-4 align-middle">
                      {new Date(run._creationTime).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-middle capitalize">{run.status || 'Pending'}</td>
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
