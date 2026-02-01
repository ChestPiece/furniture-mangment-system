import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { extractTenantId } from '@/lib/tenant-utils'
import { unstable_cache } from 'next/cache'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export const GET = async (req: NextRequest) => {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: req.headers })

  const tenantId = extractTenantId(user?.tenant)

  if (!user || !tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const result = querySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: result.error.format() },
        { status: 400 },
      )
    }

    const { page, limit } = result.data

    const getCachedReport = unstable_cache(
      async (tenantId: string, page: number, limit: number) => {
        const orders = await payload.find({
          collection: 'orders',
          where: {
            and: [
              {
                tenant: {
                  equals: tenantId,
                },
              },
              {
                status: {
                  not_equals: 'delivered',
                },
              },
            ],
          },
          depth: 1,
          limit: limit,
          page: page,
        })

        const pendingOrders = orders.docs
          .filter((order) => {
            const total = order.totalAmount || 0
            const paid = (order.advancePaid || 0) + (order.remainingPaid || 0)
            return total > paid
          })
          .map((order) => ({
            id: order.id,
            customerName:
              typeof order.customer === 'object' ? order.customer.name : 'Unknown Customer',
            totalAmount: order.totalAmount,
            dueAmount:
              (order.totalAmount || 0) - ((order.advancePaid || 0) + (order.remainingPaid || 0)),
            orderDate: order.orderDate,
            status: order.status,
          }))

        return {
          pendingPaymentCount: pendingOrders.length,
          totalPendingAmount: pendingOrders.reduce((sum, o) => sum + o.dueAmount, 0),
          orders: pendingOrders,
          pagination: {
            page: orders.page,
            totalPages: orders.totalPages,
            totalDocs: orders.totalDocs,
            limit: orders.limit,
          },
        }
      },
      [`pending-payments-${tenantId}`], // Cache key
      { revalidate: 60, tags: [`orders-tenant-${tenantId}`] }, // Revalidate every minute
    )

    const data = await getCachedReport(tenantId, page, limit)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
