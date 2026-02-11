# Hooks

Hooks are lifecycle functions that run at specific points during document operations. They allow you to modify data, perform validation, execute side effects, and integrate with external systems.

## Table of Contents

1. [Hook Types](#hook-types)
2. [Collection Hooks](#collection-hooks)
3. [Field Hooks](#field-hooks)
4. [Global Hooks](#global-hooks)
5. [Hook Context](#hook-context)
6. [Transaction Safety](#transaction-safety)
7. [Common Patterns](#common-patterns)
8. [Examples](#examples)

---

## Hook Types

| Type | When It Runs | Use Case |
|------|--------------|----------|
| `beforeValidate` | Before validation | Data formatting, sanitization |
| `beforeChange` | Before database save | Business logic, calculations |
| `afterChange` | After database save | Side effects, notifications |
| `beforeRead` | Before reading | Data transformation |
| `afterRead` | After reading | Computed fields, population |
| `beforeDelete` | Before deleting | Cleanup, cascading deletes |
| `afterDelete` | After deleting | Post-deletion cleanup |
| `afterError` | On error (global only) | Error logging, notifications |

---

## Collection Hooks

```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    beforeValidate: [
      async ({ data, operation }) => {
        // Format data before validation
        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // Business logic before save
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation, previousDoc, context }) => {
        // Side effects after save
        return doc
      },
    ],
    beforeRead: [
      async ({ doc, req, query }) => {
        // Transform before reading
        return doc
      },
    ],
    afterRead: [
      async ({ doc, req, findMany }) => {
        // Add computed fields
        return doc
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Cleanup before delete
      },
    ],
    afterDelete: [
      async ({ req, id, doc }) => {
        // Post-deletion cleanup
      },
    ],
  },
  fields: [/* ... */],
}
```

### Hook Arguments

All hooks receive an arguments object with:

| Property | Description |
|----------|-------------|
| `collection` | Collection config |
| `context` | Shared context object |
| `data` | Document data (beforeChange, beforeValidate) |
| `doc` | Document (afterChange, afterRead, afterDelete) |
| `findMany` | Boolean if finding multiple docs |
| `id` | Document ID |
| `operation` | 'create', 'update', 'delete', 'read' |
| `originalDoc` | Document before changes |
| `previousDoc` | Document before this operation |
| `query` | Query object (read hooks) |
| `req` | Payload request object |

---

## Field Hooks

Field hooks run at the field level:

```typescript
{
  name: 'slug',
  type: 'text',
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        // Generate slug from title
        if (!value && data?.title) {
          return slugify(data.title)
        }
        return value
      },
    ],
    beforeChange: [
      ({ value }) => value?.toLowerCase()?.trim(),
    ],
    afterRead: [
      ({ value }) => value?.toUpperCase(),
    ],
  },
}
```

### Field Hook Arguments

| Property | Description |
|----------|-------------|
| `collection` | Collection config |
| `context` | Shared context |
| `data` | Full document data |
| `field` | Field config |
| `findMany` | Boolean if finding multiple |
| `index` | Array index (for array fields) |
| `operation` | Current operation |
| `originalDoc` | Original document |
| `overrideAccess` | Boolean |
| `path` | Field path |
| `req` | Payload request |
| `siblingData` | Data at same level |
| `siblingDoc` | Doc at same level |
| `value` | Field value |

---

## Global Hooks

Root hooks in the config:

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  hooks: {
    afterError: [
      async ({ error, req, collection }) => {
        // Log to external service
        await logErrorToService(error)
      },
    ],
  },
  collections: [/* ... */],
})
```

---

## Hook Context

Use context to pass data between hooks and prevent infinite loops:

```typescript
hooks: {
  afterChange: [
    async ({ doc, req, context }) => {
      // Check if already processed
      if (context.skipNotification) {
        return doc
      }
      
      // Send notification
      await sendNotification(doc)
      
      // Update with context to prevent loop
      await req.payload.update({
        collection: 'posts',
        id: doc.id,
        data: { lastNotified: new Date() },
        context: { skipNotification: true },
        req,
      })
      
      return doc
    },
  ],
}
```

### Context Usage Patterns

```typescript
// Pass data between hooks
hooks: {
  beforeChange: [
    async ({ data, context }) => {
      context.originalStatus = data.status
      return data
    },
  ],
  afterChange: [
    async ({ doc, context, operation }) => {
      if (context.originalStatus !== doc.status) {
        await logStatusChange(doc.id, context.originalStatus, doc.status)
      }
      return doc
    },
  ],
}
```

---

## Transaction Safety

### Critical Rule: Always Pass `req`

```typescript
// ❌ WRONG: Separate transaction, data corruption risk
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        // Missing req!
      })
    },
  ],
}

// ✅ CORRECT: Same transaction, atomic
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        req, // Same transaction context
      })
    },
  ],
}
```

### Handling Rollbacks

```typescript
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      try {
        await externalAPI.sync(doc)
      } catch (error) {
        // Log but don't throw - transaction already committed
        await logExternalSyncFailure(doc.id, error)
      }
      return doc
    },
  ],
}
```

---

## Common Patterns

### Data Formatting

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

### Auto-Generated Fields

```typescript
{
  name: 'slug',
  type: 'text',
  hooks: {
    beforeValidate: [
      ({ value, data, operation }) => {
        if (operation === 'create' && !value && data?.title) {
          return slugify(data.title)
        }
        return value
      },
    ],
  },
}
```

### Timestamp Management

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

### Computed Fields

```typescript
{
  name: 'totalAmount',
  type: 'number',
  virtual: true,
  hooks: {
    afterRead: [
      ({ siblingData }) => {
        return siblingData.items?.reduce(
          (sum, item) => sum + (item.quantity * item.price),
          0
        )
      },
    ],
  },
}
```

---

## Examples

### Order Validation Hook

```typescript
export const Orders: CollectionConfig = {
  slug: 'orders',
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Validate payments
        const total = data.totalAmount || 0
        const advance = data.advancePaid || 0
        const remaining = data.remainingPaid || 0
        
        if (advance + remaining > total) {
          throw new Error('Total paid cannot exceed order amount')
        }
        
        // Validate status vs payments
        if (data.status === 'delivered') {
          const due = Math.max(0, total - advance - remaining)
          if (due > 0) {
            throw new Error('Cannot mark as delivered while there is a due amount')
          }
        }
        
        // Auto-assign tenant
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
  fields: [/* ... */],
}
```

### Stock Recalculation Hook

```typescript
export const StockTransactions: CollectionConfig = {
  slug: 'stock-transactions',
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        if (doc.product && doc.tenant) {
          const productId = typeof doc.product === 'string' 
            ? doc.product 
            : doc.product.id
          const tenantId = typeof doc.tenant === 'string' 
            ? doc.tenant 
            : doc.tenant.id
          
          // Recalculate product stock
          const { recalculateProductStock } = await import('@/lib/stockUtils')
          await recalculateProductStock({
            payload: req.payload,
            productId,
            tenantId,
          })
        }
        return doc
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (doc.product && doc.tenant) {
          const productId = typeof doc.product === 'string' 
            ? doc.product 
            : doc.product.id
          const tenantId = typeof doc.tenant === 'string' 
            ? doc.tenant 
            : doc.tenant.id
          
          const { recalculateProductStock } = await import('@/lib/stockUtils')
          await recalculateProductStock({
            payload: req.payload,
            productId,
            tenantId,
          })
        }
        return doc
      },
    ],
  },
  fields: [/* ... */],
}
```

### Audit Log Hook

```typescript
export const Orders: CollectionConfig = {
  slug: 'orders',
  hooks: {
    afterChange: [
      async ({ doc, req, operation, previousDoc, context }) => {
        // Prevent infinite loop
        if (context.skipAudit) return doc
        
        const changes = operation === 'update' 
          ? getChanges(previousDoc, doc)
          : null
        
        await req.payload.create({
          collection: 'audit-logs',
          data: {
            action: operation,
            collection: 'orders',
            documentId: doc.id,
            user: req.user?.id,
            changes,
            timestamp: new Date(),
          },
          req,
          context: { skipAudit: true },
        })
        
        return doc
      },
    ],
  },
  fields: [/* ... */],
}
```

### Cascading Delete

```typescript
export const Orders: CollectionConfig = {
  slug: 'orders',
  hooks: {
    beforeDelete: [
      async ({ req, id }) => {
        // Delete related items
        await req.payload.delete({
          collection: 'order-items',
          where: { order: { equals: id } },
          req,
        })
        
        // Delete related payments
        await req.payload.delete({
          collection: 'payments',
          where: { order: { equals: id } },
          req,
        })
      },
    ],
  },
  fields: [/* ... */],
}
```

### Webhook Notification

```typescript
export const Orders: CollectionConfig = {
  slug: 'orders',
  hooks: {
    afterChange: [
      async ({ doc, req, operation, previousDoc }) => {
        // Only notify on status change
        if (operation === 'update' && previousDoc?.status !== doc.status) {
          await fetch(process.env.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'order.status_changed',
              orderId: doc.id,
              oldStatus: previousDoc?.status,
              newStatus: doc.status,
              timestamp: new Date().toISOString(),
            }),
          })
        }
        return doc
      },
    ],
  },
  fields: [/* ... */],
}
```

---

## Error Handling

```typescript
hooks: {
  beforeChange: [
    async ({ data }) => {
      // Validation error
      if (data.price < 0) {
        throw new Error('Price cannot be negative')
      }
      
      // Business logic error
      if (data.quantity > 1000) {
        throw new APIError('Maximum order quantity is 1000', 400)
      }
      
      return data
    },
  ],
}
```

---

## Testing Hooks

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('Order Hooks', () => {
  it('should validate payment amounts', async () => {
    const hook = Orders.hooks.beforeChange[0]
    
    await expect(
      hook({
        data: {
          totalAmount: 100,
          advancePaid: 60,
          remainingPaid: 50, // Exceeds total
        },
        operation: 'create',
        req: { user: { id: '1' } },
      })
    ).rejects.toThrow('Total paid cannot exceed order amount')
  })
})
```

---

## Related Documentation

- [Collections](./collections.md)
- [Fields](./fields.md)
- [Access Control](./access-control.md)
- [Queries](./queries.md)
