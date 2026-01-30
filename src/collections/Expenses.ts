import { CollectionConfig } from 'payload'
import { tenantFilter } from '../access/tenantIsolation'

export const Expenses: CollectionConfig = {
  slug: 'expenses',
  admin: {
    defaultColumns: ['title', 'amount', 'date'],
  },
  access: {
    read: tenantFilter,
    create: ({ req: { user } }) =>
      Boolean(user?.roles?.includes('owner') || user?.roles?.includes('admin')),
    update: tenantFilter,
    delete: tenantFilter,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'description',
      type: 'textarea',
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
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          const user = req.user
          if (user && user.tenant && !user.roles?.includes('admin')) {
            data.tenant = user.tenant
          }
        }
        return data
      },
    ],
  },
  timestamps: true,
}
