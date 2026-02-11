// ============================================
// Error Handler Utilities
// ============================================

import { APIError } from 'payload'
import { AppError, ERROR_CODES, createNotFoundError, type ErrorResponse } from './types'
import { HTTP_STATUS } from '@/constants'
import type { HttpStatusCode } from '@/constants'

/**
 * Safely extracts error message from unknown error
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

/**
 * Converts any error to an AppError
 */
export const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof APIError) {
    return new AppError(
      error.message,
      ERROR_CODES.INTERNAL_ERROR,
      error.status as HttpStatusCode,
      error.data,
    )
  }

  const message = getErrorMessage(error)
  return new AppError(message)
}

/**
 * Global error handler for API routes
 */
export const handleApiError = (error: unknown): Response => {
  const appError = toAppError(error)

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', appError)
  }

  return Response.json(appError.toJSON(), { status: appError.statusCode })
}

/**
 * Async handler wrapper for API routes
 * Automatically catches and handles errors
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withErrorHandler = <T extends (...args: any[]) => Promise<Response>>(
  handler: T,
): T => {
  return (async (...args: Parameters<T>): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }) as T
}

/**
 * Safe execution wrapper for async operations
 * Returns [data, error] tuple similar to Go error handling
 */
export const safeExecute = async <T>(
  operation: () => Promise<T>,
): Promise<[T | null, AppError | null]> => {
  try {
    const result = await operation()
    return [result, null]
  } catch (error) {
    return [null, toAppError(error)]
  }
}

/**
 * Require a value or throw not found error
 */
export const requireValue = <T>(value: T | null | undefined, resourceName: string): T => {
  if (value === null || value === undefined) {
    throw createNotFoundError(resourceName)
  }
  return value
}

/**
 * Assert a condition or throw error
 */
export const assert = (
  condition: boolean,
  message: string,
  code = ERROR_CODES.BUSINESS_RULE_VIOLATION,
): asserts condition => {
  if (!condition) {
    throw new AppError(message, code)
  }
}
