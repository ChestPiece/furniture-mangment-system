'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { formatCurrency } from '@/utilities/formatCurrency'
import { Customer, Configuration } from '@/payload-types'

// Zod Schema
const orderSchema = z
  .object({
    customer: z.string().min(1, 'Customer is required'),
    type: z.enum(['ready-made', 'custom']),
    orderDate: z.string().min(1, 'Order date is required'),
    deliveryDate: z.string().optional(),
    totalAmount: z.number().min(0, 'Total amount must be non-negative'),
    advancePaid: z.number().min(0, 'Advance paid must be non-negative'),
    remainingPaid: z.number().min(0, 'Remaining paid must be non-negative'),
    status: z.enum(['pending', 'in_progress', 'delivered']),
    customFieldsData: z.record(z.string(), z.any()),
  })
  .refine(
    (data) => {
      const totalPaid = data.advancePaid + (data.remainingPaid || 0)
      return totalPaid <= data.totalAmount
    },
    {
      message: 'Total paid (advance + remaining) cannot exceed total order amount',
      path: ['totalAmount'],
    },
  )

type OrderFormValues = z.infer<typeof orderSchema>

/**
 * OrderForm Component
 *
 * Client-side form for creating new orders.
 * Uses react-hook-form with Zod validation.
 *
 * @param {Object} props
 * @param {Customer[]} props.customers - List of customers for selection.
 * @param {Configuration} props.config - System configuration including custom fields.
 */
export default function OrderForm({
  customers,
  config,
}: {
  customers: Customer[]
  config: Configuration | null
}) {
  const router = useRouter()
  const [serverError, setServerError] = useState('')

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer: '',
      type: 'ready-made',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      totalAmount: 0,
      advancePaid: 0,
      remainingPaid: 0,
      status: 'pending',
      customFieldsData: {},
    },
  })

  // Watch values for calculating due amount
  const totalAmount = form.watch('totalAmount')
  const advancePaid = form.watch('advancePaid')
  const remainingPaid = form.watch('remainingPaid')

  const dueAmount = Math.max(0, totalAmount - advancePaid - remainingPaid)
  const isSubmitting = form.formState.isSubmitting

  const onSubmit = async (data: OrderFormValues) => {
    setServerError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const resData = await res.json()
        throw new Error(resData.errors?.[0]?.message || 'Failed to create order')
      }

      toast.success('Order created successfully')
      router.push('/dashboard/orders')
      router.refresh()
    } catch (err: any) {
      setServerError(err.message)
      toast.error(err.message || 'Failed to create order')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {serverError && (
          <div
            role="alert"
            className="bg-destructive/15 p-4 rounded-md text-destructive text-sm font-medium"
          >
            {serverError}
          </div>
        )}

        <Card>
          <CardContent className="pt-6 grid gap-6">
            <FormField
              control={form.control}
              name="customer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ready-made">Ready-Made</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Financials */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="advancePaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advance Paid</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remainingPaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remaining Paid</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Due Amount:</span>
                <span
                  className={`ml-2 text-xl font-bold ${dueAmount > 0 ? 'text-destructive' : 'text-green-600'}`}
                >
                  {formatCurrency(dueAmount)}
                </span>
                {(form.formState.errors.totalAmount?.message ||
                  form.formState.errors.root?.message) && (
                  <div className="text-destructive text-sm mt-1">
                    {form.formState.errors.totalAmount?.message}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Fields */}
        {config?.customOrderFields &&
          Array.isArray(config.customOrderFields) &&
          config.customOrderFields.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(config.customOrderFields as any[]).map((field: any, idx: number) => (
                    <FormField
                      key={idx}
                      control={form.control}
                      name={`customFieldsData.${field.name}`}
                      render={({ field: inputField }) => (
                        <FormItem>
                          <FormLabel>{field.label || field.name}</FormLabel>
                          <FormControl>
                            <Input
                              type={field.type || 'text'}
                              {...inputField}
                              value={inputField.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
