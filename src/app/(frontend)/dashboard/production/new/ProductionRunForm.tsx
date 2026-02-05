'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// Schema validation
const productionRunSchema = z.object({
  order: z.string().min(1, 'Order is required'),
  orderItem: z.string().min(1, 'Order item is required'),
  product: z.string().min(1, 'Product is required'),
  status: z.enum(['planned', 'in_progress', 'quality_check', 'completed']),
})

type ProductionRunFormValues = z.infer<typeof productionRunSchema>

interface OrderItem {
  id: string
  product: {
    id: string
    name: string
    sku?: string
  }
  quantity: number
}

interface Order {
  id: string
  orderDate: string
  customer: {
    name: string
  }
  items: OrderItem[]
}

interface ProductionRunFormProps {
  orders: Order[]
}

export default function ProductionRunForm({ orders }: ProductionRunFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProductionRunFormValues>({
    resolver: zodResolver(productionRunSchema),
    defaultValues: {
      order: '',
      orderItem: '',
      product: '',
      status: 'planned',
    },
  })

  // Watch selected order to filter items
  const selectedOrderId = form.watch('order')

  const selectedOrderItems = useMemo(() => {
    const order = orders.find((o) => o.id === selectedOrderId)
    return order?.items || []
  }, [selectedOrderId, orders])

  const handleItemSelect = (itemId: string) => {
    const item = selectedOrderItems.find((i) => i.id === itemId)
    if (item) {
      form.setValue('orderItem', itemId)
      form.setValue('product', item.product.id)
    }
  }

  async function onSubmit(data: ProductionRunFormValues) {
    setIsSubmitting(true)
    try {
      // Create initial stages structure as required by schema
      const payload = {
        ...data,
        stages: [
          { stage: 'cutting', status: 'pending' },
          { stage: 'assembly', status: 'pending' },
          { stage: 'sanding', status: 'pending' },
          { stage: 'upholstery', status: 'pending' },
          { stage: 'qc', status: 'pending' },
        ],
      }

      const response = await fetch('/api/production-runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.[0]?.message || 'Failed to create production run')
      }

      toast.success('Production run initiated')
      router.push('/dashboard/production')
      router.refresh()
    } catch (error) {
      console.error('Error creating production run:', error)
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run Details</CardTitle>
        <CardDescription>Select an order and product to start a production run.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Order</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val)
                      form.setValue('orderItem', '') // Reset item selection
                      form.setValue('product', '')
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an active order" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          Order #{order.id?.slice(-6)} - {order.customer?.name} (
                          {new Date(order.orderDate).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderItem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Product Item</FormLabel>
                  <Select
                    onValueChange={handleItemSelect}
                    defaultValue={field.value}
                    disabled={!selectedOrderId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            selectedOrderId
                              ? 'Choose a product from this order'
                              : 'Select an order first'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedOrderItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.product?.name} {item.product?.sku ? `(${item.product.sku})` : ''} -
                          Qty: {item.quantity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This will link the production run to specific items in the order.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Initiate Run
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
