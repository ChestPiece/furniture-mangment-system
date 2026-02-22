// ============================================
// Furniture Management System - Shared Types
// ============================================

// Re-export all constants as types
export type * from '@/constants'

// ============================================
// Access Control Types
// ============================================

export interface User {
  id: string
  email: string
  roles?: string[]
  tenant?: string | { id: string }
}

/**
 * Extended user type with tenant information
 */
export interface TenantUser extends User {
  tenant?: string | { id: string }
  roles?: string[]
}

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
