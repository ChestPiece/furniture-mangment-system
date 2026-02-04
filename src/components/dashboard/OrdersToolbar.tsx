'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Search, Filter } from 'lucide-react'

export function OrdersToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }
    params.set('page', '1') // Reset to page 1
    router.replace(`/dashboard/orders?${params.toString()}`)
  }, 300)

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams)
    if (status && status !== 'all') {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    params.set('page', '1')
    router.replace(`/dashboard/orders?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
      <div className="relative flex-1 w-full sm:max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders by ID..."
          defaultValue={searchParams.get('search')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 h-9 bg-muted/30 border-border focus:bg-background transition-colors"
        />
      </div>
      <div className="w-full sm:w-[200px]">
        <Select
          defaultValue={searchParams.get('status')?.toString() || 'all'}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="h-9 bg-muted/30 border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <SelectValue placeholder="Filter by status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
