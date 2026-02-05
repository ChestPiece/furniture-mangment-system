import type { CollectionConfig, Where } from 'payload'

import { extractTenantId } from '@/lib/tenant-utils'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'roles', 'tenant'],
  },
  auth: true,
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      // Admins can read all
      if (user.roles?.includes('admin')) return true
      // Owners can read users in their tenant
      if (user.roles?.includes('owner')) {
        const tenantId = extractTenantId(user.tenant)
        return {
          tenant: {
            equals: tenantId,
          },
        } as Where
      }
      // Users can read themselves
      return {
        id: {
          equals: user.id,
        },
      } as Where
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
        const tenantId = extractTenantId(user.tenant)
        return {
          tenant: {
            equals: tenantId,
          },
        } as Where
      }
      // Users can update themselves
      return {
        id: {
          equals: user.id,
        },
      } as Where
    },
    delete: ({ req: { user } }) => {
      if (!user) return false

      const godAdminEmail = process.env.GOD_ADMIN_EMAIL

      if (user.roles?.includes('admin')) {
        if (godAdminEmail) {
          return {
            email: {
              not_equals: godAdminEmail,
            },
          } as Where
        }
        return true
      }

      if (user.roles?.includes('owner')) {
        const tenantId = extractTenantId(user.tenant)
        // Owners also cannot delete God Admin (redundant if they can't even see/manage admins, but safe)
        if (godAdminEmail) {
          return {
            and: [
              {
                tenant: {
                  equals: tenantId,
                },
              },
              {
                email: {
                  not_equals: godAdminEmail,
                },
              },
            ],
          } as Where
        }

        return {
          tenant: {
            equals: tenantId,
          },
        } as Where
      }
      return false
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'owner', 'staff'],
      defaultValue: ['staff'],
      required: true,
      saveToJWT: true,
      access: {
        update: () => true,
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
        update: () => true,
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          const user = req.user

          // Auto-assign tenant for non-admins creating users
          if (user && !user.roles?.includes('admin') && user.tenant) {
            data.tenant = user.tenant
          }

          // Validate: non-admins MUST have a tenant
          // We check if the NEW user being created has 'admin' role.
          // If not, they must have a tenant assigned.
          const isNewUserAdmin = data.roles?.includes('admin')
          if (!isNewUserAdmin && !data.tenant) {
            throw new Error('Tenant is required for non-admin users')
          }
        }
        return data
      },
    ],
  },
}
