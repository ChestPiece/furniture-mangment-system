'use client'

import React from 'react'
import Link from 'next/link'
import { PlusCircle, Package, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'

export default function ProductsPage() {
  const tenant = useQuery(api.tenants.getMine)
  // Assuming list returns all products. Pagination to be added if needed or use pagination in Convex.
  const products = useQuery(api.products.list, tenant ? { tenantId: tenant._id } : 'skip')

  if (products === undefined) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <div className="bg-muted p-4 rounded-full mb-3">
              <Package className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-1">No products found</h3>
            <p className="max-w-xs mx-auto mb-4">
              Get started by creating your first product inventory item.
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/products/new">Create Product</Link>
            </Button>
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    SKU
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {products.map((product: any) => (
                  <tr
                    key={product._id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">{product.name}</td>
                    <td className="p-4 align-middle">{product.sku || '-'}</td>
                    <td className="p-4 align-middle">${product.price?.toFixed(2) || '0.00'}</td>
                    <td className="p-4 align-middle">{product.stock || 0}</td>
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
