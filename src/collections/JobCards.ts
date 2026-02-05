import { CollectionConfig } from 'payload'
import { tenantFilter } from '@/access/tenantIsolation'
import { extractTenantId } from '@/lib/tenant-utils'

export const JobCards: CollectionConfig = {
  slug: 'job-cards',
  admin: {
    defaultColumns: ['id', 'stage', 'worker', 'status'],
  },
  access: {
    read: tenantFilter,
    create: tenantFilter,
    update: tenantFilter,
    delete: tenantFilter,
  },
  fields: [
    {
      name: 'productionRun',
      type: 'relationship',
      relationTo: 'production-runs',
      required: true,
    },
    {
      name: 'stage',
      type: 'text', // e.g., "Cutting"
      required: true,
    },
    {
      name: 'worker',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: ({ req: { user } }) => {
        if (user?.tenant) {
          return {
            tenant: { equals: extractTenantId(user.tenant) },
          }
        }
        return true
      },
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Assigned', value: 'assigned' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Done', value: 'done' },
      ],
      defaultValue: 'assigned',
    },
    {
      name: 'notes',
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
            data.tenant = extractTenantId(user.tenant)
          }
        }
        return data
      },
    ],
  },
}
