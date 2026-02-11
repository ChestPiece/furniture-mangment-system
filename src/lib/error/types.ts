// ============================================
// Error Types and Classes
// ============================================

import { HTTP_STATUS } from '@/constants'
import type { HttpStatusCode } from '@/constants'

/**
 * Application error codes
 */
export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',

  // Business logic errors
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  PAYMENT_ERROR: 'PAYMENT_ERROR',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

/**
 * Standardized error response structure
 */
export interface ErrorResponse {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: unknown
    field?: string
  }
}

/**
 * Application-specific error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: HttpStatusCode
  public readonly details?: unknown
  public readonly field?: string

  constructor(
    message: string,
    code: ErrorCode = ERROR_CODES.INTERNAL_ERROR,
    statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details?: unknown,
    field?: string,
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.field = field

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON(): ErrorResponse {
    const result: ErrorResponse = {
      success: false,
      error: {
        code: this.code,
        message: this.message,
      },
    }
    
    if (this.details) {
      result.error.details = this.details
    }
    
    if (this.field) {
      result.error.field = this.field
    }
    
    return result
  }
}

/**
 * Common error factory functions
 */
export const createValidationError = (message: string, field?: string, details?: unknown) => {
  return new AppError(
    message,
    ERROR_CODES.VALIDATION_ERROR,
    HTTP_STATUS.BAD_REQUEST,
    details,
    field,
  )
}

export const createNotFoundError = (resource: string) => {
  return new AppError(
    `${resource} not found`,
    ERROR_CODES.NOT_FOUND,
    HTTP_STATUS.NOT_FOUND,
  )
}

export const createUnauthorizedError = (message: string = 'Unauthorized') => {
  return new AppError(message, ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
}

export const createForbiddenError = (message: string = 'Forbidden') => {
  return new AppError(message, ERROR_CODES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
}

export const createConflictError = (message: string) => {
  return new AppError(message, ERROR_CODES.CONFLICT, HTTP_STATUS.CONFLICT)
}
