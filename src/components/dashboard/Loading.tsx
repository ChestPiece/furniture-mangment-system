import React from 'react'
import { StatsCardsRowSkeleton, TableSkeleton } from '@/components/skeletons'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function StatsSectionFallback() {
  return <StatsCardsRowSkeleton count={3} />
}

export function RecentOrdersSectionFallback() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <TableSkeleton rows={5} columns={4} showHeader={false} />
      </CardContent>
    </Card>
  )
}
