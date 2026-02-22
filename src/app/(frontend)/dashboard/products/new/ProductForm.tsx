'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../../../../convex/_generated/api'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().optional(),
  type: z.enum(['finished_good', 'raw_material', 'service']),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  cost: z.coerce.number().min(0, 'Cost must be 0 or greater'),
  unit: z.string().min(1, 'Unit is required'),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function ProductForm() {
  const router = useRouter()
  const createProduct = useMutation(api.products.create)
  const tenant = useQuery(api.tenants.getMine)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      type: 'finished_good',
      price: 0,
      cost: 0,
      unit: 'pcs',
    },
  })

  async function onSubmit(data: ProductFormValues) {
    if (!tenant) {
      toast.error('Tenant not loaded')
      return
    }

    setIsPending(true)
    try {
      await createProduct({
        tenantId: tenant._id,
        name: data.name,
        sku: data.sku || `SKU-${Date.now()}`, // simple generation
        price: data.price,
        cost: data.cost,
        stock: 0,
        lowStockThreshold: 10, // default
        type: data.type,
        unit: data.unit,
      })
      toast.success('Product created successfully')
      router.push('/dashboard/products')
      router.refresh()
    } catch (error) {
      toast.error('Failed to create product')
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
        <CardDescription>
          Enter the basic information for the new product. Stock levels are managed separately via
          transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Office Chair" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CHAIR-001" autoComplete="off" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional. Will be auto-generated if left blank.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} name="type">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="finished_good">Finished Good</SelectItem>
                        <SelectItem value="raw_material">Raw Material</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measure</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. pcs, kg, m" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>The price you sell this item for.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>The cost to acquire or produce this item.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Product
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
