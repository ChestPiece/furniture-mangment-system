'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProductForm from './ProductForm'
import { useQuery } from 'convex/react'
import { api } from '../../../../../../convex/_generated/api'

export default function NewProductPage() {
  const viewer = useQuery(api.users.viewer)

  // Optional: Redirect if not logged in.
  // Ideally this is handled by a layout wrapper.

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/products">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Product</h1>
          <p className="text-muted-foreground">Add a new item to your inventory.</p>
        </div>
      </div>

      <ProductForm />
    </div>
  )
}
