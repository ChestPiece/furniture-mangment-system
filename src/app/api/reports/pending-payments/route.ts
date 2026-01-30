import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest) => {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ req })

  if (!user || !user.tenant) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // We can't query by virtual fields directly in MongoDB usually (unless saved)
    // payload-types says dueAmount is virtual.
    // So we query generally (or filter where status != delivered) and filter in memory,
    // OR we query where remainingPaid + advancePaid < totalAmount?
    // Math queries can be tricky in MongoDB/Payload without aggregation.
    // Let's fetch non-delivered orders as a proxy for "likely pending payments" or fetch all active/pending/in_progress.
    // Or, actually, "dueAmount" logic is simple: total > advance + remaining.
    // We can't do arbitrary math in `where` easily.
    // We will fetch orders that are NOT delivered first, as delivered usually means paid.
    // But requirement says "Remaining payment is collected... Order is marked as delivered".
    // So "not delivered" is a good candidate set.

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
            status: {
              not_equals: 'delivered',
            },
          },
        ],
      },
      depth: 1, // To get customer name
      limit: 1000,
    })

    // Filter in memory for dueAmount > 0
    const pendingOrders = orders.docs
      .filter((order) => {
        const total = order.totalAmount || 0
        const paid = (order.advancePaid || 0) + (order.remainingPaid || 0)
        return total > paid
      })
      .map((order) => ({
        id: order.id,
        customerName: typeof order.customer === 'object' ? order.customer?.name : 'Unknown',
        totalAmount: order.totalAmount,
        dueAmount:
          (order.totalAmount || 0) - ((order.advancePaid || 0) + (order.remainingPaid || 0)),
        orderDate: order.orderDate,
        status: order.status,
      }))

    return NextResponse.json({
      pendingPaymentCount: pendingOrders.length,
      totalPendingAmount: pendingOrders.reduce((sum, o) => sum + o.dueAmount, 0),
      orders: pendingOrders,
    })
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
