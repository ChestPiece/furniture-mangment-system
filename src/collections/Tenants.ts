import { CollectionConfig } from 'payload'
import { tenantAdmins, tenantSelfAccess, tenantUsers } from '../access/tenantIsolation'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'active', 'createdAt'],
  },
  access: {
    read: tenantSelfAccess,
    create: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    update: tenantSelfAccess,
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'colorTheme',
      type: 'json',
      defaultValue: {
        primary: '#000000',
        secondary: '#ffffff',
      },
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'email',
          type: 'email',
        },
        {
          name: 'address',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
