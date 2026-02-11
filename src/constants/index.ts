// ============================================
// Furniture Management System - Constants
// ============================================

// ============================================
// Consolidated Enums
// ============================================

/**
 * User Roles - Single source of truth for role management
 * @readonly
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  STAFF: 'staff',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

/**
 * Order Status Values
 * @readonly
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

/**
 * Order Types
 * @readonly
 */
export const ORDER_TYPE = {
  READY_MADE: 'ready-made',
  CUSTOM: 'custom',
} as const

export type OrderType = (typeof ORDER_TYPE)[keyof typeof ORDER_TYPE]

/**
 * Payment Status Values
 * @readonly
 */
export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
} as const

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

/**
 * Product Types
 * @readonly
 */
export const PRODUCT_TYPE = {
  FINISHED_GOOD: 'finished_good',
  RAW_MATERIAL: 'raw_material',
  SERVICE: 'service',
} as const

export type ProductType = (typeof PRODUCT_TYPE)[keyof typeof PRODUCT_TYPE]

/**
 * Production Run Status
 * @readonly
 */
export const PRODUCTION_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  QUALITY_CHECK: 'quality_check',
  COMPLETED: 'completed',
} as const

export type ProductionStatus = (typeof PRODUCTION_STATUS)[keyof typeof PRODUCTION_STATUS]

/**
 * Production Item Status (per order item)
 * @readonly
 */
export const PRODUCTION_ITEM_STATUS = {
  PENDING: 'pending',
  IN_PRODUCTION: 'in_production',
  READY: 'ready',
  DELIVERED: 'delivered',
} as const

export type ProductionItemStatus = (typeof PRODUCTION_ITEM_STATUS)[keyof typeof PRODUCTION_ITEM_STATUS]

/**
 * Job Card Status
 * @readonly
 */
export const JOB_CARD_STATUS = {
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const

export type JobCardStatus = (typeof JOB_CARD_STATUS)[keyof typeof JOB_CARD_STATUS]

/**
 * Delivery Status
 * @readonly
 */
export const DELIVERY_STATUS = {
  PENDING: 'pending',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  FAILED: 'failed',
} as const

export type DeliveryStatus = (typeof DELIVERY_STATUS)[keyof typeof DELIVERY_STATUS]

/**
 * Purchase Order Status
 * @readonly
 */
export const PURCHASE_ORDER_STATUS = {
  DRAFT: 'draft',
  ORDERED: 'ordered',
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
} as const

export type PurchaseOrderStatus = (typeof PURCHASE_ORDER_STATUS)[keyof typeof PURCHASE_ORDER_STATUS]

/**
 * Stock Transaction Types
 * @readonly
 */
export const STOCK_TRANSACTION_TYPE = {
  PURCHASE_RECEIVE: 'purchase_receive',
  ORDER_DEDUCTION: 'order_deduction',
  MANUAL_ADJUSTMENT: 'manual_adjustment',
  RETURN: 'return',
  WASTE: 'waste',
} as const

export type StockTransactionType = (typeof STOCK_TRANSACTION_TYPE)[keyof typeof STOCK_TRANSACTION_TYPE]

/**
 * Payment Methods
 * @readonly
 */
export const PAYMENT_METHOD = {
  CASH: 'cash',
  JAZZCASH: 'jazzcash',
  EASYPAISA: 'easypaisa',
  BANK_TRANSFER: 'bank_transfer',
} as const

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]

/**
 * Payment Status for Payments Collection
 * @readonly
 */
export const PAYMENT_RECORD_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export type PaymentRecordStatus = (typeof PAYMENT_RECORD_STATUS)[keyof typeof PAYMENT_RECORD_STATUS]

// ============================================
// Collections Slugs - For type-safe references
// ============================================

/**
 * Collection Slugs - Use these instead of string literals
 * @readonly
 */
export const COLLECTION_SLUGS = {
  USERS: 'users',
  MEDIA: 'media',
  TENANTS: 'tenants',
  CONFIGURATIONS: 'configurations',
  CUSTOMERS: 'customers',
  ORDERS: 'orders',
  EXPENSES: 'expenses',
  PRODUCTS: 'products',
  WAREHOUSES: 'warehouses',
  SUPPLIERS: 'suppliers',
  STOCK_TRANSACTIONS: 'stock-transactions',
  PRODUCTION_RUNS: 'production-runs',
  JOB_CARDS: 'job-cards',
  DELIVERIES: 'deliveries',
  PURCHASE_ORDERS: 'purchase-orders',
  PAYMENTS: 'payments',
} as const

