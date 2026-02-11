import { NextResponse } from 'next/server'

type ApiResponseOptions<T = null> = {
  status?: number
  message?: string
  data?: T | null
  error?: unknown
}

/**
 * Standardized API response structure.
 * Wraps data in a consistent JSON format with success flag and timestamp.
 */
export function apiResponse<T = null>({
  status = 200,
  message = 'Success',
  data = null,
  error = null,
}: ApiResponseOptions<T>) {
  return NextResponse.json(
    {
      success: status >= 200 && status < 300,
      message,
      data,
      error,
      timestamp: new Date().toISOString(),
    },
    { status },
  )
}

/**
 * Helper for returning error responses.
 * @param message - Error message
 * @param status - HTTP status code (default 400)
 * @param error - Optional error details
 */
export function errorResponse(message: string, status = 400, error: unknown = null) {
  return apiResponse({
    status,
    message,
    data: null,
    error,
  })
}

/**
 * Helper for returning success responses.
 * @param data - The data payload
 * @param message - Success message (default 'Success')
 * @param status - HTTP status code (default 200)
 */
export function successResponse<T>(data: T, message = 'Success', status = 200) {
  return apiResponse<T>({
    status,
    message,
    data,
    error: null,
  })
}
