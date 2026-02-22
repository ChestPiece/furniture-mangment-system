import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { auth } from './auth'

export const list = query({
  args: {
    tenantId: v.id('tenants'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('orders')
      .withIndex('by_tenant', (q) => q.eq('tenantId', args.tenantId))
      .order('desc')
      .take(20)
  },
})

export const getStats = query({
  args: {
    tenantId: v.id('tenants'),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query('orders')
      .withIndex('by_tenant', (q) => q.eq('tenantId', args.tenantId))
      .collect()

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const activeOrders = orders.filter(
      (o) => o.status === 'processing' || o.status === 'pending',
    ).length

    return {
      totalRevenue,
      totalOrders: orders.length,
      activeOrders,
    }
  },
})

export const create = mutation({
  args: {
    tenantId: v.id('tenants'),
    customerId: v.id('customers'),
    orderNumber: v.string(),
    items: v.array(
      v.object({
        productId: v.id('products'),
        quantity: v.number(),
        price: v.number(),
      }),
    ),
    totalAmount: v.number(),
    dueDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const orderId = await ctx.db.insert('orders', {
      tenantId: args.tenantId,
      customerId: args.customerId,
      orderNumber: args.orderNumber,
      status: 'pending',
      paymentStatus: 'unpaid',
      totalAmount: args.totalAmount,
      dueDate: args.dueDate,
    })

    for (const item of args.items) {
      await ctx.db.insert('order_items', {
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })

      // Decrement stock
      const product = await ctx.db.get(item.productId)
      if (product) {
        await ctx.db.patch(item.productId, {
          stock: product.stock - item.quantity,
        })

        await ctx.db.insert('stock_transactions', {
          tenantId: args.tenantId,
          productId: item.productId,
          warehouseId: 'TODO_DEFAULT_WAREHOUSE_ID' as any, // Needs resolution
          type: 'out',
          quantity: item.quantity,
          reference: `Order ${args.orderNumber}`,
        })
      }
    }

    return orderId
  },
})
