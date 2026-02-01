import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/utilities/apiResponse'

export async function GET(req: NextRequest) {
  try {
    // Example logic
    const data = { message: 'This is a standardized API response' }
    return successResponse(data)
  } catch (error) {
    return errorResponse('Failed to fetch data', 500, error)
  }
}
