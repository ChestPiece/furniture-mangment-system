// ============================================
// Tenant Isolation Access Control
// ============================================
// Note: This file is kept for backward compatibility.
// New code should import from '@/access' directly.

import type { Access } from 'payload'
import { extractTenantId } from '@/lib/tenant'

// Re-export from new structure for compatibility
export { extractTenantId } from '@/lib/tenant'
export { tenantFilter } from '@/access/factories'

/**
 * Access control ensuring only admins or the specific tenant owner can access.
 * Used for Collections like Tenants.
 * @deprecated Use tenantAdmins from '@/access/presets' instead
 */
export const tenantAdmins: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true

  if (user?.roles?.includes('owner')) {
    const tenantId = extractTenantId(user.tenant)
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
 * @deprecated Use tenantUsers from '@/access/presets' instead
 */
export const tenantUsers: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true

  if (user?.tenant) {
    const tenantId = extractTenantId(user.tenant)
    return {
      tenant: {
        equals: tenantId,
      },
    }
  }

  return false
}

/**
 * Access control specifically for the Tenants collection itself.
 * Filters by the ID of the tenant the user belongs to.
 * @deprecated Use tenantSelfAccess from '@/access/presets' instead
 */
export const tenantSelfAccess: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true

  if (user?.roles?.includes('owner')) {
    const tenantId = extractTenantId(user.tenant)
    return {
      id: {
        equals: tenantId,
      },
    }
  }

  return false
}
