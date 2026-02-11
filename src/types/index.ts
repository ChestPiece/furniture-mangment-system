// ============================================
// Furniture Management System - Shared Types
// ============================================

import type {
  Field,
  FieldAccess,
  PayloadRequest,
  Where,
  User,
  CollectionBeforeChangeHook,
} from 'payload'

// Re-export all constants as types
export type * from '@/constants'

// ============================================
// Access Control Types
// ============================================

/**
 * Extended user type with tenant information
 */
export interface TenantUser extends User {
  tenant?: string | { id: string }
  roles?: string[]
}

/**
 * Context object for access control functions
 */
export interface AccessContext {
  req: PayloadRequest
  id?: string | number
}

/**
 * Role checker function type
 */
export type RoleChecker = (user: TenantUser | null) => boolean

/**
 * Access filter result type
 */
export type AccessFilter = boolean | Where

// ============================================
// Field Factory Types
// ============================================

/**
 * Options for creating a tenant relationship field
 */
export interface TenantFieldOptions {
  /** Whether the field is required (default: true) */
  required?: boolean
  /** Whether to hide in admin UI (default: true) */
  hidden?: boolean
  /** Custom access configuration */
  access?: FieldAccess
}

/**
 * Options for creating a status field
 */
export interface StatusFieldOptions {
  /** Available status options */
  options: Array<{ label: string; value: string }>
  /** Default status value */
  defaultValue: string
  /** Whether the field is required (default: true) */
  required?: boolean
  /** Whether to index the field (default: true) */
  index?: boolean
}

/**
 * Options for creating a relationship field with tenant filtering
 */
export interface TenantRelationshipOptions {
  /** Target collection slug */
  relationTo: string
  /** Whether the field is required */
  required?: boolean
  /** Whether to index the field */
  index?: boolean
  /** Additional filter options beyond tenant */
  filterOptions?: Record<string, unknown>
}

// ============================================
// Collection Factory Types
// ============================================

/**
 * Options for creating a tenant-isolated collection
 */
export interface TenantCollectionOptions {
  /** Collection slug */
  slug: string
  /** Collection fields (tenant field auto-added) */
  fields: Field[]
  /** Admin configuration */
  admin?: {
    useAsTitle?: string
    defaultColumns?: string[]
    description?: string
  }
  /** Custom hooks (tenant hooks auto-added) */
  hooks?: {
    beforeChange?: CollectionBeforeChangeHook[]
    afterChange?: unknown[]
    beforeRead?: unknown[]
    afterRead?: unknown[]
    beforeDelete?: unknown[]
    afterDelete?: unknown[]
  }
  /** Enable timestamps */
  timestamps?: boolean
}

// ============================================
// Hook Types
// ============================================

/**
 * Tenant extraction function type
 */
export type TenantExtractor = (
  tenant: string | { id: string } | undefined | null,
) => string | undefined

/**
 * BeforeChange hook with tenant support
 */
export type TenantBeforeChangeHook = CollectionBeforeChangeHook

// ============================================
// API Response Types
// ============================================

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: unknown
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

/**
 * Paginated data structure
 */
export interface PaginatedData<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

// ============================================
// Business Logic Types
// ============================================

/**
 * Order calculation result
 */
export interface OrderCalculation {
  totalAmount: number
  advancePaid: number
  remainingPaid: number
  dueAmount: number
  paymentStatus: 'unpaid' | 'partial' | 'paid'
}

/**
 * Stock update payload
 */
export interface StockUpdatePayload {
  productId: string
  warehouseId?: string
  quantity: number
  type: 'in' | 'out'
  reference?: string
  notes?: string
}

/**
 * Dashboard stats
 */
export interface DashboardStats {
  todaySales: number
  activeOrders: number
  pendingPayments: number
  lowStockItems: number
}

// ============================================
// Utility Types
// ============================================

/**
 * Nullable type helper
 */
export type Nullable<T> = T | null | undefined

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Function that returns a promise
 */
export type AsyncFunction<T = void> = () => Promise<T>

/**
 * Type guard function
 */
export type TypeGuard<T> = (value: unknown) => value is T
