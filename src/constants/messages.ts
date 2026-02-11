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
