import { CollectionConfig } from 'payload'
import { tenantFilter } from '@/access/tenantIsolation'
import { extractTenantId } from '@/lib/tenant-utils'

export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    defaultColumns: ['order', 'amount', 'method', 'status', 'date'],
    useAsTitle: 'reference',
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
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'method',
      type: 'select',
      options: [
        { label: 'Cash', value: 'cash' },
        { label: 'JazzCash', value: 'jazzcash' },
        { label: 'Easypaisa', value: 'easypaisa' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
      ],
      required: true,
    },
    {
      name: 'reference',
      type: 'text',
      admin: {
        description: 'Transaction ID or Receipt No.',
      },
    },
    {
      name: 'date',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'completed',
      required: true,
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
