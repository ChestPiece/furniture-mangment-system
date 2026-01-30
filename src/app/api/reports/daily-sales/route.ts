import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest) => {
  const payload = await getPayload({ config: configPromise })

  // Extract user from request - assuming Payload's withPayload functionality or similar
  // For Next.js app router, we usually get user via `payload.auth(req)`
  // @ts-ignore - NextRequest is compatible enough for auth purposes
  const { user } = await payload.auth({ req })

  if (!user || !user.tenant) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse date query param
  const url = new URL(req.url)
  const dateStr = url.searchParams.get('date')
  const date = dateStr ? new Date(dateStr) : new Date()

  // Start of day
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  // End of day
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  try {
    const orders = await payload.find({
      collection: 'orders',
      where: {
        and: [
          {
            tenant: {
              equals: user.tenant,
            },
          },
          {
            orderDate: {
              greater_than_equal: startOfDay.toISOString(),
            },
          },
          {
            orderDate: {
              less_than_equal: endOfDay.toISOString(),
            },
          },
        ],
      },
      depth: 0,
      limit: 1000, // Reasonable limit for daily orders
    })

    const totalSales = orders.docs.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    const totalOrders = orders.totalDocs

    return NextResponse.json({
      date: date.toISOString(),
      totalSales,
      totalOrders,
      orders: orders.docs.map((o) => ({
        id: o.id,
        total: o.totalAmount,
        status: o.status,
      })),
    })
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
