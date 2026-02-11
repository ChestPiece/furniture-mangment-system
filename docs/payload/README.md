# Payload CMS Documentation

Complete guide for working with Payload CMS in the Furniture Management System.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Configuration](#configuration)
3. [Project Structure](#project-structure)
4. [Quick Reference](#quick-reference)

---

## Core Concepts

### What is Payload?

Payload is a **Next.js fullstack framework** that provides:
- A full Admin Panel using React server/client components
- Automatic database schema with migrations and transactions
- Instant REST, GraphQL, and Node.js Local APIs
- Authentication for use in your own apps
- Deeply customizable access control patterns
- File storage and image management
- Live preview capabilities

### Architecture

Payload is organized into several packages:

| Package | Purpose |
|---------|---------|
| `payload` | Core business logic, Local API, operations |
| `@payloadcms/next` | Admin Panel, REST API, GraphQL API |
| `@payloadcms/graphql` | GraphQL functionality |
| `@payloadcms/ui` | UI library for Admin Panel components |
| `@payloadcms/db-mongodb` | MongoDB adapter |
| `@payloadcms/db-postgres` | PostgreSQL adapter |
| `@payloadcms/db-sqlite` | SQLite adapter |
| `@payloadcms/richtext-lexical` | Lexical rich text editor |
| `@payloadcms/richtext-slate` | Slate rich text editor |

### Key Definitions

| Term | Definition |
|------|------------|
| **Config** | Central configuration object for everything in Payload |
| **Collections** | Groups of records (Documents) sharing a common schema |
| **Globals** | Similar to Collections but correspond to a single Document |
| **Fields** | Building blocks defining document schema and Admin UI |
| **Documents** | Individual records within a Collection |

---

## Configuration

### Main Config File

```typescript
// src/payload.config.ts
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { Users } from './collections/Users'

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, /* ... */],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL,
  }),
})
```

### Config Options

| Option | Type | Description |
|--------|------|-------------|
| `serverURL` | string | Public URL of the app |
| `admin` | object | Admin Panel configuration |
| `collections` | array | Array of collection configs |
| `globals` | array | Array of global configs |
| `editor` | object | Rich text editor config |
| `secret` | string | JWT signing secret |
| `db` | object | Database adapter config |
| `typescript` | object | TypeScript generation config |
| `plugins` | array | Array of plugins |
| `cors` | array | Allowed CORS origins |
| `csrf` | array | Allowed CSRF domains |
| `hooks` | object | Global hooks |
| `localization` | object | i18n configuration |
| `upload` | object | Default upload config |

---

## Project Structure

```
src/
├── collections/          # Collection configurations
│   ├── Users.ts
│   ├── Orders.ts
│   ├── Customers.ts
│   └── ...
├── globals/             # Global configurations (if any)
├── access/              # Access control functions
│   └── tenantIsolation.ts
├── hooks/               # Shared hook functions
├── fields/              # Reusable field definitions
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components
│   └── layout/         # Layout components
├── lib/                 # Utility libraries
│   ├── utils.ts
│   ├── tenant-utils.ts
│   ├── stockUtils.ts
│   ├── financeUtils.ts
│   └── productionUtils.ts
├── app/                 # Next.js app directory
│   ├── (frontend)/     # Shop dashboard routes
│   ├── (payload)/      # Payload admin routes
│   └── api/            # API routes
├── payload.config.ts    # Main Payload config
├── payload-types.ts     # Auto-generated types
└── middleware.ts        # Next.js middleware
```

---

## Quick Reference

### Collections

See [Collections](./collections.md) for detailed information.

```typescript
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
  slug: 'my-collection',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
  ],
}
```

### Access Control

See [Access Control](./access-control.md) for detailed information.

```typescript
access: {
  read: ({ req: { user } }) => Boolean(user),
  create: ({ req: { user } }) => user?.roles?.includes('admin'),
  update: ({ req: { user } }) => user?.roles?.includes('admin'),
  delete: ({ req: { user } }) => user?.roles?.includes('admin'),
}
```

### Hooks

See [Hooks](./hooks.md) for detailed information.

```typescript
hooks: {
  beforeChange: [
    async ({ data, req, operation }) => {
      // Modify data before save
      return data
    },
  ],
  afterChange: [
    async ({ doc, req }) => {
      // Perform side effects after save
      return doc
    },
  ],
}
```

### Local API

See [Queries](./queries.md) for detailed information.

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

// Find documents
const { docs } = await payload.find({
  collection: 'orders',
  where: { status: { equals: 'pending' } },
})

// Create document
const order = await payload.create({
  collection: 'orders',
  data: { /* ... */ },
})

// Update document
await payload.update({
  collection: 'orders',
  id: order.id,
  data: { status: 'delivered' },
})

// Delete document
await payload.delete({
  collection: 'orders',
  id: order.id,
})
```

---

## CLI Commands

```bash
# Generate TypeScript types
payload generate:types

# Generate import map
payload generate:importmap

# Database operations
payload migrate
payload migrate:create
payload migrate:down

# Other commands
payload help
```

## Next Steps

- Learn about [Collections](./collections.md)
- Understand [Field Types](./fields.md)
- Master [Access Control](./access-control.md)
- Explore [Hooks](./hooks.md)
- Query data with [Local API](./queries.md)
- Customize [Admin UI](./admin-ui.md)
