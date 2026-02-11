import type { CollectionConfig } from 'payload'
import { tenantIsolatedRelaxedAccess } from '@/access/presets'
import { createTenantManagementHook } from '@/lib/tenant/hooks'
import { orderFields } from '@/fields/common/order'
import { BUSINESS_ERROR_MESSAGES } from '@/constants/messages'

/**
 * Orders Collection
 *
 * Manages customer orders including:
 * - Status tracking (pending → in_progress → delivered)
 * - Financial details (total, advance, remaining, due)
 * - Payment validation
 * - Order items with production status
 *
 * @access Tenant-isolated with relaxed permissions (staff can create)
 * @hooks Auto-assigns tenant, validates payment amounts
 */
export const Orders: CollectionConfig = {
  slug: 'orders',

  admin: {
    useAsTitle: 'id',
    defaultColumns: ['orderDate', 'customer', 'status', 'totalAmount', 'dueAmount'],
    description: 'Customer orders with payment tracking and production status',
  },

  access: tenantIsolatedRelaxedAccess,

  fields: orderFields,

  hooks: {
    beforeChange: [
      // Auto-assign tenant and validate
      createTenantManagementHook(),

      // Validate payment amounts
      async ({ data }) => {
        const total = data.totalAmount || 0
        const advance = data.advancePaid || 0
        const remaining = data.remainingPaid || 0

        // Prevent overpayment
        if (advance + remaining > total) {
          throw new Error(BUSINESS_ERROR_MESSAGES.ORDER_OVERPAYMENT)
        }

        // Prevent delivering unpaid orders
        if (data.status === 'delivered') {
          const due = Math.max(0, total - advance - remaining)
          if (due > 0) {
            throw new Error(BUSINESS_ERROR_MESSAGES.ORDER_DELIVERED_UNPAID)
          }
        }

        // Auto-update payment status
        const totalPaid = advance + remaining
        if (totalPaid === 0) {
          data.paymentStatus = 'unpaid'
        } else if (totalPaid >= total) {
          data.paymentStatus = 'paid'
        } else {
          data.paymentStatus = 'partial'
        }

        return data
      },
    ],
  },

  timestamps: true,
}
