import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { auth } from './auth'

// List all products for the current tenant
export const list = query({
  args: {
    tenantId: v.id('tenants'),
  },
  handler: async (ctx, args) => {
    // optional: verify user has access to this tenant
    return await ctx.db
      .query('products')
      .withIndex('by_tenant', (q) => q.eq('tenantId', args.tenantId))
      .collect()
  },
})

export const create = mutation({
  args: {
    tenantId: v.id('tenants'),
    name: v.string(),
    description: v.optional(v.string()),
    sku: v.string(),
    price: v.number(),
    cost: v.number(),
    stock: v.number(),
    type: v.optional(v.string()),
    unit: v.optional(v.string()),
    lowStockThreshold: v.number(),
    categoryId: v.optional(v.id('categories')),
    supplierId: v.optional(v.id('suppliers')),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    // TODO: Validate user permissions for this tenant

    const productId = await ctx.db.insert('products', args)
    return productId
  },
})

export const getLowStock = query({
  args: {
    tenantId: v.id('tenants'),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_tenant', (q) => q.eq('tenantId', args.tenantId))
      .collect()

    return products.filter((p) => p.stock <= p.lowStockThreshold)
  },
})
