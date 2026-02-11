# Authentication

Payload provides built-in authentication that can be added to any collection. It includes JWT tokens, session management, password hashing, and various security features.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Auth Options](#auth-options)
3. [User Fields](#user-fields)
4. [Authentication Operations](#authentication-operations)
5. [Access Control with Auth](#access-control-with-auth)
6. [API Keys](#api-keys)
7. [Email Verification](#email-verification)
8. [Password Reset](#password-reset)
9. [Customizing Auth](#customizing-auth)

---

## Basic Setup

Enable authentication on any collection by adding `auth: true`:

```typescript
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    { name: 'name', type: 'text' },
  ],
}
```

This automatically adds:
- `email` field (used as username)
- `password` field (hashed with bcrypt)
- Authentication methods on the collection

---

## Auth Options

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Token expiration in seconds (default: 7200 = 2 hours)
    tokenExpiration: 7200,
    
    // Enable email verification (default: false)
    verify: {
      generateEmailHTML: ({ token, user }) => {
        return `<a href="http://localhost:3000/verify?token=${token}">Verify Email</a>`
      },
    },
    
    // Max login attempts before lockout (default: 5)
    maxLoginAttempts: 5,
    
    // Lock duration in milliseconds (default: 600000 = 10 min)
    lockTime: 600000,
    
    // Enable API key authentication (default: false)
    useAPIKey: true,
    
    // Cookie configuration
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.COOKIE_DOMAIN,
    },
    
    // Forgot password settings
    forgotPassword: {
      generateEmailHTML: ({ token, user }) => {
        return `<a href="http://localhost:3000/reset-password?token=${token}">Reset Password</a>`
      },
      expiration: 3600000, // 1 hour
    },
  },
  fields: [/* ... */],
}
```

### Auth Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tokenExpiration` | `number` | `7200` | JWT expiry in seconds |
| `verify` | `boolean \| object` | `false` | Email verification |
| `maxLoginAttempts` | `number` | `5` | Failed attempts before lock |
| `lockTime` | `number` | `600000` | Lock duration in ms |
| `useAPIKey` | `boolean` | `false` | API key authentication |
| `cookies` | `object` | `{}` | Cookie settings |
| `forgotPassword` | `object` | `{}` | Forgot password config |

---

## User Fields

### Common User Field Patterns

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Owner', value: 'owner' },
        { label: 'Staff', value: 'staff' },
      ],
      defaultValue: ['staff'],
      required: true,
      saveToJWT: true, // Include in JWT token
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: false,
      saveToJWT: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
}
```

### `saveToJWT` Option

Include fields in the JWT token for fast access without database lookups:

```typescript
{
  name: 'roles',
  type: 'select',
  hasMany: true,
  options: ['admin', 'owner', 'staff'],
  saveToJWT: true, // Available in req.user from token
}
```

Access in hooks/middleware:

```typescript
const access = ({ req: { user } }) => {
  // user.roles comes directly from JWT, no DB query needed
  return user?.roles?.includes('admin')
}
```

---

## Authentication Operations

### Login

```typescript
const result = await payload.login({
  collection: 'users',
  data: {
    email: 'user@example.com',
    password: 'password123',
  },
  depth: 2,
})

// Result includes:
console.log(result.token) // JWT token
console.log(result.user)  // User document
console.log(result.exp)   // Expiration timestamp
```

### Logout

```typescript
await payload.logout({
  collection: 'users',
  res, // Express/Next response object for cookie clearing
})
```

### Get Current User

```typescript
const user = await payload.auth({
  headers: requestHeaders, // Next.js headers
  req, // Express request
})

console.log(user) // Current user or null
```

### Forgot Password

```typescript
await payload.forgotPassword({
  collection: 'users',
  data: {
    email: 'user@example.com',
  },
  // Optional: disableEmail to handle email yourself
  disableEmail: false,
})
```

### Reset Password

```typescript
const result = await payload.resetPassword({
  collection: 'users',
  data: {
    token: 'reset-token-from-email',
    password: 'newPassword123',
  },
})

console.log(result.token) // New JWT token
console.log(result.user)  // User document
```

### Verify Email

```typescript
await payload.verifyEmail({
  collection: 'users',
  token: 'verification-token',
})
```

---

## Access Control with Auth

### Protecting Collections

```typescript
export const Orders: CollectionConfig = {
  slug: 'orders',
  access: {
    // Must be logged in
    read: ({ req: { user } }) => Boolean(user),
    
    // Must have specific role
    create: ({ req: { user } }) => 
      user?.roles?.some(r => ['owner', 'staff'].includes(r)),
    
    // Owner or admin
    update: ({ req: { user } }) => {
      if (user?.roles?.includes('admin')) return true
      return { createdBy: { equals: user?.id } }
    },
    
    // Admin only
    delete: ({ req: { user } }) => 
      user?.roles?.includes('admin'),
  },
  fields: [/* ... */],
}
```

### Protecting Fields

```typescript
{
  name: 'salary',
  type: 'number',
  access: {
    read: ({ req: { user }, doc }) => {
      // Self can read own salary
      if (user?.id === doc?.id) return true
      // Admin can read all
      return user?.roles?.includes('admin')
    },
    update: ({ req: { user } }) => {
      // Only admins can update
      return user?.roles?.includes('admin')
    },
  },
}
```

---

## API Keys

Enable API keys for programmatic access:

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    useAPIKey: true,
  },
  fields: [/* ... */],
}
```

### Using API Keys

Include the API key in headers:

```bash
Authorization: users API-KEY-HERE
```

```typescript
// JavaScript
const response = await fetch('http://localhost:3000/api/orders', {
  headers: {
    'Authorization': 'users your-api-key-here',
  },
})
```

### Generating API Keys

API keys are generated automatically when creating/updating users. Access them via:

```typescript
const user = await payload.findByID({
  collection: 'users',
  id: 'user-id',
})

console.log(user.apiKey) // The API key
console.log(user.enableAPIKey) // Whether API key is enabled
```

---

## Email Verification

### Setup

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    verify: {
      generateEmailHTML: ({ token, user, req }) => {
        const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/verify?token=${token}`
        return `
          <h1>Verify Your Email</h1>
          <p>Hello ${user.name || user.email},</p>
          <p>Click the link below to verify your email:</p>
          <a href="${url}">${url}</a>
        `
      },
      generateEmailSubject: ({ user }) => {
        return `Verify your email for ${process.env.SITE_NAME}`
      },
    },
  },
  fields: [/* ... */],
}
```

### Verification Flow

1. User registers
2. Email sent with verification token
3. User clicks link with token
4. Token verified via `payload.verifyEmail()`
5. User can now log in

---

## Password Reset

### Setup

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    forgotPassword: {
      generateEmailHTML: ({ token, user, req }) => {
        const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password?token=${token}`
        return `
          <h1>Reset Your Password</h1>
          <p>Hello ${user.name || user.email},</p>
          <p>Click the link below to reset your password:</p>
          <a href="${url}">${url}</a>
          <p>This link expires in 1 hour.</p>
        `
      },
      expiration: 3600000, // 1 hour
    },
  },
  fields: [/* ... */],
}
```

### Reset Flow

1. User requests password reset
2. Email sent with reset token
3. User clicks link with token
4. User submits new password
5. Password updated via `payload.resetPassword()`

---

## Customizing Auth

### Custom Login Page

```typescript
// src/app/(auth)/login/page.tsx
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="login-page">
      <LoginForm />
    </div>
  )
}
```

### Custom Logout Action

```typescript
// src/app/(auth)/actions.ts
'use server'

import { cookies } from 'next/headers'

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('payload-token')
}
```

### Protecting Routes

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('payload-token')?.value
  const { pathname } = request.nextUrl
  
  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // Redirect logged-in users from login page
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}
```

### Server Component Authentication

```typescript
// Server Component
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

export default async function DashboardPage() {
  const payload = await getPayload({ config })
  const headersList = await headers()
  
  const { user } = await payload.auth({ headers: headersList })
  
  if (!user) {
    return <div>Unauthorized</div>
  }
  
  return <div>Welcome, {user.email}</div>
}
```

### Client Component Authentication

```typescript
'use client'

import { useAuth } from '@payloadcms/ui'

export function UserProfile() {
  const { user, logOut } = useAuth()
  
  if (!user) {
    return <div>Not logged in</div>
  }
  
  return (
    <div>
      <p>Hello, {user.email}</p>
      <button onClick={logOut}>Logout</button>
    </div>
  )
}
```

---

## Multi-Tenant Auth Pattern

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      
      // Users can read themselves and their tenant members
      if (user.roles?.includes('owner')) {
        return {
          tenant: { equals: user.tenant },
        }
      }
      
      return { id: { equals: user.id } }
    },
    create: ({ req: { user } }) => {
      // Only admins and owners can create users
      return user?.roles?.some(r => ['admin', 'owner'].includes(r))
    },
    update: ({ req: { user } }) => {
      if (user?.roles?.includes('admin')) return true
      
      // Owners can update their tenant users
      if (user?.roles?.includes('owner')) {
        return { tenant: { equals: user.tenant } }
      }
      
      // Users can update themselves
      return { id: { equals: user.id } }
    },
    delete: ({ req: { user } }) => {
      // Protect god admin
      const godAdminEmail = process.env.GOD_ADMIN_EMAIL
      
      if (user?.roles?.includes('admin')) {
        if (godAdminEmail) {
          return { email: { not_equals: godAdminEmail } }
        }
        return true
      }
      
      if (user?.roles?.includes('owner')) {
        return { tenant: { equals: user.tenant } }
      }
      
      return false
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          const user = req.user
          
          // Auto-assign tenant for non-admins
          if (user && !user.roles?.includes('admin') && user.tenant) {
            data.tenant = user.tenant
          }
          
          // Validate: non-admins MUST have a tenant
          const isAdmin = data.roles?.includes('admin')
          if (!isAdmin && !data.tenant) {
            throw new Error('Tenant is required for non-admin users')
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'owner', 'staff'],
      defaultValue: ['staff'],
      saveToJWT: true,
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      saveToJWT: true,
      index: true,
    },
  ],
}
```

---

## Related Documentation

- [Collections](./collections.md)
- [Access Control](./access-control.md)
- [Hooks](./hooks.md)
