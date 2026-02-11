// ============================================
// Tenant Hooks
// Reusable hooks for tenant auto-assignment
// ============================================

import type { CollectionBeforeChangeHook } from 'payload'
import { extractTenantId } from './utils'
import { USER_ROLES } from '@/constants'
import { BUSINESS_ERROR_MESSAGES } from '@/constants/messages'

/**
 * Hook factory: Auto-assign tenant to document on create
 * Assigns the current user's tenant to new documents
 */
export const createAutoAssignTenantHook = (): CollectionBeforeChangeHook => {
  return async ({ data, req, operation }) => {
    if (operation === 'create') {
      const user = req.user

      // Auto-assign tenant for non-admins creating documents
      if (user && user.tenant && !user.roles?.includes(USER_ROLES.ADMIN)) {
        data.tenant = extractTenantId(user.tenant)
      }
    }
    return data
  }
}

/**
 * Hook factory: Validate tenant requirement on create
 * Ensures non-admin users have a tenant assigned
 */
export const createTenantValidationHook = (): CollectionBeforeChangeHook => {
  return async ({ data, req, operation }) => {
    if (operation === 'create') {
      const user = req.user

      // Skip validation for admin users
      if (user?.roles?.includes(USER_ROLES.ADMIN)) {
        return data
      }

      // Check if document has tenant assigned
      if (!data.tenant) {
        throw new Error(BUSINESS_ERROR_MESSAGES.TENANT_REQUIRED)
      }
    }
    return data
  }
}

/**
 * Combined tenant hook: Auto-assign + Validate
 * Most collections should use this
 */
export const createTenantManagementHook = (): CollectionBeforeChangeHook => {
  return async (args) => {
    const { data, req, operation } = args

    if (operation === 'create') {
      const user = req.user

      // Auto-assign tenant for non-admins
      if (user && user.tenant && !user.roles?.includes(USER_ROLES.ADMIN)) {
        data.tenant = extractTenantId(user.tenant)
      }

      // Validate tenant is present for non-admins
      if (!user?.roles?.includes(USER_ROLES.ADMIN) && !data.tenant) {
        throw new Error(BUSINESS_ERROR_MESSAGES.TENANT_REQUIRED)
      }
    }

    return data
  }
}

/**
 * Hook for user collection: Auto-assign + Role validation
 */
export const createUserTenantHook = (): CollectionBeforeChangeHook => {
  return async ({ data, req, operation }) => {
    if (operation === 'create') {
      const user = req.user

      // Auto-assign tenant for non-admins creating users
      if (user && !user.roles?.includes(USER_ROLES.ADMIN) && user.tenant) {
        data.tenant = extractTenantId(user.tenant)
      }

      // Validate: non-admins MUST have a tenant
      const isNewUserAdmin = data.roles?.includes(USER_ROLES.ADMIN)
      if (!isNewUserAdmin && !data.tenant) {
        throw new Error(BUSINESS_ERROR_MESSAGES.TENANT_REQUIRED)
      }
    }

    return data
  }
}
