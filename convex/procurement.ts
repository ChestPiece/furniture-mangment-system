import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { auth } from './auth'

export const createPO = mutation({
  args: {
    tenantId: v.id('tenants'),
    supplierId: v.id('suppliers'),
    poNumber: v.string(),
    items: v.array(
      v.object({
        productId: v.id('products'),
        quantity: v.number(),
        cost: v.number(),
      }),
    ),
    totalAmount: v.number(),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const poId = await ctx.db.insert('purchase_orders', {
      tenantId: args.tenantId,
      supplierId: args.supplierId,
      poNumber: args.poNumber,
      status: 'ordered',
      totalAmount: args.totalAmount,
      date: args.date,
    })

    for (const item of args.items) {
      await ctx.db.insert('purchase_order_items', {
        purchaseOrderId: poId,
        productId: item.productId,
        quantity: item.quantity,
        cost: item.cost,
      })
    }

    return poId
  },
})

export const receivePO = mutation({
  args: {
    poId: v.id('purchase_orders'),
    tenantId: v.id('tenants'),
  },
  handler: async (ctx, args) => {
    const po = await ctx.db.get(args.poId)
    if (!po) throw new Error('PO not found')
    if (po.status === 'received') throw new Error('Already received')

    await ctx.db.patch(args.poId, { status: 'received' })

    const items = await ctx.db
      .query('purchase_order_items')
      .withIndex('by_po', (q) => q.eq('purchaseOrderId', args.poId))
      .collect()

    // Update stock
    for (const item of items) {
      const product = await ctx.db.get(item.productId)
      if (product) {
        await ctx.db.patch(item.productId, {
          stock: product.stock + item.quantity,
        })

        await ctx.db.insert('stock_transactions', {
          tenantId: args.tenantId,
          productId: item.productId,
          warehouseId: 'TODO_DEFAULT' as any,
          type: 'purchase_receive',
          quantity: item.quantity,
          reference: `PO ${po.poNumber}`,
        })
      }
    }
  },
})

export const listPOs = query({
  args: {
    tenantId: v.id('tenants'),
  },
  handler: async (ctx, args) => {
    const pos = await ctx.db
      .query('purchase_orders')
      .withIndex('by_tenant', (q) => q.eq('tenantId', args.tenantId))
      .order('desc')
      .collect()

    // Join with Supplier name?
    const posWithSupplier = await Promise.all(
      pos.map(async (po) => {
        const supplier = await ctx.db.get(po.supplierId)
        return {
          ...po,
          supplierName: supplier?.name || 'Unknown',
        }
      }),
    )

    return posWithSupplier
  },
})

// Production Runs logic could also go here or in separate file
export const listProductionRuns = query({
  args: {
    tenantId: v.id('tenants'),
  },
  handler: async (ctx, args) => {
    const runs = await ctx.db
      .query('production_runs')
      .withIndex('by_tenant', (q) => q.eq('tenantId', args.tenantId))
      .collect()
    return runs
  },
})
