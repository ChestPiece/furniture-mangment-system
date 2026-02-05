'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getLowStockItems({
  tenantId,
  limit = 5,
}: {
  tenantId: string
  limit?: number
}) {
  const payload = await getPayload({ config: configPromise })

  try {
    const products = await payload.find({
      collection: 'products',
      where: {
        and: [
          { tenant: { equals: tenantId } },
          { stock: { less_than: 10 } },
          { type: { not_equals: 'service' } },
        ],
      },
      limit: limit,
      sort: 'stock', // Ascending stock (lowest first)
    })

    return products.docs
  } catch (error) {
    console.error('Error fetching low stock items:', error)
    return []
  }
}
