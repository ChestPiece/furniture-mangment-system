# Admin UI Components

Payload's Admin Panel can be extensively customized using React components. This guide covers component types, configuration, and best practices.

## Table of Contents

1. [Component Types](#component-types)
2. [Defining Components](#defining-components)
3. [Server vs Client Components](#server-vs-client-components)
4. [UI Hooks](#ui-hooks)
5. [Root Components](#root-components)
6. [Collection Components](#collection-components)
7. [Field Components](#field-components)
8. [Using @payloadcms/ui](#using-payloadcmsui)
9. [Styling Components](#styling-components)

---

## Component Types

1. **Root Components** - Global Admin Panel (logo, nav, header)
2. **Collection Components** - Collection-specific (edit view, list view)
3. **Global Components** - Global document views
4. **Field Components** - Custom field UI and cells

---

## Defining Components

Components are defined using **file paths** (not direct imports):

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  admin: {
    components: {
      // Root components
      graphics: {
        Logo: '/components/Logo',
        Icon: '/components/Icon',
      },
      Nav: '/components/CustomNav',
      
      // Views
      views: {
        dashboard: { Component: '/components/CustomDashboard' },
      },
    },
  },
})
```

### Path Syntax

```typescript
// Default export
Logo: '/components/Logo'

// Named export (using #)
Logo: '/components/Branding#Logo'

// Object syntax with export name
Logo: {
  path: '/components/Branding',
  exportName: 'Logo',
}

// With props
Logo: {
  path: '/components/Logo',
  clientProps: { variant: 'dark' },
  serverProps: { data: 'from-server' },
}
```

### Component Path Resolution

- Paths are relative to project root or `config.admin.importMap.baseDir`
- File extensions can be omitted
- Named exports use `#ExportName` suffix or `exportName` property

---

## Server vs Client Components

### Server Components (Default)

Server Components can use the Local API directly:

```tsx
// components/CustomDashboard.tsx
import { getPayload } from 'payload'
import config from '@payload-config'

async function CustomDashboard() {
  const payload = await getPayload({ config })
  
  const { docs: orders } = await payload.find({
    collection: 'orders',
    limit: 5,
  })
  
  return (
    <div>
      <h2>Recent Orders</h2>
      {orders.map(order => (
        <div key={order.id}>{order.id}</div>
      ))}
    </div>
  )
}

export default CustomDashboard
```

### Client Components

Add `'use client'` for interactivity:

```tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@payloadcms/ui'

export function WelcomeMessage() {
  const [count, setCount] = useState(0)
  const { user } = useAuth()

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={() => setCount(c => c + 1)}>
        Clicked {count} times
      </button>
    </div>
  )
}
```

### When to Use Client Components

Use Client Components when you need:
- State (`useState`, `useReducer`)
- Effects (`useEffect`)
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `window`)

---

## UI Hooks

Available in Client Components only:

```typescript
'use client'

import {
  useAuth,           // Current user
  useConfig,         // Payload config (client-safe)
  useDocumentInfo,   // Document info (id, collection, etc.)
  useField,          // Field value and setter
  useForm,           // Form state
  useFormFields,     // Multiple field values (optimized)
  useLocale,         // Current locale
  useTranslation,    // i18n translations
  usePayload,        // Local API methods
} from '@payloadcms/ui'
```

### useAuth

```typescript
const { user, logOut, token } = useAuth()

console.log(user?.email)
console.log(user?.roles)
```

### useConfig

```typescript
const { config, getEntityConfig } = useConfig()

// Get collection config
const collectionConfig = getEntityConfig({
  collectionSlug: 'orders',
})
```

### useDocumentInfo

```typescript
const {
  id,              // Document ID
  collectionSlug,  // Collection slug
  globalSlug,      // Global slug (if applicable)
  title,           // Document title
  publishedDoc,    // Published version
  versions,        // Versions info
  docPermissions,  // Document-level permissions
  hasPublishedDoc, // Boolean
} = useDocumentInfo()
```

### useField

```typescript
const {
  value,           // Current value
  setValue,        // Set value
  initialValue,    // Initial value
  errorMessage,    // Validation error
  showError,       // Should show error
  formSubmitted,   // Boolean
  formProcessing,  // Boolean
  path,            // Field path
} = useField({ path: 'title' })
```

### useFormFields

Optimized for reading multiple fields:

```typescript
// ❌ BAD: Re-renders on every form change
const { fields } = useForm()

// ✅ GOOD: Only re-renders when specific field changes
const title = useFormFields(([fields]) => fields.title?.value)

// ✅ GOOD: Multiple fields with selector
const { title, status } = useFormFields(([fields]) => ({
  title: fields.title?.value,
  status: fields.status?.value,
}))
```

### useForm

```typescript
const {
  fields,          // All form fields
  submit,          // Submit form
  dispatchFields,  // Dispatch field actions
  validateForm,    // Validate all fields
  createFormData,  // Create FormData
  disabled,        // Form disabled state
} = useForm()
```

---

## Root Components

### Graphics (Logo & Icon)

```tsx
// components/Logo.tsx
import React from 'react'

export default function Logo() {
  return (
    <div className="logo">
      <img src="/logo.svg" alt="Logo" />
      <span>Furniture POS</span>
    </div>
  )
}
```

```typescript
// payload.config.ts
admin: {
  components: {
    graphics: {
      Logo: '/components/Logo',
      Icon: '/components/Icon',
    },
  },
}
```

### Navigation

```tsx
// components/CustomNav.tsx
'use client'

import { useAuth } from '@payloadcms/ui'

export default function CustomNav() {
  const { user } = useAuth()
  
  return (
    <nav className="custom-nav">
      <div>Welcome, {user?.email}</div>
      {/* Custom nav items */}
    </nav>
  )
}
```

```typescript
admin: {
  components: {
    Nav: '/components/CustomNav',
    beforeNavLinks: ['/components/CustomNavItem'],
    afterNavLinks: ['/components/NavFooter'],
  },
}
```

### Header

```tsx
// components/HeaderActions.tsx
'use client'

export function ClearCache() {
  return (
    <button onClick={() => fetch('/api/clear-cache')}>
      Clear Cache
    </button>
  )
}
```

```typescript
admin: {
  components: {
    header: ['/components/AnnouncementBanner'],
    actions: ['/components/ClearCache'],
  },
}
```

### Dashboard

```tsx
// components/CustomDashboard.tsx
import { getPayload } from 'payload'
import config from '@payload-config'

async function CustomDashboard() {
  const payload = await getPayload({ config })
  
  const stats = await payload.count({
    collection: 'orders',
  })
  
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Total Orders: {stats.totalDocs}</p>
    </div>
  )
}

export default CustomDashboard
```

```typescript
admin: {
  components: {
    views: {
      dashboard: { Component: '/components/CustomDashboard' },
    },
    beforeDashboard: ['/components/WelcomeMessage'],
    afterDashboard: ['/components/Analytics'],
  },
}
```

### Account & Logout

```typescript
admin: {
  components: {
    account: {
      Avatar: '/components/Avatar',
    },
    logout: {
      Button: '/components/LogoutButton',
    },
  },
}
```

---

## Collection Components

### Edit View Components

```typescript
export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    components: {
      edit: {
        PreviewButton: '/components/PreviewButton',
        SaveButton: '/components/CustomSave',
        SaveDraftButton: '/components/SaveDraft',
        PublishButton: '/components/Publish',
        Status: '/components/StatusBadge',
        UnpublishButton: '/components/Unpublish',
        Upload: '/components/CustomUpload',
      },
    },
  },
}
```

### List View Components

```typescript
export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    components: {
      list: {
        Header: '/components/ListHeader',
        beforeList: ['/components/BulkActions'],
        afterList: ['/components/ListFooter'],
        beforeListTable: ['/components/BeforeTable'],
        afterListTable: ['/components/AfterTable'],
      },
    },
  },
}
```

### Custom List Component Example

```tsx
// components/ListHeader.tsx
'use client'

import { useConfig } from '@payloadcms/ui'
import Link from 'next/link'

export default function ListHeader() {
  const { routes: { admin } } = useConfig()
  
  return (
    <div className="list-header">
      <Link href={`${admin}/collections/orders/create`}>
        + New Order
      </Link>
    </div>
  )
}
```

---

## Field Components

### Custom Field Component

```tsx
// components/StatusField.tsx
'use client'

import { useField } from '@payloadcms/ui'

export default function StatusField() {
  const { value, setValue } = useField({ path: 'status' })
  
  return (
    <div className="custom-status-field">
      <select
        value={value as string}
        onChange={(e) => setValue(e.target.value)}
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  )
}
```

```typescript
{
  name: 'status',
  type: 'select',
  admin: {
    components: {
      Field: '/components/StatusField',
    },
  },
}
```

### Custom Cell Component

```tsx
// components/StatusCell.tsx
'use client'

import { useCell } from '@payloadcms/ui'

export default function StatusCell() {
  const { cellData } = useCell()
  
  const colors = {
    pending: 'orange',
    completed: 'green',
    cancelled: 'red',
  }
  
  return (
    <span style={{ color: colors[cellData as string] }}>
      {cellData}
    </span>
  )
}
```

```typescript
{
  name: 'status',
  type: 'select',
  admin: {
    components: {
      Cell: '/components/StatusCell',
    },
  },
}
```

### Custom Label Component

```tsx
// components/CustomLabel.tsx
'use client'

import { useField } from '@payloadcms/ui'

export default function CustomLabel() {
  const { path } = useField()
  
  return (
    <label className="custom-label">
      {path} <span className="required">*</span>
    </label>
  )
}
```

### UI Field (Presentational Only)

```typescript
{
  name: 'orderSummary',
  type: 'ui',
  admin: {
    components: {
      Field: '/components/OrderSummary',
    },
  },
}
```

```tsx
// components/OrderSummary.tsx
'use client'

import { useFormFields } from '@payloadcms/ui'

export default function OrderSummary() {
  const totalAmount = useFormFields(([fields]) => fields.totalAmount?.value)
  const items = useFormFields(([fields]) => fields.items?.value)
  
  return (
    <div className="order-summary">
      <h3>Order Summary</h3>
      <p>Items: {items?.length || 0}</p>
      <p>Total: ${totalAmount || 0}</p>
    </div>
  )
}
```

---

## Using @payloadcms/ui

### Import Pattern

**Admin Panel:**
```typescript
// Import from main package for Admin Panel
import { Button } from '@payloadcms/ui'
```

**Frontend (separate):**
```typescript
// Import from subpath for frontend to avoid bundle bloat
import { Button } from '@payloadcms/ui/elements/Button'
```

### Available Components

#### Elements

```typescript
// Buttons
import { Button } from '@payloadcms/ui/elements/Button'
import { PublishButton } from '@payloadcms/ui/elements/PublishButton'
import { SaveButton } from '@payloadcms/ui/elements/SaveButton'

// Form Elements
import { ReactSelect } from '@payloadcms/ui/elements/ReactSelect'
import { DatePicker } from '@payloadcms/ui/elements/DatePicker'
import { Pill } from '@payloadcms/ui/elements/Pill'

// Layout
import { Collapsible } from '@payloadcms/ui/elements/Collapsible'
import { Gutter } from '@payloadcms/ui/elements/Gutter'
import { Popup } from '@payloadcms/ui/elements/Popup'

// Data Display
import { Table } from '@payloadcms/ui/elements/Table'
import { Paginator } from '@payloadcms/ui/elements/Paginator'

// Feedback
import { Banner } from '@payloadcms/ui/elements/Banner'
import { Toast } from '@payloadcms/ui/elements/Toast'
```

#### Fields

```typescript
import { TextInput } from '@payloadcms/ui/fields/Text'
import { FieldLabel } from '@payloadcms/ui/fields/FieldLabel'
import { FieldDescription } from '@payloadcms/ui/fields/FieldDescription'
import { FieldError } from '@payloadcms/ui/fields/FieldError'
```

#### Drag & Drop

```typescript
import { DraggableSortable } from '@payloadcms/ui/elements/DraggableSortable'
```

---

## Styling Components

### Using Payload's CSS Variables

```scss
// styles.scss
.my-component {
  // Colors
  background-color: var(--theme-elevation-100);
  color: var(--theme-text);
  
  // Spacing
  padding: var(--base);
  margin: calc(var(--base) * 2);
  
  // Border
  border-radius: var(--border-radius);
  border: 1px solid var(--theme-elevation-200);
  
  // Typography
  font-family: var(--font-body);
  font-size: var(--font-size-base);
}
```

### Available CSS Variables

| Variable | Description |
|----------|-------------|
| `--theme-bg` | Background color |
| `--theme-text` | Text color |
| `--theme-elevation-50` | Lightest elevation |
| `--theme-elevation-100` | Light elevation |
| `--theme-elevation-200` | Medium elevation |
| `--theme-elevation-300` | Dark elevation |
| `--theme-elevation-400` | Darker elevation |
| `--theme-elevation-500` | Darkest elevation |
| `--theme-success-*` | Success colors |
| `--theme-warning-*` | Warning colors |
| `--theme-error-*` | Error colors |
| `--base` | Base spacing unit |
| `--border-radius` | Border radius |
| `--font-body` | Body font family |
| `--font-mono` | Monospace font |

### Importing Payload's SCSS

```scss
@import '~@payloadcms/ui/scss';

.my-component {
  @include mid-break {
    // Responsive styles
  }
}
```

---

## Import Map

Payload auto-generates import maps to resolve component paths:

```bash
# Regenerate manually after adding components
payload generate:importmap
```

The import map is located at:
```
src/app/(payload)/admin/importMap.js
```

---

## Best Practices

### 1. Prefer Server Components

Only use Client Components when you need:
- State/effects
- Event handlers
- Browser APIs

### 2. Minimize Serialized Props

Server Components serialize props sent to Client Components:

```tsx
// ❌ Too much data
<ClientComponent data={hugeArray} />

// ✅ Minimal data
<ClientComponent ids={minimalIds} />
```

### 3. Use Optimized Selectors

```typescript
// ❌ Re-renders on every form change
const { fields } = useForm()

// ✅ Only re-renders when specific field changes
const value = useFormFields(([fields]) => fields[path]?.value)
```

### 4. Handle Loading States

```tsx
'use client'

import { useAuth } from '@payloadcms/ui'

export function UserProfile() {
  const { user, status } = useAuth()
  
  if (status === 'loading') {
    return <div>Loading...</div>
  }
  
  if (!user) {
    return <div>Not logged in</div>
  }
  
  return <div>{user.email}</div>
}
```

---

## Related Documentation

- [Collections](./collections.md)
- [Fields](./fields.md)
- [Hooks](./hooks.md)
