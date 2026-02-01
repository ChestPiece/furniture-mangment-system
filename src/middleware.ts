import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiter (Note: In serverless/multiple instances, this won't be shared)
// For a production app, use Redis or a similar external store.
const rateLimit = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // 100 requests per minute

export function middleware(request: NextRequest) {
  // 1. Request Logging
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname}`)

  // 2. Rate Limiting (Skip for non-API routes or static assets to keep it light)
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip || '127.0.0.1'
    const now = Date.now()
    const record = rateLimit.get(ip) || { count: 0, lastReset: now }

    if (now - record.lastReset > RATE_LIMIT_WINDOW) {
      record.count = 0
      record.lastReset = now
    }

    record.count++
    rateLimit.set(ip, record)

    if (record.count > MAX_REQUESTS) {
      return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
