// ============================================
// Access Control Factories
// DRY patterns for collection access control
// ============================================

import type { Access, PayloadRequest, Where } from 'payload'
import type { TenantUser, AccessContext, AccessFilter, RoleChecker } from '@/types'
import { extractTenantId } from '@/lib/tenant/utils'
import { USER_ROLES } from '@/constants'

// ============================================
// Role Checkers
// ============================================

/**
 * Check if user has admin role
 */
export const isAdmin: RoleChecker = (user) => user?.roles?.includes(USER_ROLES.ADMIN) ?? false

/**
 * Check if user has owner role
 */
export const isOwner: RoleChecker = (user) => user?.roles?.includes(USER_ROLES.OWNER) ?? false

/**
 * Check if user has staff role
 */
export const isStaff: RoleChecker = (user) => user?.roles?.includes(USER_ROLES.STAFF) ?? false

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (roles: string[]): RoleChecker => {
  return (user) => user?.roles?.some((role) => roles.includes(role)) ?? false
}

/**
 * Check if user has all of the specified roles
 */
export const hasAllRoles = (roles: string[]): RoleChecker => {
  return (user) => roles.every((role) => user?.roles?.includes(role))
}

// ============================================
// Tenant Filter Factories
// ============================================

/**
 * Create a tenant filter for the current user
 * Returns a query constraint or true for admins
 */
export const createTenantFilter = (req: PayloadRequest): AccessFilter => {
  const user = req.user as TenantUser | null

  if (isAdmin(user)) return true

  const tenantId = extractTenantId(user?.tenant)
  if (tenantId) {
    return {
      tenant: {
        equals: tenantId,
      },
    } as Where
  }

  // Return impossible condition to prevent access
  return {
    tenant: {
      exists: false,
    },
  } as Where
}

/**
 * Reusable filter for Payload queries to enforce tenant isolation.
 * @param {Object} context - The context object containing the request
 * @returns {Object|boolean} - Returns a query filter object or boolean true/false
 */
export const tenantFilter: Access = ({ req }: { req: PayloadRequest }) => {
  return createTenantFilter(req)
}

/**
 * Create a filter for documents owned by the user's tenant
 * For use in collection access.read
 */
export const createTenantOwnedFilter = ({
  req,
}: {
  req: PayloadRequest
}): AccessFilter => {
  return createTenantFilter(req)
}

/**
 * Create a filter that allows admin full access
 * and users to access only their own document by ID
 */
export const createSelfOrAdminFilter = (
  { req: { user } }: AccessContext,
  documentId?: string | number,
): AccessFilter => {
  if (isAdmin(user as TenantUser)) return true

  if (documentId) {
    return {
      id: {
        equals: documentId,
      },
    } as Where
  }

  return false
}

// ============================================
// Access Function Factories
// ============================================

/**
 * Factory: Create read access with tenant isolation
 * Admins can read all, others only their tenant
 */
export const createTenantReadAccess = (): Access => {
  return ({ req }) => createTenantFilter(req)
}

/**
 * Factory: Create read access with role-based permissions
 * @param allowedRoles - Roles that can read
 */
export const createRoleBasedReadAccess = (allowedRoles: string[]): Access => {
  return ({ req: { user } }) => {
    if (!user) return false
    if (isAdmin(user as TenantUser)) return true
    return user.roles?.some((role) => allowedRoles.includes(role)) ?? false
  }
}

/**
 * Factory: Create create access with role check
 * @param allowedRoles - Roles that can create
 */
export const createRoleBasedCreateAccess = (allowedRoles: string[]): Access => {
  return ({ req: { user } }) => {
    if (!user) return false
    if (isAdmin(user as TenantUser)) return true
    return user.roles?.some((role) => allowedRoles.includes(role)) ?? false
  }
}

/**
 * Factory: Create update access with tenant isolation
 * Admins can update all, owners can update their tenant, users can update self
 */
export const createTenantUpdateAccess = (): Access => {
  return ({ req: { user } }) => {
    if (!user) return false
    if (isAdmin(user as TenantUser)) return true

    const tenantId = extractTenantId((user as TenantUser).tenant)
    if (tenantId) {
      return {
        tenant: {
          equals: tenantId,
        },
      } as Where
    }

    return {
      id: {
        equals: user.id,
      },
    } as Where
  }
}

/**
 * Factory: Create delete access with role and tenant checks
 * @param options - Configuration options
 */
export const createDeleteAccess = (options: {
  /** Roles that can delete */
  allowedRoles: string[]
  /** Whether to restrict admin deletion (e.g., prevent deleting god admin) */
  protectedEmail?: string
  /** Whether tenant isolation applies */
  tenantScoped?: boolean
}): Access => {
  const { allowedRoles, protectedEmail, tenantScoped = true } = options

  return ({ req: { user } }) => {
    if (!user) return false

    // Check role permission
    const hasRole = user.roles?.some((role) => allowedRoles.includes(role))
    if (!hasRole && !isAdmin(user as TenantUser)) return false

    // Build filter conditions
    const conditions: Where[] = []

    // Tenant scope
    if (tenantScoped && !isAdmin(user as TenantUser)) {
      const tenantId = extractTenantId((user as TenantUser).tenant)
      if (tenantId) {
        conditions.push({
          tenant: {
            equals: tenantId,
          },
        } as Where)
      }
    }

    // Protected email exclusion
    if (protectedEmail && isAdmin(user as TenantUser)) {
      conditions.push({
        email: {
          not_equals: protectedEmail,
        },
      } as Where)
    }

    if (conditions.length === 0) return true
    if (conditions.length === 1) return conditions[0]

    return {
      and: conditions,
    } as Where
  }
}

// ============================================
// Field Access Factories
// ============================================

/**
 * Factory: Create field read access
 * @param allowedRoles - Roles that can read the field
 */
export const createFieldReadAccess = (allowedRoles: string[]) => {
  return ({ req: { user } }: AccessContext) => {
    if (!user) return false
    if (isAdmin(user as TenantUser)) return true
    return user.roles?.some((role) => allowedRoles.includes(role)) ?? false
  }
}

/**
 * Factory: Create field update access (admin only by default)
 * @param options - Configuration options
 */
export const createFieldUpdateAccess = (options?: {
  /** Additional roles that can update */
  allowedRoles?: string[]
  /** Whether user can update their own field */
  selfEditable?: boolean
}) => {
  const { allowedRoles = [], selfEditable = false } = options ?? {}

  return ({ req: { user }, doc }: AccessContext & { doc?: Record<string, unknown> }) => {
    if (!user) return false
    if (isAdmin(user as TenantUser)) return true

    if (user.roles?.some((role) => allowedRoles.includes(role))) {
      return true
    }

    if (selfEditable && doc?.id === user.id) {
      return true
    }

    return false
  }
}