export type CollectionSlug = (typeof COLLECTION_SLUGS)[keyof typeof COLLECTION_SLUGS]

// ============================================
// Default Values
// ============================================

/**
 * Default pagination values
 * @readonly
 */
export const PAGINATION_DEFAULTS = {
  LIMIT: 10,
  MAX_LIMIT: 100,
  PAGE: 1,
} as const

/**
 * Date formats used across the application
 * @readonly
 */
export const DATE_FORMATS = {
  DISPLAY: 'PPP', // Day Month Year (e.g., "April 1st, 2024")
  DISPLAY_SHORT: 'PP', // Month Day, Year
  ISO: 'yyyy-MM-dd',
  DATETIME: 'PPp', // Date with time
  TIME: 'p', // Time only
} as const

/**
 * Currency configuration
 * @readonly
 */
export const CURRENCY = {
  CODE: 'PKR',
  SYMBOL: 'Rs.',
  LOCALE: 'en-PK',
} as const

// ============================================
// HTTP Status Codes
// ============================================

/**
 * HTTP Status Codes - Use these instead of magic numbers
 * @readonly
 */
export const HTTP_STATUS = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // 3xx Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS]

// ============================================
// Error and Success Messages
// ============================================

/**
 * Validation Error Messages
 * @readonly
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: (field: string) => `${field} is required`,
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters`,
  MAX_LENGTH: (field: string, max: number) => `${field} must be at most ${max} characters`,
  MIN_VALUE: (field: string, min: number) => `${field} must be at least ${min}`,
  MAX_VALUE: (field: string, max: number) => `${field} must be at most ${max}`,
  POSITIVE_NUMBER: (field: string) => `${field} must be a positive number`,
  INVALID_DATE: 'Please enter a valid date',
} as const

/**
 * Business Logic Error Messages
 * @readonly
 */
export const BUSINESS_ERROR_MESSAGES = {
  // Order-related
  ORDER_OVERPAYMENT: 'Total paid cannot exceed order amount',
  ORDER_DELIVERED_UNPAID: 'Cannot mark as delivered while there is a due amount',
  ORDER_INVALID_STATUS_TRANSITION: 'Invalid status transition for this order',

  // Payment-related
  PAYMENT_EXCEEDS_DUE: 'Payment amount cannot exceed due amount',
  PAYMENT_INVALID_METHOD: 'Invalid payment method selected',

  // Stock-related
  STOCK_INSUFFICIENT: 'Insufficient stock for this operation',
  STOCK_NEGATIVE: 'Stock quantity cannot be negative',

  // Tenant-related
  TENANT_REQUIRED: 'Tenant is required for non-admin users',
  TENANT_ISOLATION_VIOLATION: 'You do not have access to this resource',

  // User-related
  USER_UNAUTHORIZED: 'You are not authorized to perform this action',
  USER_INVALID_CREDENTIALS: 'Invalid email or password',
  USER_ACCOUNT_LOCKED: 'Your account has been locked',

  // Production-related
  PRODUCTION_INVALID_STAGE: 'Invalid production stage',
  PRODUCTION_ALREADY_COMPLETED: 'This production run is already completed',

  // General
  RESOURCE_NOT_FOUND: (resource: string) => `${resource} not found`,
  RESOURCE_ALREADY_EXISTS: (resource: string) => `${resource} already exists`,
  OPERATION_FAILED: 'Operation failed. Please try again.',
} as const

/**
 * Success Messages
 * @readonly
 */
export const SUCCESS_MESSAGES = {
  CREATED: (resource: string) => `${resource} created successfully`,
  UPDATED: (resource: string) => `${resource} updated successfully`,
  DELETED: (resource: string) => `${resource} deleted successfully`,
  SAVED: 'Changes saved successfully',
  LOGGED_IN: 'Logged in successfully',
  LOGGED_OUT: 'Logged out successfully',
} as const
