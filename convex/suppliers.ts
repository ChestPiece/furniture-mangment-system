import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { auth } from './auth'

export const list = query({
  args: {
    tenantId: v.id('tenants'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('suppliers')
      .withIndex('by_tenant', (q) => q.eq('tenantId', args.tenantId))
      .collect()
  },
})

export const create = mutation({
  args: {
    tenantId: v.id('tenants'),
    name: v.string(),
    contactPerson: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const supplierId = await ctx.db.insert('suppliers', {
      tenantId: args.tenantId,
      name: args.name,
      contactPerson: args.contactPerson,
      email: args.email,
      phone: args.phone,
      address: args.address,
    })
    return supplierId
  },
})
