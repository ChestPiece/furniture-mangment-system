# Best Practices

This guide covers recommended patterns and practices for building robust, secure, and maintainable applications with Payload CMS.

## Table of Contents

1. [Security](#security)
2. [Data Integrity](#data-integrity)
3. [Performance](#performance)
4. [Type Safety](#type-safety)
5. [Code Organization](#code-organization)
6. [Common Gotchas](#common-gotchas)

---

## Security

### 1. Local API Access Control

**CRITICAL:** Always set `overrideAccess: false` when passing `user` to Local API.

```typescript
// ❌ SECURITY BUG: Access control bypassed
await payload.find({
  collection: 'posts',
  user: someUser, // Ignored! Runs with ADMIN privileges
})

// ✅ SECURE: Enforces user permissions
await payload.find({
  collection: 'posts',
  user: someUser,
  overrideAccess: false, // REQUIRED
})

// ✅ Administrative operation (intentional bypass)
await payload.find({
  collection: 'posts',
  // No user, overrideAccess defaults to true
})
```

### 2. Field-Level Access

Field-level access only returns boolean (no query constraints):

```typescript
// ❌ Won't work
{
  name: 'secret',
  type: 'text',
  access: {
    read: () => ({ author: { equals: 'some-id' } }), // ERROR!
  },
}

// ✅ Correct
{
  name: 'secret',
  type: 'text',
  access: {
    read: ({ req: { user }, doc }) => user?.id === doc?.author,
  },
}
```

### 3. JWT Best Practices

Use `saveToJWT: true` for roles to avoid database lookups:

```typescript
{
  name: 'roles',
  type: 'select',
  hasMany: true,
  options: ['admin', 'owner', 'staff'],
  saveToJWT: true, // Available in req.user without DB query
  required: true,
}
```

### 4. Default to Restrictive Access

```typescript
// ❌ Too permissive
access: {
  read: () => true,
}

// ✅ Start restrictive, open up as needed
access: {
  read: ({ req: { user } }) => Boolean(user),
}
```

### 5. Password Security

- Payload uses bcrypt for password hashing
- Minimum password length should be enforced
- Consider adding password strength validation

```typescript
{
  name: 'password',
  type: 'password',
  validate: (val) => {
    if (val.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(val)) return 'Password must contain uppercase letter'
    if (!/[0-9]/.test(val)) return 'Password must contain number'
    return true
  },
}
```

---

## Data Integrity

### 1. Transaction Safety in Hooks

**Always pass `req` to nested operations in hooks:**

```typescript
// ❌ DATA CORRUPTION RISK: Separate transaction
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        // Missing req - runs in separate transaction!
      })
    },
  ],
}

// ✅ ATOMIC: Same transaction
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        req, // Maintains atomicity
      })
    },
  ],
}
```

### 2. Prevent Infinite Hook Loops

```typescript
// ❌ INFINITE LOOP
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.update({
        collection: 'posts',
        id: doc.id,
        data: { views: doc.views + 1 },
        req,
      }) // Triggers afterChange again!
    },
  ],
}

// ✅ SAFE: Use context flag
hooks: {
  afterChange: [
    async ({ doc, req, context }) => {
      if (context.skipHooks) return

      await req.payload.update({
        collection: 'posts',
        id: doc.id,
        data: { views: doc.views + 1 },
        context: { skipHooks: true },
        req,
      })
    },
  ],
}
```

### 3. Use beforeValidate for Formatting

```typescript
{
  name: 'email',
  type: 'email',
  hooks: {
    beforeValidate: [
      ({ value }) => value?.toLowerCase()?.trim(),
    ],
  },
}
```

### 4. Use beforeChange for Business Logic

```typescript
hooks: {
  beforeChange: [
    async ({ data, operation }) => {
      if (operation === 'update' && data.status === 'published') {
        data.publishedAt = new Date()
      }
      return data
    },
  ],
}
```

### 5. Handle Validation Errors

```typescript
hooks: {
  beforeChange: [
    async ({ data }) => {
      if (data.quantity > 1000) {
        throw new Error('Maximum quantity is 1000')
      }
      return data
    },
  ],
}
```

---

## Performance

### 1. Use Select to Limit Fields

```typescript
// ❌ Fetches all fields
const result = await payload.find({ collection: 'orders' })

// ✅ Only fetches needed fields
const result = await payload.find({
  collection: 'orders',
  select: {
    id: true,
    status: true,
    totalAmount: true,
  },
})
```

### 2. Use Depth Carefully

```typescript
// ❌ Unnecessary deep population
const result = await payload.find({
  collection: 'orders',
  depth: 5, // Too deep, fetches too much data
})

// ✅ Appropriate depth
const result = await payload.find({
  collection: 'orders',
  depth: 1, // Populate direct relationships only
})
```

### 3. Index Frequently Queried Fields

```typescript
{
  name: 'status',
  type: 'select',
  index: true, // Add index for frequently queried fields
}
```

### 4. Use Query Constraints Over Async Access

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

### 5. Cache Expensive Operations

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

### 6. Optimize React Re-renders

```typescript
// ❌ BAD: Re-renders on every form change
const { fields } = useForm()

// ✅ GOOD: Only re-renders when specific field changes
const value = useFormFields(([fields]) => fields[path]?.value)
```

---

## Type Safety

### 1. Generate Types After Schema Changes

```bash
# Always run after modifying collections/fields
payload generate:types
```

### 2. Import Types from Generated File

```typescript
import type { Order, Customer, Product, User } from '@/payload-types'

// Type-safe queries
const order = await payload.findByID({
  collection: 'orders',
  id: 'order-id',
}) as Order
```

### 3. Type User Object

```typescript
import type { User } from '@/payload-types'

const access = ({ req: { user } }: { req: { user?: User } }) => {
  return user?.roles?.includes('admin')
}
```

### 4. Use Type Helpers

```typescript
import type { 
  CollectionConfig,
  Field,
  Access,
  Hook,
  RequiredDataFromCollectionSlug,
} from 'payload'

type OrderData = RequiredDataFromCollectionSlug<'orders'>
```

### 5. Use as const for Field Options

```typescript
const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
] as const

{
  name: 'status',
  type: 'select',
  options: statusOptions,
}
```

### 6. Validate TypeScript

```bash
# Run this after modifying code
tsc --noEmit
```

---

## Code Organization

### 1. Keep Collections in Separate Files

```
src/collections/
├── Users.ts
├── Orders.ts
├── Customers.ts
├── Products.ts
└── index.ts // Export all collections
```

### 2. Extract Access Control to Separate Files

```typescript
// src/access/tenantIsolation.ts
import { Access } from 'payload'

export const tenantFilter: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true
  // ...
}

export const tenantAdmins: Access = ({ req: { user } }) => {
  // ...
}
```

### 3. Extract Hooks to Reusable Functions

```typescript
// src/hooks/assignTenant.ts
import { CollectionBeforeChangeHook } from 'payload'

export const assignTenant: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  if (operation === 'create') {
    const user = req.user
    if (user && user.tenant && !user.roles?.includes('admin')) {
      data.tenant = user.tenant
    }
  }
  return data
}
```

```typescript
// src/collections/Orders.ts
import { assignTenant } from '@/hooks/assignTenant'

export const Orders: CollectionConfig = {
  slug: 'orders',
  hooks: {
    beforeChange: [assignTenant],
  },
  fields: [/* ... */],
}
```

### 4. Create Reusable Field Factories

```typescript
// src/fields/tenantField.ts
import { Field } from 'payload'

export const tenantField: Field = {
  name: 'tenant',
  type: 'relationship',
  relationTo: 'tenants',
  required: true,
  index: true,
  admin: {
    hidden: true,
  },
}
```

### 5. Document Complex Logic

```typescript
/**
 * Access control for tenant-scoped collections.
 * 
 * Rules:
 * - Admins see all documents across all tenants
 * - Owners see only their tenant's documents
 * - Staff see only their tenant's documents
 * - Anonymous users see nothing
 * 
 * @param {Object} context - The access context
 * @returns {Object|boolean} Query constraint or boolean
 */
export const tenantFilter: Access = ({ req: { user } }) => {
  // Implementation...
}
```

---

## Common Gotchas

### 1. Local API Default Access

```typescript
// Local API bypasses access control by default!
await payload.find({ collection: 'posts' }) // No access control

// Always use overrideAccess: false when passing user
await payload.find({
  collection: 'posts',
  user: currentUser,
  overrideAccess: false,
})
```

### 2. Transaction Safety

```typescript
// Nested operations need req for transaction safety
await req.payload.create({
  collection: 'logs',
  data: { /* ... */ },
  req, // Don't forget this!
})
```

### 3. Hook Loops

```typescript
// Operations in hooks can trigger the same hooks
// Always use context to prevent infinite loops
hooks: {
  afterChange: [
    async ({ doc, req, context }) => {
      if (context.skipHooks) return
      
      await req.payload.update({
        collection: 'posts',
        id: doc.id,
        data: { updated: true },
        context: { skipHooks: true },
        req,
      })
    },
  ],
}
```

### 4. Field Access vs Collection Access

```typescript
// Field access ONLY returns boolean
{
  name: 'secret',
  access: {
    read: ({ req, doc }) => user?.id === doc?.owner, // ✅ Boolean
    // read: () => ({ owner: { equals: 'id' } }), // ❌ Won't work
  },
}

// Collection access can return query or boolean
access: {
  read: ({ req: { user } }) => {
    if (user?.roles?.includes('admin')) return true // ✅ Boolean
    return { owner: { equals: user?.id } } // ✅ Query
  },
}
```

### 5. Relationship Depth

```typescript
// Default depth is 2 - be mindful of over-fetching
const result = await payload.find({
  collection: 'orders',
  depth: 2, // Populates relationships 2 levels deep
})

// Use depth: 0 for IDs only
const result = await payload.find({
  collection: 'orders',
  depth: 0, // Returns only IDs for relationships
})
```

### 6. Draft Status Field

```typescript
// When drafts are enabled, `_status` field is auto-injected
{
  versions: {
    drafts: true,
  },
}

// Query for published only
where: { _status: { equals: 'published' } }
```

### 7. Type Generation

```bash
# Types are not updated automatically
# Always run after schema changes:
payload generate:types
```

### 8. Import Map

```bash
# Components need import map regeneration
payload generate:importmap
```

### 9. Reserved Field Names

```typescript
// Cannot use these as field names:
// - __v
// - salt
// - hash
// - file
// - status (with Postgres + drafts)
```

### 10. MongoDB Transactions

```typescript
// MongoDB transactions require replica set configuration
// Single-node MongoDB doesn't support transactions
```

---

## Testing

### 1. Unit Test Hooks

```typescript
import { describe, it, expect } from 'vitest'
import { assignTenant } from '@/hooks/assignTenant'

describe('assignTenant', () => {
  it('should assign tenant from user', async () => {
    const result = await assignTenant({
      data: {},
      req: {
        user: { id: '1', tenant: 'tenant-1', roles: ['staff'] },
      },
      operation: 'create',
      collection: { slug: 'orders' },
    } as any)
    
    expect(result.tenant).toBe('tenant-1')
  })
})
```

### 2. Test Access Control

```typescript
import { tenantFilter } from '@/access/tenantIsolation'

describe('tenantFilter', () => {
  it('should allow admin to see all', () => {
    const result = tenantFilter({
      req: { user: { id: '1', roles: ['admin'] } },
    } as any)
    
    expect(result).toBe(true)
  })
  
  it('should filter by tenant for non-admins', () => {
    const result = tenantFilter({
      req: { user: { id: '1', roles: ['staff'], tenant: 't1' } },
    } as any)
    
    expect(result).toEqual({ tenant: { equals: 't1' } })
  })
})
```

---

## Related Documentation

- [Security Critical](../security-critical.md)
- [Collections](./collections.md)
- [Access Control](./access-control.md)
- [Hooks](./hooks.md)
