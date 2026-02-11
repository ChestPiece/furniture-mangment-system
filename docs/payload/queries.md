# Queries & APIs

Payload provides multiple ways to query and manipulate data: Local API (server-side), REST API, and GraphQL API.

## Table of Contents

1. [Local API](#local-api)
2. [Query Operators](#query-operators)
3. [REST API](#rest-api)
4. [GraphQL API](#graphql-api)
5. [Type Safety](#type-safety)
6. [Performance Tips](#performance-tips)

---

## Local API

The Local API is the primary way to interact with data in server-side code (hooks, server components, API routes).

### Getting Started

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
```

### Find Documents

```typescript
const result = await payload.find({
  collection: 'orders',
  where: {
    status: { equals: 'pending' },
  },
  depth: 2,              // Populate relationships (default: 2)
  limit: 10,             // Results per page (default: 10)
  page: 1,               // Page number
  sort: '-createdAt',    // Sort order (- for descending)
  select: {              // Select specific fields
    title: true,
    status: true,
    customer: true,
  },
  pagination: true,      // Enable pagination (default: true)
  overrideAccess: false, // Respect access control (default: true!)
  showHiddenFields: false,
  req,                   // Pass for transaction context
})

// Result structure
console.log(result.docs)       // Array of documents
console.log(result.totalDocs)  // Total matching documents
console.log(result.totalPages) // Total pages
console.log(result.page)       // Current page
```

### Find by ID

```typescript
const order = await payload.findByID({
  collection: 'orders',
  id: 'order-id',
  depth: 2,
  overrideAccess: false,
})
```

### Create Document

```typescript
const order = await payload.create({
  collection: 'orders',
  data: {
    customer: 'customer-id',
    totalAmount: 50000,
    status: 'pending',
    items: [
      {
        product: 'product-id',
        quantity: 2,
        price: 25000,
      },
    ],
  },
  depth: 2,
  overrideAccess: false,
  req, // Pass for transaction context
})
```

### Update Document

```typescript
const updated = await payload.update({
  collection: 'orders',
  id: 'order-id',
  data: {
    status: 'delivered',
    remainingPaid: 25000,
  },
  depth: 2,
  overrideAccess: false,
  req,
})
```

### Update Multiple Documents

```typescript
const result = await payload.update({
  collection: 'orders',
  where: {
    status: { equals: 'pending' },
    createdAt: { less_than: '2024-01-01' },
  },
  data: {
    status: 'cancelled',
  },
  req,
})
```

### Delete Document

```typescript
const deleted = await payload.delete({
  collection: 'orders',
  id: 'order-id',
  overrideAccess: false,
  req,
})
```

### Delete Multiple Documents

```typescript
const result = await payload.delete({
  collection: 'orders',
  where: {
    status: { equals: 'cancelled' },
    createdAt: { less_than: '2024-01-01' },
  },
  req,
})
```

### Count Documents

```typescript
const count = await payload.count({
  collection: 'orders',
  where: {
    status: { equals: 'pending' },
  },
  overrideAccess: false,
})

console.log(count.totalDocs) // Number of matching documents
```

---

## Query Operators

### Comparison Operators

```typescript
// Equals
{ status: { equals: 'pending' } }

// Not equals
{ status: { not_equals: 'cancelled' } }

// Greater than
{ price: { greater_than: 100 } }

// Greater than or equal
{ price: { greater_than_equal: 100 } }

// Less than
{ quantity: { less_than: 10 } }

// Less than or equal
{ quantity: { less_than_equal: 10 } }
```

### String Operators

```typescript
// Contains (case-insensitive)
{ title: { contains: 'furniture' } }

// Like (all words present)
{ description: { like: 'wood table' } }

// In array
{ category: { in: ['sofa', 'table', 'chair'] } }

// Not in array
{ category: { not_in: ['accessory'] } }
```

### Existence Operators

```typescript
// Exists
{ deletedAt: { exists: true } }

// Does not exist
{ deletedAt: { exists: false } }
```

### Logical Operators

```typescript
// AND
{
  and: [
    { status: { equals: 'published' } },
    { publishedAt: { less_than: new Date().toISOString() } },
  ],
}

// OR
{
  or: [
    { status: { equals: 'published' } },
    { author: { equals: user.id } },
  ],
}

// NOT
{
  not: [
    { status: { equals: 'draft' } },
  ],
}
```

### Relationship Operators

```typescript
// Relationship equals
{ author: { equals: 'user-id' } }

// Relationship in
{ author: { in: ['user-1', 'user-2'] } }

// Query on related field
{ 'author.name': { contains: 'john' } }
```

### Geospatial Operators

```typescript
// Near (radius in meters)
{ location: { near: [-122.4194, 37.7749, 10000] } }

// Within polygon
{ location: { within: { type: 'Polygon', coordinates: [/* ... */] } } }
```

### Complex Query Example

```typescript
const result = await payload.find({
  collection: 'orders',
  where: {
    and: [
      { tenant: { equals: tenantId } },
      {
        or: [
          { status: { equals: 'pending' } },
          { status: { equals: 'in_progress' } },
        ],
      },
      { totalAmount: { greater_than: 10000 } },
      { createdAt: { greater_than: '2024-01-01' } },
      { customer: { exists: true } },
    ],
  },
  sort: '-createdAt',
  limit: 50,
})
```

---

## REST API

Payload automatically generates REST endpoints for all collections.

### Base URL

```
http://localhost:3000/api/:collection-slug
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/:collection` | List documents |
| POST | `/api/:collection` | Create document |
| GET | `/api/:collection/:id` | Get document by ID |
| PATCH | `/api/:collection/:id` | Update document |
| DELETE | `/api/:collection/:id` | Delete document |

### Query Parameters

```
GET /api/orders?
  where[status][equals]=pending&
  where[totalAmount][greater_than]=10000&
  depth=2&
  limit=10&
  page=1&
  sort=-createdAt&
  select[title]=true&
  select[status]=true
```

### JavaScript Example

```typescript
// List orders
const response = await fetch('http://localhost:3000/api/orders')
const data = await response.json()

// Create order
const response = await fetch('http://localhost:3000/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customer: 'customer-id',
    totalAmount: 50000,
    status: 'pending',
  }),
})
const order = await response.json()

// Update order
const response = await fetch('http://localhost:3000/api/orders/order-id', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'delivered',
  }),
})

