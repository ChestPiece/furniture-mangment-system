// ============================================
// Product Fields
// Reusable field patterns for products
// ============================================

import type { Field, ArrayField, FilterOptionsProps, Where } from 'payload'
import { PRODUCT_TYPE, COLLECTION_SLUGS, USER_ROLES } from '@/constants'
import { createSlugField, createMoneyField, createNotesField } from '@/fields/factories'
import { extractTenantId } from '@/lib/tenant/utils'

/**
 * Product name field
 */
export const productNameField: Field = {
  name: 'name',
  type: 'text',
  required: true,
  index: true,
}

/**
 * Product type field
 */
export const productTypeField: Field = {
  name: 'type',
  type: 'select',
  options: [
    { label: 'Finished Good', value: PRODUCT_TYPE.FINISHED_GOOD },
    { label: 'Raw Material', value: PRODUCT_TYPE.RAW_MATERIAL },
    { label: 'Service', value: PRODUCT_TYPE.SERVICE },
  ],
  defaultValue: PRODUCT_TYPE.FINISHED_GOOD,
  required: true,
}

/**
 * SKU field (globally unique)
 */
export const skuField: Field = {
  name: 'sku',
  type: 'text',
  unique: true,
  admin: {
    description: 'Stock Keeping Unit - unique identifier',
    position: 'sidebar',
  },
}

/**
 * Unit field
 */
export const unitField: Field = {
  name: 'unit',
  type: 'text',
  defaultValue: 'pcs',
  admin: {
    description: 'e.g., pcs, feet, kg, meters',
  },
}

/**
 * Price and cost row
 */
export const priceCostRow: Field = {
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
}

/**
 * Stock field (auto-calculated)
 */
export const stockField: Field = {
  name: 'stock',
  label: 'Total Stock',
  type: 'number',
  defaultValue: 0,
  admin: {
    readOnly: true,
    description: 'Auto-calculated sum of all warehouses',
  },
}

/**
 * Warehouse stock array
 */
export const warehouseStockField: ArrayField = {
  name: 'warehouseStock',
  type: 'array',
  admin: {
    readOnly: true,
    description: 'Managed via stock transactions',
  },
  fields: [
    {
      name: 'warehouse',
      type: 'relationship',
      relationTo: COLLECTION_SLUGS.WAREHOUSES,
      required: true,
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
  ],
}

/**
 * Product variants array
 */
export const variantsField: ArrayField = {
  name: 'variants',
  type: 'array',
  admin: {
    description: 'Product variations (size, color, etc.)',
  },
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
      min: 0,
    },
    {
      name: 'stock',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
  ],
}

/**
 * Bill of Materials (for finished goods)
 */
export const bomField: ArrayField = {
  name: 'bom',
  label: 'Bill of Materials',
  type: 'array',
  admin: {
    condition: (data) => data?.type === PRODUCT_TYPE.FINISHED_GOOD,
    description: 'Raw materials required to manufacture this product',
  },
  fields: [
    {
      name: 'material',
      type: 'relationship',
      relationTo: COLLECTION_SLUGS.PRODUCTS,
      required: true,
      filterOptions: ({ req }: FilterOptionsProps) => {
        const { user } = req
        const baseFilter: Record<string, unknown> = {
          type: { equals: PRODUCT_TYPE.RAW_MATERIAL },
        }
        if (user?.tenant && !user.roles?.includes(USER_ROLES.ADMIN)) {
          baseFilter.tenant = { equals: extractTenantId(user.tenant) }
        }
        return baseFilter as Where
      },
    },
    {
      name: 'quantity',
      type: 'number',
      min: 0,
      required: true,
    },
  ],
}

/**
 * Complete product fields array
 */
export const productFields: Field[] = [
  productNameField,
  createSlugField('name'),
  skuField,
  productTypeField,
  priceCostRow,
  unitField,
  stockField,
  warehouseStockField,
  variantsField,
  bomField,
  createNotesField('description'),
]
