import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Simple in-memory rate limiter with cleanup
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

  // 1. Request Logging
  console.log(`[${new Date().toISOString()}] ${request.method} ${pathname}`)

  // 2. Rate Limiting (Skip for non-API routes)
  if (pathname.startsWith('/api')) {
    cleanupRateLimit()
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
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
    try {
      const secret = new TextEncoder().encode(process.env.PAYLOAD_SECRET || '')
      const { payload } = await jwtVerify(token, secret)
      return (payload.roles as string[]) || []
    } catch {
      return null
    }
  }

  const roles = token ? await getUserRole(token) : []
  const isAdmin = roles?.includes('admin')
  const isOwnerOrStaff = roles?.includes('owner') || roles?.includes('staff')

  // PROTECT /admin
  if (pathname.startsWith('/admin')) {
    // Exclude actual admin login page from redirect loop if it exists,
    // though Payload usually handles /admin/login internally.
    // We strictly want to block non-admins.

    // If we are already on the login page or internal assets, let it slide (usually).
    // But payload admin is SPA-like.
    // Simplest rule: If user is logged in BUT NOT admin, kick them out.
    if (token && !isAdmin && isOwnerOrStaff) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    // If not logged in, Payload handles redirect to /admin/login automatically.
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
