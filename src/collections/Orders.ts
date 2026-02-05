import { CollectionConfig } from 'payload'
import { tenantFilter } from '@/access/tenantIsolation'
import { extractTenantId } from '@/lib/tenant-utils'

/**
 * Orders Collection
 *
 * Manages customer orders including status tracking, financial details, and custom fields.
 * Includes tenant isolation and validation for payment amounts.
 *
 * @property {string} status - Indexed for performance. Options: pending, in_progress, delivered.
 * @property {number} dueAmount - Virtual field calculated from totalAmount - paid amounts.
 */
export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id', // Will change to something more useful if needed, maybe a virtual field
    defaultColumns: ['orderDate', 'customer', 'status', 'totalAmount', 'dueAmount'],
  },
  access: {
    read: tenantFilter,
    create: ({ req: { user } }) => Boolean(user), // Restrict more if needed
    update: tenantFilter,
    delete: tenantFilter,
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      index: true,
      filterOptions: ({ req: { user } }) => {
        if (user?.tenant) {
          return {
            tenant: {
              equals: extractTenantId(user.tenant),
            },
          }
        }
        return true
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Ready-Made', value: 'ready-made' },
        { label: 'Custom', value: 'custom' },
      ],
      required: true,
      defaultValue: 'ready-made',
    },
    {
      name: 'orderDate',
      type: 'date',
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'deliveryDate',
      type: 'date',
    },
    {
      name: 'totalAmount',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'advancePaid',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'remainingPaid',
      type: 'number',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'dueAmount',
      type: 'number',
      virtual: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        afterRead: [
          ({ data }) => {
            const total = data?.totalAmount || 0
            const advance = data?.advancePaid || 0
            const remaining = data?.remainingPaid || 0
            return Math.max(0, total - advance - remaining)
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Delivered', value: 'delivered' },
      ],
      defaultValue: 'pending',
      required: true,
      index: true,
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          filterOptions: ({ req: { user } }) => {
            if (user?.tenant) {
              return {
                and: [
                  { tenant: { equals: extractTenantId(user.tenant) } },
                  { type: { equals: 'finished_good' } },
                ],
              } as any
            }
            return { type: { equals: 'finished_good' } }
          },
        },
        {
          name: 'variant', // Store SKU or Variant Name? Let's store SKU for precision if possible, or object
          type: 'text',
          admin: { description: 'SKU or Name of the selected variant' },
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 1,
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'customizations',
          type: 'json',
        },
        {
          name: 'productionStatus',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'In Production', value: 'in_production' },
            { label: 'Ready for Delivery', value: 'ready' },
            { label: 'Delivered', value: 'delivered' },
          ],
          defaultValue: 'pending',
        },
      ],
    },
    {
      name: 'paymentStatus',
      type: 'select',
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Partial', value: 'partial' },
        { label: 'Paid', value: 'paid' },
      ],
      defaultValue: 'unpaid',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'customFieldsData',
      type: 'json', // Stores dynamic fields defined in configuration
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
        // Auto-assign tenant
        if (operation === 'create') {
          const user = req.user
          if (user && user.tenant && !user.roles?.includes('admin')) {
            data.tenant = extractTenantId(user.tenant)
          }
        }

        // Validate payments
        const total = data.totalAmount || 0
        const advance = data.advancePaid || 0
        const remaining = data.remainingPaid || 0

        if (advance + remaining > total) {
          throw new Error('Total paid cannot exceed order amount')
        }

        // Validate status vs payments
        if (data.status === 'delivered') {
          const due = Math.max(0, total - advance - remaining)
          if (due > 0) {
            throw new Error('Cannot mark as delivered while there is a due amount')
          }
        }

        return data
      },
    ],
  },
  timestamps: true,
}
