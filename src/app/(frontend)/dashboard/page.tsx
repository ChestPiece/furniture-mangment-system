import React, { Suspense } from 'react'
import {
  DashboardHeader,
  StatsSection,
  RecentOrdersSection,
  StatsSectionFallback,
  RecentOrdersSectionFallback,
} from './components'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header - Loads immediately */}
      <Suspense fallback={
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-muted rounded animate-pulse" />
            <div className="h-5 w-72 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
            <div className="h-10 w-36 bg-muted rounded animate-pulse" />
          </div>
        </div>
      }>
        <DashboardHeader />
      </Suspense>

      {/* Stats Grid - Streams in */}
      <Suspense fallback={<StatsSectionFallback />}>
        <StatsSection />
      </Suspense>

      {/* Recent Activity Section - Streams in */}
      <Suspense fallback={<RecentOrdersSectionFallback />}>
        <RecentOrdersSection />
      </Suspense>
    </div>
  )
}
