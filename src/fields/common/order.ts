// ============================================
// Order Fields
// Reusable field patterns for orders
// ============================================

import type { Field, ArrayField, FilterOptionsProps } from 'payload'
import {
  ORDER_STATUS,
  ORDER_TYPE,
  PAYMENT_STATUS,
  PRODUCTION_ITEM_STATUS,
  COLLECTION_SLUGS,
  USER_ROLES,
} from '@/constants'
import { createCustomerField, createMoneyField, createDateField } from '@/fields/factories'
import { createStatusField } from '@/fields/factories'
import { extractTenantId } from '@/lib/tenant/utils'

/**
 * Order type field
 */
export const orderTypeField: Field = {
  name: 'type',
  type: 'select',
  options: [
    { label: 'Ready-Made', value: ORDER_TYPE.READY_MADE },
    { label: 'Custom', value: ORDER_TYPE.CUSTOM },
  ],
  required: true,
  defaultValue: ORDER_TYPE.READY_MADE,
}

/**
 * Order status field
 */
export const orderStatusField = createStatusField({
  options: [
    { label: 'Pending', value: ORDER_STATUS.PENDING },
    { label: 'In Progress', value: ORDER_STATUS.IN_PROGRESS },
    { label: 'Delivered', value: ORDER_STATUS.DELIVERED },
  ],
  defaultValue: ORDER_STATUS.PENDING,
})

/**
 * Payment status field
 */
export const paymentStatusField: Field = {
  name: 'paymentStatus',
  type: 'select',
  options: [
    { label: 'Unpaid', value: PAYMENT_STATUS.UNPAID },
    { label: 'Partial', value: PAYMENT_STATUS.PARTIAL },
    { label: 'Paid', value: PAYMENT_STATUS.PAID },
  ],
  defaultValue: PAYMENT_STATUS.UNPAID,
  admin: {
    position: 'sidebar',
  },
}

/**
 * Payment amount fields
 */
export const paymentFields: Field[] = [
  createMoneyField('totalAmount', { required: true }),
  createMoneyField('advancePaid', { defaultValue: 0 }),
  createMoneyField('remainingPaid', { defaultValue: 0 }),
  {
    name: 'dueAmount',
    type: 'number',
    virtual: true,
    admin: {
      position: 'sidebar',
      readOnly: true,
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
  } as Field,
]

/**
 * Order item production status
 */
export const productionStatusField: Field = {
  name: 'productionStatus',
  type: 'select',
  options: [
    { label: 'Pending', value: PRODUCTION_ITEM_STATUS.PENDING },
    { label: 'In Production', value: PRODUCTION_ITEM_STATUS.IN_PRODUCTION },
    { label: 'Ready for Delivery', value: PRODUCTION_ITEM_STATUS.READY },
    { label: 'Delivered', value: PRODUCTION_ITEM_STATUS.DELIVERED },
  ],
  defaultValue: PRODUCTION_ITEM_STATUS.PENDING,
}

/**
 * Order items array field
 */
export const orderItemsField: ArrayField = {
  name: 'items',
  type: 'array',
  required: true,
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: COLLECTION_SLUGS.PRODUCTS,
      required: true,
      filterOptions: ({ req }: FilterOptionsProps) => {
        const { user } = req
        if (!user) return false
        const baseFilter: Record<string, unknown> = {
          type: { equals: 'finished_good' },
        }
        if (user.tenant && !user.roles?.includes(USER_ROLES.ADMIN)) {
          baseFilter.tenant = { equals: extractTenantId(user.tenant) }
        }
        return baseFilter
      },
    } as Field,
    {
      name: 'variant',
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
    createMoneyField('price', { required: true }),
    {
      name: 'customizations',
      type: 'json',
    },
    productionStatusField,
  ],
}

/**
 * Custom fields data (for dynamic form fields)
 */
export const customFieldsData: Field = {
  name: 'customFieldsData',
  type: 'json',
  admin: {
    description: 'Stores dynamic fields defined in configuration',
  },
}

/**
 * Order date field with default
 */
export const orderDateField = createDateField('orderDate', {
  required: true,
  defaultToNow: true,
  index: true,
})

/**
 * Delivery date field
 */
export const deliveryDateField = createDateField('deliveryDate')

/**
 * Complete order fields array (excluding tenant - that's added by the collection factory)
 */
export const orderFields: Field[] = [
  createCustomerField(true),
  orderTypeField,
  orderDateField,
  deliveryDateField,
  ...paymentFields,
  orderStatusField as Field,
  orderItemsField,
  paymentStatusField,
  customFieldsData,
]
