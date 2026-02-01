import { CollectionConfig } from 'payload'
import { tenantFilter } from '../access/tenantIsolation'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'createdAt'],
  },
  access: {
    read: tenantFilter,
    create: ({ req: { user } }) => {
      // Allow owners and staff to create customers
      return Boolean(
        user?.roles?.includes('owner') ||
        user?.roles?.includes('staff') ||
        user?.roles?.includes('admin'),
      )
    },
    update: tenantFilter,
    delete: tenantFilter,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      index: true,
      validate: (val: any) => {
        // Allow +, spaces, dashes, parentheses and numbers
        if (typeof val !== 'string') return 'Invalid phone number format'
        if (!/^\+?[\d\s-()]+$/.test(val)) {
          return 'Invalid phone number format'
        }
        return true
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: {
        hidden: true,
      },
      access: {
        update: () => false,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          const user = req.user
          if (user && user.tenant && !data.tenant) {
            // Ensure we use the ID if tenant is an object
            const tenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant
            data.tenant = tenantId
          }
        }
        return data
      },
    ],
  },
  timestamps: true,
}
