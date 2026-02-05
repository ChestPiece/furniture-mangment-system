import { CollectionConfig } from 'payload'
import { tenantFilter } from '@/access/tenantIsolation'
import { extractTenantId } from '@/lib/tenant-utils'

export const Deliveries: CollectionConfig = {
  slug: 'deliveries',
  admin: {
    defaultColumns: ['order', 'status', 'scheduledDate', 'driver'],
    useAsTitle: 'id',
  },
  access: {
    read: tenantFilter,
    create: tenantFilter,
    update: tenantFilter,
    delete: tenantFilter,
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'In Transit', value: 'in_transit' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'pending',
      required: true,
    },
    {
      name: 'scheduledDate',
      type: 'date',
    },
    {
      name: 'driver',
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
    },
    {
      name: 'proofOfDelivery',
      type: 'upload',
      relationTo: 'media',
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
