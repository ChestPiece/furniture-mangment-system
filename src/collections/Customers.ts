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
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: false,
      index: true,
      admin: {
        hidden: true, // Should be auto-populated
      },
      access: {
        update: () => false, // Prevent changing tenant
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          const user = req.user
          // console.log('[DEBUG] Creating customer. User:', user?.email, 'Roles:', user?.roles, 'Tenant:', user?.tenant)
          if (user && user.tenant && !data.tenant) {
            // console.log('[DEBUG] Auto-assigning tenant:', user.tenant)
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
