// ============================================
// Tenant Utilities
// Shared functions for tenant-related operations
// ============================================

import type { TenantUser } from '@/types'

/**
 * Safely extracts the tenant ID from a user's tenant field.
 * Handles cases where the tenant field might be a string ID or a populated object.
 *
 * @param tenant - The tenant field from a User object (string | { id: string } | undefined | null)
 * @returns The tenant ID string or undefined if not present
 */
export const extractTenantId = (
  tenant: string | { id: string } | undefined | null,
): string | undefined => {
  if (!tenant) return undefined
  return typeof tenant === 'object' ? tenant.id : tenant
}

/**
 * Check if a user belongs to a specific tenant
 */
export const belongsToTenant = (
  user: TenantUser | null,
  tenantId: string | undefined,
): boolean => {
  if (!user || !tenantId) return false
  const userTenantId = extractTenantId(user.tenant)
  return userTenantId === tenantId
}

/**
 * Get tenant ID from user or throw error
 * Useful when tenant is required
 */
export const requireTenantId = (user: TenantUser | null): string => {
  const tenantId = extractTenantId(user?.tenant)
  if (!tenantId) {
    throw new Error('Tenant is required for this operation')
  }
  return tenantId
}

/**
 * Create a tenant query filter for Payload
 */
export const createTenantQuery = (
  tenantId: string | undefined,
): Record<string, unknown> | null => {
  if (!tenantId) return null
  return {
    tenant: {
      equals: tenantId,
    },
  }
}
