import { CollectionConfig } from 'payload'
import { tenantAdmins, tenantFilter } from '../access/tenantIsolation'

export const Configurations: CollectionConfig = {
  slug: 'configurations',
  admin: {
    useAsTitle: 'tenant', // We'll customize this later or rely on ID
  },
  access: {
    read: tenantFilter,
    create: tenantAdmins,
    update: tenantAdmins,
    delete: tenantAdmins,
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'invoiceText',
      type: 'textarea',
      label: 'Invoice Footer Text',
    },
    {
      name: 'measurementUnits',
      type: 'array',
      label: 'Measurement Units',
      fields: [
        {
          name: 'unit',
          type: 'text',
          required: true,
        },
      ],
      defaultValue: [{ unit: 'feet' }, { unit: 'inches' }],
    },
    {
      name: 'productCategories',
      type: 'array',
      label: 'Product Categories',
      fields: [
        {
          name: 'category',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'customOrderFields',
      type: 'json',
      label: 'Custom Order Fields Configuration',
      admin: {
        description:
          'Define custom fields for orders (e.g., [{"name": "woodType", "label": "Wood Type", "type": "text"}])',
      },
    },
  ],
  timestamps: true,
}
