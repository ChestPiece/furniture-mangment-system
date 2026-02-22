import { v } from 'convex/values'
import { query } from './_generated/server'
import { auth } from './auth'

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) return null

    // For now, return the first tenant found.
    // In a real app, we'd lookup a tenant membership for this user.
    const tenant = await ctx.db.query('tenants').first()
    return tenant
  },
})
