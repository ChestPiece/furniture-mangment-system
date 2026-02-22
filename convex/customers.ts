import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { auth } from './auth'

export const list = query({
  args: {
    tenantId: v.id('tenants'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('customers')
      .withIndex('by_tenant', (q) => q.eq('tenantId', args.tenantId))
      .collect()
  },
})

export const create = mutation({
  args: {
    tenantId: v.id('tenants'),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    type: v.union(v.literal('individual'), v.literal('business')),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const customerId = await ctx.db.insert('customers', {
      tenantId: args.tenantId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      address: args.address,
      type: args.type,
    })
    return customerId
  },
})

export const deleteCustomer = mutation({
  args: {
    id: v.id('customers'),
    tenantId: v.id('tenants'),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.id)
    if (!customer || customer.tenantId !== args.tenantId) {
      throw new Error('Customer not found or access denied')
    }

    await ctx.db.delete(args.id)
  },
})
