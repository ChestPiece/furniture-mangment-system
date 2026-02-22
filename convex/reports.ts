import { v } from 'convex/values'
import { query } from './_generated/server'

export const dailySales = query({
  args: {
    tenantId: v.id('tenants'),
    date: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    // Simple filter by date string if we stored date string, or range query if stored as number
    // In schema, orders have `dueDate` (number). We might need `createdAt` or use `dueDate`.
    // Assuming `dueDate` or user adds `createdAt` automatically in Convex (via `_creationTime`).

    // For now, let's fetch all orders and filter in memory or use a range if we had a proper index.
    // Using _creationTime is reliable for "when the order was made".

    const startOfDay = new Date(args.date).getTime()
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000

    const orders = await ctx.db
      .query('orders')
      .withIndex('by_tenant', (q) => q.eq('tenantId', args.tenantId))
      .collect()

    // Filter for the specific date
    const dailyOrders = orders.filter(
      (o) => o._creationTime >= startOfDay && o._creationTime < endOfDay,
    )

    const totalSales = dailyOrders.reduce((sum, o) => sum + o.totalAmount, 0)

    return {
      totalOrders: dailyOrders.length,
      totalSales,
      orders: dailyOrders.map((o) => ({
        id: o._id,
        total: o.totalAmount,
        status: o.status,
      })),
    }
  },
})

export const pendingPayments = query({
  args: {
    tenantId: v.id('tenants'),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query('orders')
      .withIndex('by_tenant', (q) => q.eq('tenantId', args.tenantId))
      .filter((q) => q.eq(q.field('paymentStatus'), 'unpaid'))
      .collect()

    const totalPending = orders.reduce((sum, o) => sum + o.totalAmount, 0)

    // Need customer names. Fetching them efficiently?
    // We can use `Promise.all` to fetch customers for these orders.
    const ordersWithCustomer = await Promise.all(
      orders.map(async (o) => {
        const customer = await ctx.db.get(o.customerId)
        return {
          id: o._id,
          totalAmount: o.totalAmount,
          dueAmount: o.totalAmount, // Assuming full amount pending if unpaid
          customerName: customer?.name || 'Unknown',
        }
      }),
    )

    return {
      pendingPaymentCount: orders.length,
      totalPendingAmount: totalPending,
      orders: ordersWithCustomer,
    }
  },
})
