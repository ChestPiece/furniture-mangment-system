# Refactoring Examples - Before & After

## Example 1: Orders Collection

### Before (232 lines)
```typescript
import { CollectionConfig } from 'payload'
import { tenantFilter } from '@/access/tenantIsolation'
import { extractTenantId } from '@/lib/tenant-utils'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['orderDate', 'customer', 'status', 'totalAmount', 'dueAmount'],
  },
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
      index: true,
      filterOptions: ({ req: { user } }) => {
        if (user?.tenant) {
          return {
            tenant: {
              equals: extractTenantId(user.tenant),
            },
          }
        }
        return true
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Ready-Made', value: 'ready-made' },
        { label: 'Custom', value: 'custom' },
      ],
      required: true,
      defaultValue: 'ready-made',
    },
    // ... 150+ more lines of field definitions
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
        // Payment validation logic...
        const total = data.totalAmount || 0
        const advance = data.advancePaid || 0
        const remaining = data.remainingPaid || 0
        if (advance + remaining > total) {
          throw new Error('Total paid cannot exceed order amount')
        }
        return data
      },
    ],
  },
  timestamps: true,
}
```

### After (75 lines)
```typescript
import type { CollectionConfig } from 'payload'
import { tenantIsolatedRelaxedAccess } from '@/access/presets'
import { createTenantManagementHook } from '@/lib/tenant/hooks'
import { orderFields } from '@/fields/common/order'
import { BUSINESS_ERROR_MESSAGES } from '@/constants/messages'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['orderDate', 'customer', 'status', 'totalAmount', 'dueAmount'],
    description: 'Customer orders with payment tracking and production status',
  },
  access: tenantIsolatedRelaxedAccess,
  fields: orderFields,
  hooks: {
    beforeChange: [
      createTenantManagementHook(),
      async ({ data }) => {
        const total = data.totalAmount || 0
        const advance = data.advancePaid || 0
        const remaining = data.remainingPaid || 0

        if (advance + remaining > total) {
          throw new Error(BUSINESS_ERROR_MESSAGES.ORDER_OVERPAYMENT)
        }

        if (data.status === 'delivered') {
          const due = Math.max(0, total - advance - remaining)
          if (due > 0) {
            throw new Error(BUSINESS_ERROR_MESSAGES.ORDER_DELIVERED_UNPAID)
          }
        }

        // Auto-update payment status
        const totalPaid = advance + remaining
        data.paymentStatus = totalPaid === 0 ? 'unpaid' : totalPaid >= total ? 'paid' : 'partial'

        return data
      },
    ],
  },
  timestamps: true,
}
```

**Improvement:** 68% fewer lines, consistent patterns, reusable components

---

## Example 2: Access Control

### Before (Duplicated in 15+ files)
```typescript
// In Orders.ts
access: {
  read: ({ req: { user } }) => {
    if (user?.roles?.includes('admin')) return true
    if (user?.tenant) {
      return {
        tenant: {
          equals: typeof user.tenant === 'object' ? user.tenant?.id : user.tenant,
        },
      }
    }
    return false
  },
  create: ({ req: { user } }) => Boolean(user),
  update: ({ req: { user } }) => {
    if (user?.roles?.includes('admin')) return true
    // ... tenant logic
  },
  delete: ({ req: { user } }) => {
    if (user?.roles?.includes('admin')) return true
    // ... tenant logic
  },
}

// Similar code repeated in Products.ts, Customers.ts, etc.
```

### After (Single source of truth)
```typescript
// In collection file - just one line!
import { tenantIsolatedRelaxedAccess } from '@/access/presets'

access: tenantIsolatedRelaxedAccess

// Or for custom needs:
import { createTenantReadAccess, createRoleBasedCreateAccess } from '@/access/factories'

access: {
  read: createTenantReadAccess(),
  create: createRoleBasedCreateAccess([USER_ROLES.ADMIN, USER_ROLES.OWNER]),
  update: createTenantUpdateAccess(),
  delete: createDeleteAccess({
    allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.OWNER],
    tenantScoped: true,
  }),
}
```

