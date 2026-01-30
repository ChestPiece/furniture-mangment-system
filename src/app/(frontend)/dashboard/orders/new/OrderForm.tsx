'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

export default function OrderForm({ customers, config }: { customers: any[]; config: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    customer: '',
    type: 'ready-made',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    totalAmount: 0,
    advancePaid: 0,
    remainingPaid: 0,
    status: 'pending',
    customFieldsData: {} as Record<string, any>,
  })

  // Derived state
  const dueAmount = Math.max(
    0,
    formData.totalAmount - formData.advancePaid - formData.remainingPaid,
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  // Helper for Radix Select
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      customFieldsData: {
        ...prev.customFieldsData,
        [fieldName]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.errors?.[0]?.message || 'Failed to create order')
      }

      router.push('/dashboard/orders')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-destructive/15 p-4 rounded-md text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="pt-6 grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="customer">Customer</Label>
            <Select
              name="customer"
              value={formData.customer}
              onValueChange={(value) => handleSelectChange('customer', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="type">Order Type</Label>
              <Select
                name="type"
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ready-made">Ready-Made</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="orderDate">Order Date</Label>
              <Input
                id="orderDate"
                type="date"
                name="orderDate"
                value={formData.orderDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deliveryDate">Delivery Date (Optional)</Label>
              <Input
                id="deliveryDate"
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financials */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="totalAmount">Total Amount</Label>
              <Input
                id="totalAmount"
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="advancePaid">Advance Paid</Label>
              <Input
                id="advancePaid"
                type="number"
                name="advancePaid"
                value={formData.advancePaid}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="remainingPaid">Remaining Paid</Label>
              <Input
                id="remainingPaid"
                type="number"
                name="remainingPaid"
                value={formData.remainingPaid}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <div className="text-right">
              <span className="text-sm text-muted-foreground">Due Amount:</span>
              <span
                className={`ml-2 text-xl font-bold ${dueAmount > 0 ? 'text-destructive' : 'text-green-600'}`}
              >
                {dueAmount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Fields */}
      {config?.customOrderFields && config.customOrderFields.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {config.customOrderFields.map((field: any, idx: number) => (
                <div key={idx} className="grid gap-2">
                  <Label>{field.label || field.name}</Label>
                  <Input
                    type={field.type || 'text'}
                    value={formData.customFieldsData[field.name] || ''}
                    onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Order'}
        </Button>
      </div>
    </form>
  )
}
