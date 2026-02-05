import { CollectionConfig } from 'payload'
import { tenantFilter } from '@/access/tenantIsolation'
import { extractTenantId } from '@/lib/tenant-utils'

export const ProductionRuns: CollectionConfig = {
  slug: 'production-runs',
  admin: {
    defaultColumns: ['product', 'status', 'order'],
    useAsTitle: 'id',
  },
  access: {
    read: tenantFilter,
    create: tenantFilter,
    update: tenantFilter,
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
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
      name: 'orderItem',
      type: 'text',
      required: true, // ID of the specific item in the order
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Planned', value: 'planned' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Quality Check', value: 'quality_check' },
        { label: 'Completed', value: 'completed' },
      ],
      defaultValue: 'planned',
      required: true,
    },
    {
      name: 'stages',
      type: 'array',
      fields: [
        {
          name: 'stage',
          type: 'select',
          options: [
            { label: 'Cutting', value: 'cutting' },
            { label: 'Assembly', value: 'assembly' },
            { label: 'Sanding', value: 'sanding' },
            { label: 'Upholstery', value: 'upholstery' },
            { label: 'QC', value: 'qc' },
          ],
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Completed', value: 'completed' },
          ],
          defaultValue: 'pending',
        },
        {
          name: 'completedAt',
          type: 'date',
        },
        {
          name: 'assignedTo',
          type: 'relationship',
          relationTo: 'users',
        },
      ],
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
