# Access Control

Access Control in Payload determines who can perform what actions on your data. It operates at multiple levels: collection-level, field-level, and document-level (via query constraints).

## Table of Contents

1. [Overview](#overview)
2. [Collection-Level Access](#collection-level-access)
3. [Field-Level Access](#field-level-access)
4. [Common Patterns](#common-patterns)
5. [Async Access Control](#async-access-control)
6. [Multi-Tenant Patterns](#multi-tenant-patterns)
7. [Best Practices](#best-practices)

---

## Overview

Access control functions receive a context object and return:
- `boolean` - `true` allows access, `false` denies
- `Query` - Query constraint for row-level security

```typescript
import type { Access } from 'payload'

// Boolean return
const authenticated: Access = ({ req: { user } }) => Boolean(user)

// Query constraint
const ownPostsOnly: Access = ({ req: { user } }) => {
  if (!user) return false
  return {
    author: { equals: user.id },
  }
}
```

---

## Collection-Level Access

Available operations: `read`, `create`, `update`, `delete`, `admin`

```typescript
import type { CollectionConfig, Access, Where } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => user?.roles?.includes('editor'),
    update: ({ req: { user } }) => {
      if (user?.roles?.includes('admin')) return true
      return { author: { equals: user?.id } }
    },
    delete: ({ req: { user } }) => user?.roles?.includes('admin'),
    admin: ({ req: { user } }) => user?.roles?.includes('admin'),
  },
  fields: [/* ... */],
}
```

### Access Operations

| Operation | Description |
|-----------|-------------|
| `read` | View documents in API and Admin |
| `create` | Create new documents |
| `update` | Update existing documents |
| `delete` | Delete documents |
| `admin` | Access in Admin Panel (UI only) |

### Boolean Return

```typescript
const adminOnly: Access = ({ req: { user } }) => {
  return user?.roles?.includes('admin')
}
```

### Query Constraint (Row-Level Security)

```typescript
const ownPostsOnly: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user?.roles?.includes('admin')) return true
  
  // Users can only access their own posts
  return {
    author: { equals: user.id },
  } as Where
}
```

### Combining Conditions

```typescript
const publishedOrOwn: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true
  
  if (user) {
    // Logged-in users: see published OR own posts
    return {
      or: [
        { status: { equals: 'published' } },
        { author: { equals: user.id } },
      ],
    } as Where
  }
  
  // Anonymous users: only published
  return {
    status: { equals: 'published' },
  } as Where
}
```

---

## Field-Level Access

Field-level access **only returns boolean** (no query constraints).

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

### Field Access Operations

| Operation | When Checked |
|-----------|--------------|
| `read` | Reading document |
| `create` | Creating document |
| `update` | Updating document |

---

## Common Patterns

### Anyone

```typescript
export const anyone: Access = () => true
```

### Authenticated Only

```typescript
export const authenticated: Access = ({ req: { user } }) => Boolean(user)
```

### Admin Only

```typescript
export const adminOnly: Access = ({ req: { user } }) => {
  return user?.roles?.includes('admin')
}
```

### Admin or Self

```typescript
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true
  return { id: { equals: user?.id } }
}
```

### Published or Authenticated

```typescript
export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
```

### Role-Based

```typescript
export const requireRole = (role: string): Access => {
  return ({ req: { user } }) => {
    return user?.roles?.includes(role)
  }
}

// Usage
access: {
  create: requireRole('editor'),
  update: requireRole('editor'),
  delete: requireRole('admin'),
}
```

---

## Async Access Control

Access control can be async for database lookups:

```typescript
const projectMemberAccess: Access = async ({ req, id }) => {
  const { user, payload } = req
  
  if (!user) return false
  if (user.roles?.includes('admin')) return true
  
  // Lookup project membership
  const project = await payload.findByID({
    collection: 'projects',
    id: id as string,
    depth: 0,
  })
  
  return project.members?.includes(user.id)
}
```

### With Transaction Support

```typescript
const complexAccess: Access = async ({ req, id }) => {
  const { user, payload } = req
  
  if (!user) return false
  
  // Use req for transaction safety
  const orders = await payload.find({
    collection: 'orders',
    where: { id: { equals: id } },
    req, // Pass req for transaction context
  })
  
  return orders.docs[0]?.customer === user.id
}
```

---

## Multi-Tenant Patterns

### Tenant Filter (Basic)

```typescript
// src/access/tenantIsolation.ts
import { Access, PayloadRequest } from 'payload'
import { extractTenantId } from '@/lib/tenant-utils'

export const tenantFilter = ({ req: { user } }: { req: PayloadRequest }) => {
  // Admins see everything
  if (user?.roles?.includes('admin')) return true
  
  // Users see only their tenant's data
  if (user?.tenant) {
    const tenantId = extractTenantId(user.tenant)
    return {
      tenant: { equals: tenantId },
    }
  }
  
  // No tenant = no access
  return { tenant: { exists: false } }
}
```

### Tenant Self-Access

For users managing their own tenant:

```typescript
export const tenantSelfAccess: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true
  
  if (user?.roles?.includes('owner')) {
    const tenantId = extractTenantId(user.tenant)
    return { id: { equals: tenantId } }
  }
  
  return false
}
```

### Tenant Admins

For admin-only operations within tenant:

```typescript
export const tenantAdmins: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true
  
  // Only owners can perform admin operations
  if (user?.roles?.includes('owner')) {
    const tenantId = extractTenantId(user.tenant)
    return { tenant: { equals: tenantId } }
  }
  
  return false
}
```

### Example: Multi-Tenant Collection

```typescript
import type { CollectionConfig } from 'payload'
import { tenantFilter } from '@/access/tenantIsolation'
import { extractTenantId } from '@/lib/tenant-utils'

export const Orders: CollectionConfig = {
  slug: 'orders',
  access: {
    read: tenantFilter,
    create: ({ req: { user } }) => Boolean(user),
    update: tenantFilter,
    delete: tenantFilter,
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      // Filter options to tenant's customers only
      filterOptions: ({ req: { user } }) => {
        if (user?.tenant) {
          return {
            tenant: { equals: extractTenantId(user.tenant) },
          }
        }
        return true
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: { hidden: true },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          const user = req.user
          if (user && user.tenant && !user.roles?.includes('admin')) {
            data.tenant = extractTenantId(user.tenant)
          }
        }
        return data
      },
    ],
  },
}
```

---

## Best Practices

### 1. Default to Restrictive

```typescript
// ❌ Too permissive
access: {
  read: () => true,
}

// ✅ Start restrictive, then open up
access: {
  read: ({ req: { user } }) => Boolean(user),
}
```

### 2. Use Query Constraints Over Async

```typescript
// ❌ Less efficient - makes DB query
const slowAccess: Access = async ({ req, id }) => {
  const doc = await req.payload.findByID({ collection: 'posts', id })
  return doc.author === req.user?.id
}

// ✅ More efficient - uses query
const fastAccess: Access = ({ req: { user } }) => {
  return { author: { equals: user?.id } }
}
```

### 3. Cache Expensive Checks

```typescript
const cachedAccess: Access = async ({ req }) => {
  const cacheKey = `access_${req.user?.id}`
  
  if (req.context[cacheKey]) {
    return req.context[cacheKey]
  }
  
  const result = await expensiveCheck(req)
  req.context[cacheKey] = result
  
  return result
}
```

### 4. Handle Edge Cases

```typescript
const safeAccess: Access = ({ req: { user } }) => {
  // Always check user exists
  if (!user) return false
  
  // Check roles safely
  if (!Array.isArray(user.roles)) return false
  
  return user.roles.includes('admin')
}
```

### 5. Document Complex Logic

```typescript
/**
 * Access control for project documents.
 * 
 * Rules:
 * - Admins: full access
 * - Project members: read/update
 * - Public projects: read only
 */
const projectAccess: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true
  // ... implementation
}
```

---

## Common Gotchas

### Field Access Can't Use Queries

```typescript
// ❌ Won't work
{
  name: 'secret',
  type: 'text',
  access: {
    read: () => ({ author: { equals: 'some-id' } }), // ERROR!
  },
}

// ✅ Must return boolean
{
  name: 'secret',
  type: 'text',
  access: {
    read: ({ req: { user }, doc }) => user?.id === doc?.author,
  },
}
```

### Local API Bypasses Access by Default

```typescript
// ❌ Access control ignored!
await payload.find({
  collection: 'posts',
  user: someUser,
})

// ✅ Enforces access control
await payload.find({
  collection: 'posts',
  user: someUser,
  overrideAccess: false, // Required!
})
```

---

## Related Documentation

- [Collections](./collections.md)
- [Fields](./fields.md)
- [Hooks](./hooks.md)
- [Queries](./queries.md)
