import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Simple in-memory rate limiter (To be replaced with Redis in production)
const rateLimit = new Map<string, { count: number; lastReset: number }>()

// Configuration
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000') // 1 minute
const MAX_REQUESTS = parseInt(process.env.MAX_REQUESTS_PER_WINDOW || '100') // 100 requests per minute
const CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 hour

// Periodic cleanup to prevent memory leaks
let lastCleanup = Date.now()
const cleanupRateLimit = () => {
  const now = Date.now()
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [key, record] of rateLimit.entries()) {
      if (now - record.lastReset > RATE_LIMIT_WINDOW) {
        rateLimit.delete(key)
      }
    }
    lastCleanup = now
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Request Logging (Development Only)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${request.method} ${pathname}`)
  }

  // 2. Rate Limiting (Skip for non-API routes)
  if (pathname.startsWith('/api')) {
    cleanupRateLimit()
    // Use a more robust key - fallback to 'unknown' if header missing
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown-ip'
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

  // 3. Auth & Role-Based Access Control
  const token = request.cookies.get('payload-token')?.value

  // Helper to get user role from token (secure verification)
  const getUserRole = async (token: string) => {
    const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET
    if (!PAYLOAD_SECRET) {
      // Critical error: App misconfigured
      console.error('CRITICAL: PAYLOAD_SECRET is not defined.')
      return null
    }

    try {
      // Payload uses a SHA-256 hashed secret (first 32 chars) for signing
      const encoder = new TextEncoder()
      const data = encoder.encode(PAYLOAD_SECRET)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
      const secret = encoder.encode(hashHex.substring(0, 32))

      const { payload } = await jwtVerify(token, secret)

      // Safe logging for dev only
      if (process.env.NODE_ENV === 'development') {
        // console.log('Middleware Debug - Roles:', payload.roles)
      }

      return (payload.roles as string[]) || []
    } catch (e) {
      // Log sanitized error
      const errorMessage = e instanceof Error ? e.message : 'Unknown error'
      console.error(`Middleware: JWT Verification Failed - ${errorMessage}`)
      return 'invalid'
    }
  }

  const roleOrError = token ? await getUserRole(token) : []

  // If verification explicitly failed, force a re-login to clear state
  if (roleOrError === 'invalid') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Clear the cookie to prevent infinite loops (browser will overwrite)
    const response = NextResponse.redirect(url)
    response.cookies.delete('payload-token')
    return response
  }

  const roles = Array.isArray(roleOrError) ? roleOrError : []
  const isAdmin = roles?.includes('admin')

  // PROTECT /admin
  if (pathname.startsWith('/admin')) {
    // Strict Admin Hiding: If user is logged in but NOT an admin,
    // we want them to think this page doesn't exist.

    // CHANGE: Only block if we successfully retrieved roles and confirmed 'admin' is missing.
    // If roles is null (verification failed), we let it pass to Payload to handle.
    if (token && roles !== null && !isAdmin) {
      // Rewrite to a non-existent path to trigger a 404
      return NextResponse.rewrite(new URL('/404', request.url))
    }

    // If not logged in, Payload handles the route.
  }

  // PROTECT /dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/login' // Custom login page
      return NextResponse.redirect(url)
    }

    if (isAdmin) {
      // Admins shouldn't use the shop dashboard?
      // Strict separation: Yes.
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }

    // Valid shop user -> allow access
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
