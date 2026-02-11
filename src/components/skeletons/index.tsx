'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ============================================================================
// BASE SKELETON COMPONENTS
// ============================================================================

interface SkeletonProps {
  className?: string
}

export function PageHeaderSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  )
}

export function PageHeaderSimpleSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
    </div>
  )
}

export function StatsCardSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[80px] mb-2" />
        <Skeleton className="h-3 w-[120px]" />
      </CardContent>
    </Card>
  )
}

export function StatsCardsRowSkeleton({ count = 3, className }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-border/50">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === 0 ? 'w-[30%]' : i === columns - 1 ? 'w-[10%]' : 'w-[20%]'
          )}
        />
      ))}
    </div>
  )
}

export function TableSkeleton({
  rows = 5,
  columns = 5,
  showHeader = true,
  className,
}: SkeletonProps & {
  rows?: number
  columns?: number
  showHeader?: boolean
}) {
  return (
    <div className={cn('rounded-lg border border-border bg-card overflow-hidden', className)}>
      {showHeader && (
        <div className="flex items-center gap-4 py-3 px-4 border-b border-border bg-muted/50">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                'h-4',
                i === 0 ? 'w-[30%]' : i === columns - 1 ? 'w-[10%]' : 'w-[20%]'
              )}
            />
          ))}
        </div>
      )}
      <div className="divide-y divide-border/50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4 px-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton
                key={j}
                className={cn(
                  'h-4',
                  j === 0 ? 'w-[30%]' : j === columns - 1 ? 'w-[10%]' : 'w-[20%]'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardListSkeleton({ count = 3, className }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export function FormSkeleton({ fields = 4, className }: SkeletonProps & { fields?: number }) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32" />
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <div className="flex h-full flex-col bg-card p-4 space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <div className="space-y-2 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      <div className="mt-auto pt-4 border-t">
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

// ============================================================================
// PAGE-SPECIFIC SKELETONS
// ============================================================================

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <StatsCardsRowSkeleton count={3} />

      {/* Recent Orders Card Skeleton */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <TableSkeleton rows={5} columns={4} showHeader={false} />
        </CardContent>
      </Card>
    </div>
  )
}

export function OrdersPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeaderSkeleton />
      
      {/* Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Skeleton className="h-10 w-full sm:w-[300px]" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>

      <TableSkeleton rows={5} columns={7} />
      
      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}

export function ProductsPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeaderSkeleton />
      <TableSkeleton rows={5} columns={4} />
      <div className="flex justify-center">
        <Skeleton className="h-10 w-[300px]" />
      </div>
    </div>
  )
}

export function CustomersPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeaderSkeleton />
      <TableSkeleton rows={5} columns={5} />
    </div>
  )
}

export function SuppliersPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeaderSkeleton />
      <TableSkeleton rows={5} columns={4} />
    </div>
  )
}

export function WarehousesPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeaderSkeleton />
      <TableSkeleton rows={5} columns={3} />
    </div>
  )
}

export function JobCardsPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeaderSkeleton />
      <TableSkeleton rows={5} columns={4} />
    </div>
  )
}

export function ProductionPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeaderSkeleton />
      <TableSkeleton rows={5} columns={3} />
      <div className="flex justify-center">
        <Skeleton className="h-10 w-[300px]" />
      </div>
    </div>
  )
}

export function DeliveriesPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeaderSkeleton />
      <TableSkeleton rows={5} columns={3} />
      <div className="flex justify-center">
        <Skeleton className="h-10 w-[300px]" />
      </div>
    </div>
  )
}

export function FinancePageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeaderSkeleton />
      <TableSkeleton rows={5} columns={3} />
      <div className="flex justify-center">
        <Skeleton className="h-10 w-[300px]" />
      </div>
    </div>
  )
}

export function PurchaseOrdersPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeaderSkeleton />
      <TableSkeleton rows={5} columns={5} />
    </div>
  )
}

export function InventoryPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeaderSimpleSkeleton />
      <TableSkeleton rows={5} columns={5} />
    </div>
  )
}

export function ReportsPageSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeaderSimpleSkeleton />
      
      {/* Daily Sales Card Skeleton */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-[160px]" />
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
          <TableSkeleton rows={3} columns={3} />
        </CardContent>
      </Card>

      {/* Pending Payments Card Skeleton */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
          <TableSkeleton rows={3} columns={5} />
        </CardContent>
      </Card>
    </div>
  )
}

export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Skeleton className="h-10 w-48" />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-32" />
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/50">
          <Skeleton className="h-6 w-48" />
        </div>
        <TableSkeleton rows={5} columns={4} showHeader={false} />
      </Card>
    </div>
  )
}

export function SettingsPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeaderSimpleSkeleton />
      <Card className="p-6">
        <FormSkeleton fields={5} />
      </Card>
    </div>
  )
}
