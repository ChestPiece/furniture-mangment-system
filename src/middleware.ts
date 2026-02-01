import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // 100 requests per minute

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Request Logging
  console.log(`[${new Date().toISOString()}] ${request.method} ${pathname}`)

  // 2. Rate Limiting (Skip for non-API routes)
  if (pathname.startsWith('/api')) {
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

  // 3. Auth & Role-Based Access Control
  const token = request.cookies.get('payload-token')?.value

  // Helper to get user role from token (simplified decoding)
  // NOTE: In a real prod environment, verify signature using 'jose' or similar
  const getUserRole = (token: string) => {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null
      const payload = JSON.parse(atob(parts[1]))
      // payload.collection would be 'users'
      // payload.roles is typically an array for Payload users if configured that way,
      // or we might need to rely on what's in the JWT.
      // Based on Users collection: saveToJWT: true on roles field.
      return payload.roles || []
    } catch {
      return null
    }
  }

  const roles = token ? getUserRole(token) : []
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
