# Collections

Collections are the primary way to structure data in Payload. Each collection represents a group of records (documents) that share a common schema.

## Table of Contents

1. [Basic Collection](#basic-collection)
2. [Collection Options](#collection-options)
3. [Admin Configuration](#admin-configuration)
4. [Auth Collections](#auth-collections)
5. [Upload Collections](#upload-collections)
6. [Versioning](#versioning)
7. [Examples](#examples)

---

## Basic Collection

```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'createdAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, index: true },
    { name: 'content', type: 'richText' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
  ],
  timestamps: true,
}
```

---

## Collection Options

| Option | Type | Description |
|--------|------|-------------|
| `slug` | `string` (required) | Unique, URL-friendly identifier |
| `fields` | `array` (required) | Array of field configurations |
| `admin` | `object` | Admin Panel configuration |
| `access` | `object` | Access control functions |
| `auth` | `boolean \| object` | Enable authentication |
| `hooks` | `object` | Lifecycle hooks |
| `timestamps` | `boolean` | Auto-generate createdAt/updatedAt (default: true) |
| `versions` | `boolean \| object` | Enable drafts and versioning |
| `upload` | `boolean \| object` | Enable file uploads |
| `endpoints` | `array` | Custom REST API routes |
| `defaultSort` | `string` | Default field to sort by |
| `indexes` | `array` | Compound database indexes |
| `forceSelect` | `object` | Fields always selected regardless of query |
| `dbName` | `string` | Custom table/collection name |
| `graphQL` | `object` | GraphQL configuration |
| `typescript` | `object` | TypeScript interface name |

---

## Admin Configuration

```typescript
admin: {
  // Field used as document title in lists
  useAsTitle: 'title',
  
  // Default columns in list view
  defaultColumns: ['title', 'author', 'status'],
  
  // Description shown in list view
  description: 'Manage your blog posts',
  
  // Navigation group
  group: 'Content',
  
  // Hide from navigation
  hidden: false,
  
  // Custom components
  components: {
    // Description component
    Description: '/components/PostDescription',
    
    // Edit view components
    edit: {
      SaveButton: '/components/CustomSaveButton',
      SaveDraftButton: '/components/CustomSaveDraft',
      PublishButton: '/components/CustomPublish',
    },
    
    // List view components
    list: {
      Header: '/components/ListHeader',
      beforeList: ['/components/BeforeList'],
      afterList: ['/components/AfterList'],
      beforeListTable: ['/components/BeforeTable'],
      afterListTable: ['/components/AfterTable'],
    },
  },
  
  // Pagination options
  pagination: {
    defaultLimit: 10,
    limits: [10, 25, 50, 100],
  },
  
  // Searchable fields in list view
  listSearchableFields: ['title', 'slug', 'content'],
  
  // Performance optimization
  enableListViewSelectAPI: true,
}
```

---

## Auth Collections

Enable authentication for user management:

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Token expiration in seconds (2 hours)
    tokenExpiration: 7200,
    
    // Enable email verification
    verify: true,
    
    // Max login attempts before lockout
    maxLoginAttempts: 5,
    
    // Lock duration in milliseconds (10 minutes)
    lockTime: 600000,
    
    // Enable API key authentication
    useAPIKey: true,
    
    // Cookie options
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'editor', 'user'],
      defaultValue: ['user'],
      required: true,
      saveToJWT: true, // Include in JWT token
    },
  ],
}
```

### Auth Options

| Option | Type | Description |
|--------|------|-------------|
| `tokenExpiration` | `number` | JWT token expiry in seconds |
| `verify` | `boolean` | Enable email verification |
| `maxLoginAttempts` | `number` | Failed attempts before lockout |
| `lockTime` | `number` | Lock duration in milliseconds |
| `useAPIKey` | `boolean` | Enable API key authentication |
| `cookies` | `object` | Cookie configuration |
| `forgotPassword` | `object` | Forgot password settings |

---

## Upload Collections

Enable file uploads with image processing:

```typescript
export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    // Static directory for uploaded files
    staticDir: 'media',
    
    // Allowed MIME types
    mimeTypes: ['image/*', 'application/pdf'],
    
    // Image sizes for processing
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'full',
        width: 1920,
        height: null, // Auto height
        position: 'centre',
      },
    ],
    
    // Thumbnail to show in admin
    adminThumbnail: 'thumbnail',
    
    // File size limit (10MB)
    maxFileSize: 10000000,
    
    // Custom filename format
    filenameCompoundIndex: ['alt', 'createdAt'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
  ],
}
```

### Upload Options

| Option | Type | Description |
|--------|------|-------------|
| `staticDir` | `string` | Directory for uploaded files |
| `staticURL` | `string` | Public URL for files |
| `mimeTypes` | `array` | Allowed MIME types |
| `imageSizes` | `array` | Image variants to generate |
| `adminThumbnail` | `string` | Image size for admin thumbnail |
| `maxFileSize` | `number` | Maximum file size in bytes |
| `resizeOptions` | `object` | Sharp resize options |
| `formatOptions` | `object` | Sharp format options |

---

## Versioning

Enable drafts and document versioning:

```typescript
export const Pages: CollectionConfig = {
  slug: 'pages',
  versions: {
    drafts: {
      // Auto-save drafts
      autosave: true,
      
      // Schedule publish dates
      schedulePublish: true,
      
      // Don't validate drafts
      validate: false,
    },
    // Max versions per document
    maxPerDoc: 100,
    
    // Retain versions on update
    retainDeleted: true,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'richText' },
  ],
}
```

### Versions Options

| Option | Type | Description |
|--------|------|-------------|
| `drafts` | `boolean \| object` | Enable draft functionality |
| `maxPerDoc` | `number` | Maximum versions per document |
| `retainDeleted` | `boolean` | Keep versions after delete |

---

## Examples

### Basic Content Collection

```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.roles?.includes('admin'),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        condition: (data) => data.status === 'published',
      },
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
  ],
  timestamps: true,
}
```

### Multi-Tenant Collection Pattern

```typescript
import type { CollectionConfig } from 'payload'
import { tenantFilter } from '@/access/tenantIsolation'
import { extractTenantId } from '@/lib/tenant-utils'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['orderDate', 'customer', 'status', 'totalAmount'],
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
    },
    {
      name: 'totalAmount',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Delivered', value: 'delivered' },
      ],
      defaultValue: 'pending',
      required: true,
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: {
        hidden: true,
      },
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

### Collection with Custom Endpoints

```typescript
import type { CollectionConfig, Endpoint } from 'payload'

const statsEndpoint: Endpoint = {
  path: '/stats',
  method: 'get',
  handler: async (req) => {
    const { payload } = req
    
    const total = await payload.count({
      collection: 'orders',
    })
    
    const pending = await payload.count({
      collection: 'orders',
      where: { status: { equals: 'pending' } },
    })
    
    return Response.json({
      total,
      pending,
      completed: total - pending,
    })
  },
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  endpoints: [statsEndpoint],
  fields: [/* ... */],
}
```

---

## Related Documentation

- [Field Types](./fields.md)
- [Access Control](./access-control.md)
- [Hooks](./hooks.md)
- [Admin UI](./admin-ui.md)
