import { CollectionConfig } from 'payload'
import { tenantFilter } from '@/access/tenantIsolation'
import { extractTenantId } from '@/lib/tenant-utils'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sku', 'type', 'stock', 'price'],
  },
  access: {
    read: tenantFilter,
    create: tenantFilter,
    update: tenantFilter,
    delete: tenantFilter,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ data, operation }) => {
            if (operation === 'create' || operation === 'update') {
              if (data?.text && !data.slug) {
                // simple slugify fallback if client doesn't provide it
                data.slug = data.text
                  .toLowerCase()
                  .replace(/ /g, '-')
                  .replace(/[^\w-]+/g, '')
              }
            }
            return data?.slug
          },
        ],
      },
    },
    {
      name: 'sku',
      type: 'text',
      unique: true, // Note: unique globally? Or unique per tenant? Payload unique is global. Will need hook to append tenantID if we want true multi-tenant uniqueness. For now keep simple.
      // Better strategy: composite index or scoped uniqueness. Payload doesn't support scoped unique OOTB easily.
      // We will rely on manual check or tenant prefixing if needed. For now, let's assume global SKU uniqueness is acceptable or managed by `beforeChange`.
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Finished Good', value: 'finished_good' },
        { label: 'Raw Material', value: 'raw_material' },
        { label: 'Service', value: 'service' },
      ],
      defaultValue: 'finished_good',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          label: 'Selling Price',
          type: 'number',
          min: 0,
        },
        {
          name: 'cost',
          label: 'Cost Price',
          type: 'number',
          min: 0,
        },
      ],
    },
    {
      name: 'unit',
      type: 'text',
      defaultValue: 'pcs',
    },
    {
      name: 'stock',
      label: 'Total Stock',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Auto-calculated sum of all warehouses',
      },
      defaultValue: 0,
    },
    {
      name: 'warehouseStock',
      type: 'array',
      admin: {
        readOnly: true, // Only updated via transactions
      },
      fields: [
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
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'variants',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'sku',
          type: 'text',
        },
        {
          name: 'price',
          type: 'number',
        },
        {
          name: 'stock',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'bom',
      label: 'Bill of Materials',
      type: 'array',
      admin: {
        condition: (data) => data?.type === 'finished_good',
      },
      fields: [
        {
          name: 'material',
          type: 'relationship',
          relationTo: 'products',
          filterOptions: ({ req: { user } }) => {
            // Only show Raw Materials and filter by tenant
            const baseFilter: any = {
              type: { equals: 'raw_material' },
            }
            if (user?.tenant) {
              baseFilter.tenant = { equals: extractTenantId(user.tenant) }
            }
            return baseFilter
          },
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          min: 0,
          required: true,
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
