import { CollectionConfig } from 'payload'
import { tenantFilter } from '@/access/tenantIsolation'
import { extractTenantId } from '@/lib/tenant-utils'

export const StockTransactions: CollectionConfig = {
  slug: 'stock-transactions',
  admin: {
    defaultColumns: ['date', 'product', 'type', 'quantity', 'warehouse'],
    useAsTitle: 'id',
  },
  access: {
    read: tenantFilter,
    create: tenantFilter,
    update: () => false, // Immutable!
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')), // Only admin can delete if strictly needed
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Purchase Receive', value: 'purchase_receive' },
        { label: 'Order Deduction', value: 'order_deduction' },
        { label: 'Manual Adjustment', value: 'manual_adjust' },
        { label: 'Return', value: 'return' },
        { label: 'Waste', value: 'waste' },
      ],
      required: true,
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'warehouse',
      type: 'relationship',
      relationTo: 'warehouses',
      required: true,
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      admin: {
        description: 'Positive for adding stock, negative for removing.',
      },
    },
    {
      name: 'reference',
      type: 'text',
      admin: {
        placeholder: 'Order #123, PO #456',
      },
    },
    {
      name: 'supplier',
      type: 'relationship',
      relationTo: 'suppliers',
      admin: {
        condition: (data) => data?.type === 'purchase_receive',
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
    // Recalculate stock on any change
    afterChange: [
      async ({ doc, req }) => {
        if (doc.product && doc.tenant) {
          const productId = typeof doc.product === 'string' ? doc.product : doc.product.id
          const tenantId = typeof doc.tenant === 'string' ? doc.tenant : doc.tenant.id

          // Asynchronously update stock to avoid blocking response?
          // For data integrity, better to await, or catch errors.
          // Since we are in an agentic context, let's await to be safe.
          const { recalculateProductStock } = await import('@/lib/stockUtils')
          await recalculateProductStock({
            payload: req.payload,
            productId,
            tenantId,
          })
        }
        return doc
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (doc.product && doc.tenant) {
          const productId = typeof doc.product === 'string' ? doc.product : doc.product.id
          const tenantId = typeof doc.tenant === 'string' ? doc.tenant : doc.tenant.id

          const { recalculateProductStock } = await import('@/lib/stockUtils')
          await recalculateProductStock({
            payload: req.payload,
            productId,
            tenantId,
          })
        }
        return doc
      },
    ],
  },
}
