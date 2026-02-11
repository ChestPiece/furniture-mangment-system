import type { CollectionConfig } from 'payload'
import { userCollectionAccess } from '@/access/presets'
import { createUserTenantHook } from '@/lib/tenant/hooks'
import { createTenantField } from '@/fields/factories'
import { USER_ROLES } from '@/constants'

/**
 * Users Collection
 *
 * Authentication-enabled collection with:
 * - Multi-tenant isolation
 * - Role-based access control (admin, owner, staff)
 * - Tenant auto-assignment for non-admins
 *
 * @access User-specific with tenant isolation
 * @hooks Validates tenant requirement, auto-assigns tenant
 */
export const Users: CollectionConfig = {
  slug: 'users',

  auth: true,

  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'roles', 'tenant'],
  },

  access: userCollectionAccess,

  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Display name for the user',
      },
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Admin', value: USER_ROLES.ADMIN },
        { label: 'Owner', value: USER_ROLES.OWNER },
        { label: 'Staff', value: USER_ROLES.STAFF },
      ],
      defaultValue: [USER_ROLES.STAFF],
      required: true,
      saveToJWT: true,
    },
    createTenantField({
      required: false,
      hidden: false,
    }),
  ],

  hooks: {
    beforeChange: [createUserTenantHook()],
  },

  timestamps: true,
}
