import { Access } from 'payload'

/**
 * Access control ensuring only admins or the specific tenant owner can access.
 * Used for Collections like Tenants.
 */
export const tenantAdmins: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true

  // Allow owners to manage their own tenant settings
  if (user?.roles?.includes('owner')) {
    const tenantId = typeof user.tenant === 'object' ? (user.tenant as any).id : user.tenant
    return {
      tenant: {
        equals: tenantId,
      },
    }
  }

  return false
}

/**
 * Access control ensuring users can only access documents belonging to their tenant.
 * Admins have full access.
 */
export const tenantUsers: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true

  if (user?.tenant) {
    const tenantId = typeof user.tenant === 'object' ? (user.tenant as any).id : user.tenant
    return {
      tenant: {
        equals: tenantId,
      },
    }
  }

  return false
}

import { PayloadRequest } from 'payload'

/**
 * Reusable filter for Payload queries to enforce tenant isolation.
 * @param {Object} context - The context object containing the request
 * @returns {Object|boolean} - Returns a query filter object or boolean true/false
 */
export const tenantFilter = ({ req: { user } }: { req: PayloadRequest }) => {
  if (user?.roles?.includes('admin')) return true

  if (user?.tenant) {
    const tenantId = typeof user.tenant === 'object' ? (user.tenant as any).id : user.tenant
    return {
      tenant: {
        equals: tenantId,
      },
    }
  }

  return {
    tenant: {
      exists: false, // Or some impossible condition to prevent access
    },
  }
}

/**
 * Access control specifically for the Tenants collection itself.
 * Filters by the ID of the tenant the user belongs to.
 */
export const tenantSelfAccess: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true

  if (user?.roles?.includes('owner')) {
    const tenantId = typeof user.tenant === 'object' ? (user.tenant as any).id : user.tenant
    return {
      id: {
        equals: tenantId,
      },
    }
  }

  return false
}
