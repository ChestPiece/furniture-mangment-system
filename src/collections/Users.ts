import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'tenant'],
  },
  auth: true,
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      // Admins can read all
      if (user.roles?.includes('admin')) return true
      // Owners can read users in their tenant
      if (user.roles?.includes('owner')) {
        return {
          tenant: {
            equals: user.tenant,
          },
        }
      }
      // Users can read themselves
      // Users can read themselves
      return {
        id: {
          equals: user.id,
        },
      } as any
    },
    create: ({ req: { user } }) => {
      // Only admins or owners can create users
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      if (user.roles?.includes('owner')) return true
      return false
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      // Owners can update users in their tenant
      if (user.roles?.includes('owner')) {
        // This needs more complex logic if we want to ensure they only update users in their tenant
        // For simplistic check, we can rely on row-level read access + verify in hook,
        // but access control query is safer.
        // However, `update` access query defines *what* they can update.
        return {
          tenant: {
            equals: user.tenant,
          },
        }
      }
      // Users can update themselves
      // Users can update themselves
      return {
        id: {
          equals: user.id,
        },
      } as any
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      if (user.roles?.includes('owner')) {
        return {
          tenant: {
            equals: user.tenant,
          },
        }
      }
      return false
    },
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'owner', 'staff'],
      defaultValue: ['staff'],
      required: true,
      saveToJWT: true,
      access: {
        update: ({ req: { user } }) => {
          // Only admin or owner can update roles
          return Boolean(user?.roles?.includes('admin') || user?.roles?.includes('owner'))
        },
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      // Required for everyone except global admins technically, but let's make it required generally
      // and optional for super-admins if needed, but for MVP strictness is good.
      // Actually, super-admins might not have a tenant.
      // Let's make it not required at DB level but validate in hooks.
      required: false,
      saveToJWT: true,
      index: true,
      access: {
        update: ({ req: { user } }) => {
          // Only admin can transfer users between tenants
          return Boolean(user?.roles?.includes('admin'))
        },
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Auto-assign tenant for non-admins creating users
        if (operation === 'create') {
          const user = req.user
          if (user && !user.roles?.includes('admin') && user.tenant) {
            data.tenant = user.tenant
          }
        }
        return data
      },
    ],
  },
}