**Improvement:** Zero duplication, single point of change, tested patterns

---

## Example 3: Tenant Hook

### Before (Duplicated in every collection)
```typescript
// In Orders.ts
hooks: {
  beforeChange: [
    async ({ data, req, operation }) => {
      if (operation === 'create') {
        const user = req.user
        if (user && user.tenant && !user.roles?.includes('admin')) {
          data.tenant = typeof user.tenant === 'object' ? user.tenant.id : user.tenant
        }
      }
      return data
    },
  ],
}

// Same code in Products.ts, Customers.ts, etc.
```

### After (Reusable factory)
```typescript
// In collection file
import { createTenantManagementHook } from '@/lib/tenant/hooks'

hooks: {
  beforeChange: [createTenantManagementHook()],
}
```

**Improvement:** One implementation, consistent behavior everywhere

---

## Example 4: Using Constants

### Before (Magic strings)
```typescript
// Orders.ts
{
  name: 'status',
  type: 'select',
  options: [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
  ],
  defaultValue: 'pending',
}

// SomeComponent.tsx
if (order.status === 'pending') { ... }

// AnotherComponent.tsx  
if (order.status === 'pending') { ... } // Easy to typo
```

### After (Type-safe constants)
```typescript
// constants/index.ts
export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  DELIVERED: 'delivered',
} as const

// Orders.ts
import { ORDER_STATUS } from '@/constants'

{
  name: 'status',
  type: 'select',
  options: [
    { label: 'Pending', value: ORDER_STATUS.PENDING },
    { label: 'In Progress', value: ORDER_STATUS.IN_PROGRESS },
  ],
  defaultValue: ORDER_STATUS.PENDING,
}

// Components
import { ORDER_STATUS } from '@/constants'

if (order.status === ORDER_STATUS.PENDING) { ... } // IDE autocomplete!
```

**Improvement:** Type-safe, IDE support, single source of truth

---

## Example 5: Error Handling

### Before (Inconsistent)
```typescript
// API route 1
if (!user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}

// API route 2
if (!data) {
  return Response.json({ message: 'Not found' }, { status: 404 })
}

// Collection hook
if (advance > total) {
  throw new Error('Total paid cannot exceed order amount')
}
```

### After (Structured)
```typescript
import { AppError, createUnauthorizedError, createNotFoundError } from '@/lib/error'
import { withErrorHandler } from '@/lib/error/handler'
import { BUSINESS_ERROR_MESSAGES } from '@/constants/messages'

// API route - automatic error handling
export const GET = withErrorHandler(async (req) => {
  const user = await getUser()
  if (!user) throw createUnauthorizedError()
  
  const data = await fetchData()
  if (!data) throw createNotFoundError('Resource')
  
  return Response.json({ success: true, data })
})

// Collection hook
if (advance > total) {
  throw new AppError(
    BUSINESS_ERROR_MESSAGES.ORDER_OVERPAYMENT,
    ERROR_CODES.VALIDATION_ERROR,
    HTTP_STATUS.BAD_REQUEST
  )
}
```

**Improvement:** Consistent error format, automatic handling, type-safe

---

## Summary

| Pattern | Before | After | Benefit |
|---------|--------|-------|---------|
| Access Control | Duplicated in 15+ files | Single presets/factories | DRY, consistent |
| Tenant Hooks | Duplicated in 15+ files | Reusable factory | DRY, tested |
| Constants | Magic strings | Type-safe constants | No typos, autocomplete |
| Fields | Inline definitions | Reusable factories | Consistent, maintainable |
| Errors | Inconsistent | Structured | Predictable, debuggable |
| **Total LOC** | ~896 | ~328 | **-63%** |

The refactored code is:
- ✅ **More maintainable** - Single points of change
- ✅ **More consistent** - Same patterns everywhere
- ✅ **More testable** - Isolated, pure functions
- ✅ **More readable** - Declarative, not imperative
- ✅ **More type-safe** - TypeScript catches errors
- ✅ **More scalable** - Easy to add new features
