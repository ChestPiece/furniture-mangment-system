import { CollectionConfig } from 'payload'
import { tenantFilter } from '@/access/tenantIsolation'
import { extractTenantId } from '@/lib/tenant-utils'

export const PurchaseOrders: CollectionConfig = {
  slug: 'purchase-orders',
  admin: {
    defaultColumns: ['id', 'supplier', 'status', 'totalCost', 'expectedDeliveryDate'],
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
      name: 'supplier',
      type: 'relationship',
      relationTo: 'suppliers',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Ordered', value: 'ordered' },
        { label: 'Received', value: 'received' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'draft',
      required: true,
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
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'unitCost',
          type: 'number',
          min: 0,
        },
      ],
    },
    {
      name: 'totalCost',
      type: 'number',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            // Simple calculation hook
            if (data?.items && Array.isArray(data.items)) {
              return data.items.reduce(
                (acc: number, item: any) => acc + (item.quantity || 0) * (item.unitCost || 0),
                0,
              )
            }
            return data?.totalCost
          },
        ],
      },
    },
    {
      name: 'expectedDeliveryDate',
      type: 'date',
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
      // Logic to trigger Receive PO will be in a dedicated utility or afterChange hook if we want automation.
      // For now, let's keep it manual via API/Utility call to ensure we don't accidentally receive twice.
      // Re-receiving logic should be handled carefully.
    ],
  },
}
