// ============================================
// Field Factories
// Reusable field patterns for collections
// ============================================

import type { Field, RelationshipField, SelectField, FilterOptionsProps, Where } from 'payload'
import type { TenantFieldOptions, StatusFieldOptions, TenantRelationshipOptions } from '@/types'
import { extractTenantId } from '@/lib/tenant/utils'
import { COLLECTION_SLUGS, USER_ROLES } from '@/constants'

// ============================================
// Core Field Factories
// ============================================

/**
 * Factory: Create a tenant relationship field
 * Used across all tenant-isolated collections
 */
export const createTenantField = (options: TenantFieldOptions = {}): RelationshipField => {
  const { required = true, hidden = true } = options

  return {
    name: 'tenant',
    type: 'relationship',
    relationTo: COLLECTION_SLUGS.TENANTS,
    required,
    index: true,
    saveToJWT: true,
    admin: {
      hidden,
      position: 'sidebar',
    },
    access: {
      update: () => true,
    },
  }
}

/**
 * Factory: Create a status select field
 */
export const createStatusField = (options: StatusFieldOptions): SelectField => {
  const { options: selectOptions, defaultValue, required = true, index = true } = options

  return {
    name: 'status',
    type: 'select',
    options: selectOptions,
    defaultValue,
    required,
    index,
    admin: {
      position: 'sidebar',
    },
  }
}

/**
 * Factory: Create a relationship field with tenant filtering
 */
export const createTenantRelationshipField = (
  options: TenantRelationshipOptions,
): RelationshipField => {
  const { relationTo, required = false, index = false, filterOptions: additionalFilters } = options

  const filterFn = ({ req }: FilterOptionsProps): boolean | Where => {
    const { user } = req
    if (!user) return false

    // Admin sees everything
    if (user.roles?.includes(USER_ROLES.ADMIN)) {
      if (!additionalFilters) return true
      return additionalFilters as Where
    }

    // Build tenant filter
    const tenantId = extractTenantId(user.tenant)
    const baseFilter: Where = tenantId
      ? { tenant: { equals: tenantId } }
      : ({} as Where)

    // Merge with additional filters
    if (additionalFilters) {
      return {
        and: [baseFilter, additionalFilters as Where],
      }
    }

    return baseFilter
  }

  return {
    name: relationTo.replace('-', ''), // Simple naming convention
    type: 'relationship',
    relationTo: relationTo as 'users', // Cast to satisfy type system
    required,
    index,
    filterOptions: filterFn,
  }
}

/**
 * Factory: Create customer relationship field
 */
export const createCustomerField = (required = true): RelationshipField => ({
  name: 'customer',
  type: 'relationship',
  relationTo: COLLECTION_SLUGS.CUSTOMERS,
  required,
  index: true,
  filterOptions: ({ req }: FilterOptionsProps) => {
    const { user } = req
    if (!user) return false

    if (user.roles?.includes(USER_ROLES.ADMIN)) {
      return true
    }

    const tenantId = extractTenantId(user.tenant)
    if (tenantId) {
      return {
        tenant: { equals: tenantId },
      } as Where
    }

    return false
  },
})

/**
 * Factory: Create product relationship field
 */
export const createProductField = (required = true): RelationshipField => ({
  name: 'product',
  type: 'relationship',
  relationTo: COLLECTION_SLUGS.PRODUCTS,
  required,
  index: true,
  filterOptions: ({ req }: FilterOptionsProps) => {
    const { user } = req
    if (!user) return false

    const baseFilter: Record<string, unknown> = {
      type: { equals: 'finished_good' },
    }

    if (user.roles?.includes(USER_ROLES.ADMIN)) {
      return baseFilter as Where
    }

    const tenantId = extractTenantId(user.tenant)
    if (tenantId) {
      baseFilter.tenant = { equals: tenantId }
    }

    return baseFilter as Where
  },
})

/**
 * Factory: Create a date field with default value
 */
export const createDateField = (
  name: string,
  options: { required?: boolean; defaultToNow?: boolean; index?: boolean } = {},
): Field => {
  const { required = false, defaultToNow = false, index = false } = options

  return {
    name,
    type: 'date',
    required,
    index,
    defaultValue: defaultToNow ? () => new Date().toISOString() : undefined,
    admin: {
      date: {
        pickerAppearance: 'dayAndTime',
      },
    },
  }
}

/**
 * Factory: Create a slug field that auto-generates from another field
 */
export const createSlugField = (sourceField: string = 'name'): Field => {
  return {
    name: 'slug',
    type: 'text',
    index: true,
    admin: {
      position: 'sidebar',
      description: 'Auto-generated from ' + sourceField,
    },
    hooks: {
      beforeValidate: [
        ({ data, operation }) => {
          if ((operation === 'create' || operation === 'update') && data) {
            const source = data[sourceField]
            if (source && !data.slug) {
              data.slug = String(source)
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]+/g, '')
            }
          }
          return data?.slug
        },
      ],
    },
  }
}

/**
 * Factory: Create money/amount field
 */
export const createMoneyField = (
  name: string,
  options: { required?: boolean; min?: number; defaultValue?: number } = {},
): Field => {
  const { required = false, min = 0, defaultValue } = options

  return {
    name,
    type: 'number',
    required,
    min,
    defaultValue,
    admin: {
      description: 'Amount in PKR',
    },
  }
}

/**
 * Factory: Create a notes/description textarea field
 */
export const createNotesField = (name: string = 'notes'): Field => {
  return {
    name,
    type: 'textarea',
    admin: {
      rows: 4,
    },
  }
}

// ============================================
// Field Groups
// ============================================

/**
 * Create a row of money fields (price and cost)
 */
export const createPriceCostFields = (): Field[] => [
  {
    type: 'row',
    fields: [
      createMoneyField('price', { required: true }),
      createMoneyField('cost'),
    ],
  },
]

/**
 * Create common timestamp fields override
 */
export const createTimestampFields = (): Field[] => [
  {
    name: 'createdAt',
    type: 'date',
    admin: {
      readOnly: true,
      position: 'sidebar',
    },
  },
  {
    name: 'updatedAt',
    type: 'date',
    admin: {
      readOnly: true,
      position: 'sidebar',
    },
  },
]
