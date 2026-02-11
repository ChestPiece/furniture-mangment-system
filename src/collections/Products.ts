import type { CollectionConfig } from 'payload'
import { tenantIsolatedRelaxedAccess } from '@/access/presets'
import { createTenantManagementHook } from '@/lib/tenant/hooks'
import { createTenantField } from '@/fields/factories'
import { productFields } from '@/fields/common/product'

/**
 * Products Collection
 *
 * Manages product catalog including:
 * - Product types (finished good, raw material, service)
 * - Pricing (selling price and cost price)
 * - Stock management across warehouses
 * - Product variants
 * - Bill of Materials (BOM) for manufacturing
 *
 * @access Tenant-isolated with relaxed permissions
 * @hooks Auto-assigns tenant
 */
export const Products: CollectionConfig = {
  slug: 'products',

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sku', 'type', 'stock', 'price'],
    description: 'Product catalog with inventory tracking',
  },

  access: tenantIsolatedRelaxedAccess,

  fields: [
    ...productFields,
    createTenantField(),
  ],

  hooks: {
    beforeChange: [createTenantManagementHook()],
  },

  timestamps: true,
}
