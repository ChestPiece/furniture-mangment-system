'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle, Users } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

export function DashboardHeader() {
  const viewer = useQuery(api.users.viewer)
  const userName = viewer?.name || viewer?.email?.split('@')[0] || 'User'

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent font-heading">
          Dashboard
        </h2>
        <p className="text-muted-foreground mt-2 text-lg font-light">
          Good morning, <span className="font-medium text-foreground">{userName}</span>. Here&apos;s
          your daily overview.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          asChild
          size="lg"
          className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 duration-200"
        >
          <Link href="/dashboard/orders/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            New Order
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-full hover:bg-muted/50 transition-all hover:scale-105 active:scale-95 duration-200 border-muted-foreground/20"
        >
          <Link href="/dashboard/customers/new">
            <Users className="mr-2 h-5 w-5" /> Add Customer
          </Link>
        </Button>
      </div>
    </div>
  )
}
