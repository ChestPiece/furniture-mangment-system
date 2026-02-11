// ============================================
// Pre-configured Access Control Presets
// Ready-to-use access configurations for common scenarios
// ============================================

import type { Access } from 'payload'
import {
  createTenantReadAccess,
  createTenantUpdateAccess,
  createRoleBasedCreateAccess,
  createDeleteAccess,
  createSelfOrAdminFilter,
} from '@/access/factories'
import { USER_ROLES } from '@/constants'

const { ADMIN, OWNER, STAFF } = USER_ROLES

// ============================================
// Tenant-Isolated Collection Presets
// ============================================

/**
 * Standard tenant-isolated collection access
 * - Read: Tenant-scoped
 * - Create: Admin or Owner
 * - Update: Tenant-scoped
 * - Delete: Admin or Owner (tenant-scoped)
 */
export const tenantIsolatedAccess: Record<string, Access> = {
  read: createTenantReadAccess(),
  create: createRoleBasedCreateAccess([ADMIN, OWNER]),
  update: createTenantUpdateAccess(),
  delete: createDeleteAccess({
    allowedRoles: [ADMIN, OWNER],
    tenantScoped: true,
  }),
}

/**
 * Relaxed tenant-isolated collection access
 * - Staff can also create and update
 */
export const tenantIsolatedRelaxedAccess: Record<string, Access> = {
  read: createTenantReadAccess(),
  create: createRoleBasedCreateAccess([ADMIN, OWNER, STAFF]),
  update: createTenantUpdateAccess(),
  delete: createDeleteAccess({
    allowedRoles: [ADMIN, OWNER],
    tenantScoped: true,
  }),
}

/**
 * Read-only tenant-isolated access
 * Only admins and owners can modify
 */
export const tenantIsolatedReadOnlyAccess: Record<string, Access> = {
  read: createTenantReadAccess(),
  create: createRoleBasedCreateAccess([ADMIN, OWNER]),
  update: createRoleBasedCreateAccess([ADMIN, OWNER]),
  delete: createDeleteAccess({
    allowedRoles: [ADMIN],
    tenantScoped: true,
  }),
}

// ============================================
// User Collection Specific Presets
// ============================================

/**
 * User collection access configuration
 * Special handling for user management
 */
export const userCollectionAccess = {
  read: ({ req: { user } }) => {
    if (!user) return false
    if (user.roles?.includes(ADMIN)) return true
    if (user.roles?.includes(OWNER)) {
      return {
        tenant: {
          equals: typeof user.tenant === 'object' ? user.tenant?.id : user.tenant,
        },
      }
    }
    return {
      id: {
        equals: user.id,
      },
    }
  },

  create: createRoleBasedCreateAccess([ADMIN, OWNER]),

  update: ({ req: { user } }) => {
    if (!user) return false
    if (user.roles?.includes(ADMIN)) return true
    if (user.roles?.includes(OWNER)) {
      return {
        tenant: {
          equals: typeof user.tenant === 'object' ? user.tenant?.id : user.tenant,
        },
      }
    }
    return {
      id: {
        equals: user.id,
      },
    }
  },

  delete: createDeleteAccess({
    allowedRoles: [ADMIN, OWNER],
    protectedEmail: process.env.GOD_ADMIN_EMAIL,
    tenantScoped: true,
  }),
} as Record<string, Access>

// ============================================
// Admin-Only Presets
// ============================================

/**
 * Admin-only access for sensitive collections
 * (e.g., Tenants, Configurations)
 */
export const adminOnlyAccess: Record<string, Access> = {
  read: ({ req: { user } }) => user?.roles?.includes(ADMIN) ?? false,
  create: ({ req: { user } }) => user?.roles?.includes(ADMIN) ?? false,
  update: ({ req: { user } }) => user?.roles?.includes(ADMIN) ?? false,
  delete: ({ req: { user } }) => user?.roles?.includes(ADMIN) ?? false,
}

/**
 * Admin or self access
 * For resources where users can manage their own data
 */
export const adminOrSelfAccess: Record<string, Access> = {
  read: ({ req: { user } }) => {
    if (!user) return false
    if (user.roles?.includes(ADMIN)) return true
    return {
      id: {
        equals: user.id,
      },
    }
  },

  create: ({ req: { user } }) => user?.roles?.includes(ADMIN) ?? false,

  update: ({ req: { user } }) => {
    if (!user) return false
    if (user.roles?.includes(ADMIN)) return true
    return {
      id: {
        equals: user.id,
      },
    }
  },

  delete: ({ req: { user } }) => user?.roles?.includes(ADMIN) ?? false,
}

// ============================================
// Public/Authenticated Presets
// ============================================

/**
 * Authenticated users only
 */
export const authenticatedOnlyAccess: Record<string, Access> = {
  read: ({ req: { user } }) => Boolean(user),
  create: ({ req: { user } }) => Boolean(user),
  update: ({ req: { user } }) => Boolean(user),
  delete: ({ req: { user } }) => Boolean(user),
}

/**
 * Public read, authenticated write
 */
export const publicReadAuthenticatedWrite: Record<string, Access> = {
  read: () => true,
  create: ({ req: { user } }) => Boolean(user),
  update: ({ req: { user } }) => Boolean(user),
  delete: ({ req: { user } }) => Boolean(user),
}