// Delete order
await fetch('http://localhost:3000/api/orders/order-id', {
  method: 'DELETE',
})
```

### Response Format

```json
{
  "docs": [...],
  "totalDocs": 100,
  "limit": 10,
  "totalPages": 10,
  "page": 1,
  "pagingCounter": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevPage": null,
  "nextPage": 2
}
```

---

## GraphQL API

### Endpoint

```
POST /api/graphql
```

### Playground

```
http://localhost:3000/api/graphql-playground
```

### Example Query

```graphql
query {
  Orders(where: { status: { equals: "pending" } }, limit: 10) {
    docs {
      id
      totalAmount
      status
      customer {
        id
        name
        phone
      }
      items {
        product {
          name
          price
        }
        quantity
      }
    }
    totalDocs
    totalPages
  }
}
```

### Example Mutation

```graphql
mutation {
  createOrder(data: {
    customer: "customer-id",
    totalAmount: 50000,
    status: pending,
    items: [
      { product: "product-id", quantity: 2, price: 25000 }
    ]
  }) {
    id
    totalAmount
    status
  }
}
```

---

## Type Safety

### Using Generated Types

```typescript
import type { Order, Customer, Product } from '@/payload-types'

// Type-safe queries
const order = await payload.findByID({
  collection: 'orders',
  id: 'order-id',
}) as Order

// Type-safe data creation
const newOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
  customer: 'customer-id',
  totalAmount: 50000,
  status: 'pending',
  items: [],
  // ...
}
```

### Type Helpers

```typescript
import type { RequiredDataFromCollectionSlug } from 'payload'

// Get create/update data type
type OrderData = RequiredDataFromCollectionSlug<'orders'>
```

---

## Performance Tips

### 1. Use `select` to Limit Fields

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

### 2. Use `depth` Carefully

```typescript
// ❌ Unnecessary deep population
const result = await payload.find({
  collection: 'orders',
  depth: 5, // Too deep
})

// ✅ Appropriate depth
const result = await payload.find({
  collection: 'orders',
  depth: 1, // Just populate direct relationships
})
```

### 3. Use `limit` for Pagination

```typescript
// ✅ Paginate large datasets
const result = await payload.find({
  collection: 'orders',
  limit: 50,
  page: 1,
})
```

### 4. Add Database Indexes

```typescript
{
  name: 'status',
  type: 'select',
  index: true, // Add index for frequently queried fields
}
```

### 5. Use `overrideAccess: false`

```typescript
// ❌ Bypasses access control (slower, less secure)
const result = await payload.find({ collection: 'orders' })

// ✅ Uses access control (faster, more secure)
const result = await payload.find({
  collection: 'orders',
  overrideAccess: false,
  user: currentUser,
})
```

### 6. Cache Frequent Queries

```typescript
// Using React cache (Server Components)
import { cache } from 'react'

const getOrders = cache(async (tenantId: string) => {
  return await payload.find({
    collection: 'orders',
    where: { tenant: { equals: tenantId } },
  })
})
```

---

## Common Patterns

### Pattern: Paginated List

```typescript
async function getOrders(page = 1, limit = 10) {
  const result = await payload.find({
    collection: 'orders',
    sort: '-createdAt',
    limit,
    page,
    depth: 1,
  })
  
  return {
    orders: result.docs,
    totalPages: result.totalPages,
    currentPage: result.page,
    hasNextPage: result.hasNextPage,
  }
}
```

### Pattern: Search with Filters

```typescript
async function searchOrders(query: string, status?: string) {
  const conditions: Where[] = [
    {
      or: [
        { id: { contains: query } },
        { 'customer.name': { contains: query } },
      ],
    },
  ]
  
  if (status) {
    conditions.push({ status: { equals: status } })
  }
  
  return await payload.find({
    collection: 'orders',
    where: { and: conditions },
  })
}
```

### Pattern: Recent Items

```typescript
async function getRecentOrders(limit = 5) {
  const { docs } = await payload.find({
    collection: 'orders',
    sort: '-createdAt',
    limit,
    depth: 1,
  })
  
  return docs
}
```

---

## Related Documentation

- [Collections](./collections.md)
- [Access Control](./access-control.md)
- [Hooks](./hooks.md)
