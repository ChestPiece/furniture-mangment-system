'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getDashboardStats({ tenantId }: { tenantId: string }) {
  const payload = await getPayload({ config: configPromise })

  try {
    // 1. Total Revenue (Sum of 'completed' payments)
    // Note: In a real large-scale app, we might want to cache this or use an aggregation pipeline.
    // Payload's find API doesn't support sum aggregation directly efficiently without writing logic.
    // We'll fetch all completed payments for the tenant.
    const payments = await payload.find({
      collection: 'payments',
      where: {
        and: [{ tenant: { equals: tenantId } }, { status: { equals: 'completed' } }],
      },
      limit: 0, // Get all? Caution with large data. For MVP fine.
      pagination: false,
    })

    const totalRevenue = payments.docs.reduce((acc, p) => acc + (p.amount || 0), 0)

    // 2. Total Orders
    const orders = await payload.find({
      collection: 'orders',
      where: {
        tenant: { equals: tenantId },
      },
      limit: 0,
    })

    const totalOrders = orders.totalDocs

    // 3. Low Stock Count
    const lowStockProduct = await payload.find({
      collection: 'products',
      where: {
        and: [
          { tenant: { equals: tenantId } },
          { stock: { less_than: 10 } }, // Hardcoded threshold for now
          { type: { not_equals: 'service' } },
        ],
      },
      limit: 0,
    })

    const lowStockCount = lowStockProduct.totalDocs

    // 4. Inventory Value
    // We need to iterate all products and sum (stock * cost)
    // Again, expensive operation for large datasets.
    const products = await payload.find({
      collection: 'products',
      where: {
        tenant: { equals: tenantId },
      },
      limit: 0,
      pagination: false,
    })

    const inventoryValue = products.docs.reduce((acc, p) => {
      return acc + (p.stock || 0) * (p.cost || 0)
    }, 0)

    return {
      totalRevenue,
      totalOrders,
      lowStockCount,
      inventoryValue,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalRevenue: 0,
      totalOrders: 0,
      lowStockCount: 0,
      inventoryValue: 0,
    }
  }
}
