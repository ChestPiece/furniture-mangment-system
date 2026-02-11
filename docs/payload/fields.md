# Field Types

Fields are the building blocks of Payload collections. They define the schema structure, validation rules, and Admin UI components.

## Table of Contents

1. [Data Fields](#data-fields)
2. [Presentational Fields](#presentational-fields)
3. [Virtual Fields](#virtual-fields)
4. [Field Options](#field-options)
5. [Validation](#validation)
6. [Conditional Logic](#conditional-logic)
7. [Examples](#examples)

---

## Data Fields

These fields store data in the database:

### Text Fields

#### `text`
Single-line text input.

```typescript
{
  name: 'title',
  type: 'text',
  required: true,
  maxLength: 100,
  minLength: 3,
}
```

#### `textarea`
Multi-line text input.

```typescript
{
  name: 'description',
  type: 'textarea',
  rows: 5,
  maxLength: 1000,
}
```

### Numeric Fields

#### `number`
Numeric values with optional min/max.

```typescript
{
  name: 'price',
  type: 'number',
  required: true,
  min: 0,
  max: 1000000,
}
```

### Selection Fields

#### `select`
Dropdown with predefined options.

```typescript
{
  name: 'status',
  type: 'select',
  options: [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
  ],
  defaultValue: 'pending',
  required: true,
  hasMany: false, // Set to true for multi-select
}
```

#### `radio`
Radio button group.

```typescript
{
  name: 'priority',
  type: 'radio',
  options: [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ],
  defaultValue: 'medium',
}
```

#### `checkbox`
Boolean true/false.

```typescript
{
  name: 'isActive',
  type: 'checkbox',
  defaultValue: true,
  label: 'Active?',
}
```

### Date Fields

#### `date`
Date picker with timestamp.

```typescript
{
  name: 'deliveryDate',
  type: 'date',
  admin: {
    date: {
      pickerAppearance: 'dayAndTime', // 'dayOnly' | 'timeOnly'
      displayFormat: 'dd/MM/yyyy',
    },
  },
}
```

### Relationship Fields

#### `relationship`
Link to other collections.

```typescript
{
  name: 'author',
  type: 'relationship',
  relationTo: 'users',
  required: true,
  hasMany: false, // Set to true for multiple relations
  maxDepth: 2,    // Depth of population
  filterOptions: ({ req: { user } }) => {
    // Filter available options
    return { role: { equals: 'author' } }
  },
}
```

**Polymorphic Relationship** (relation to multiple collections):
```typescript
{
  name: 'relatedItem',
  type: 'relationship',
  relationTo: ['posts', 'pages', 'products'],
  hasMany: true,
}
```

### File Fields

#### `upload`
File/image upload.

```typescript
{
  name: 'featuredImage',
  type: 'upload',
  relationTo: 'media',
  required: true,
  filterOptions: {
    mimeType: { contains: 'image' },
  },
}
```

### Structured Data Fields

#### `array`
Repeating content with nested fields.

```typescript
{
  name: 'items',
  type: 'array',
  required: true,
  minRows: 1,
  maxRows: 10,
  labels: {
    singular: 'Item',
    plural: 'Items',
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
    },
  ],
}
```

#### `group`
Nested fields within a keyed object.

```typescript
{
  name: 'contact',
  type: 'group',
  fields: [
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'address', type: 'textarea' },
  ],
}
```

#### `blocks`
Block-based content (polymorphic).

```typescript
{
  name: 'content',
  type: 'blocks',
  blocks: [
    {
      slug: 'textBlock',
      fields: [
        { name: 'content', type: 'richText' },
      ],
    },
    {
      slug: 'imageBlock',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      slug: 'ctaBlock',
      fields: [
        { name: 'text', type: 'text' },
        { name: 'url', type: 'text' },
        { name: 'style', type: 'select', options: ['primary', 'secondary'] },
      ],
    },
  ],
}
```

### Special Fields

#### `email`
Email with validation.

```typescript
{
  name: 'email',
  type: 'email',
  required: true,
  unique: true,
}
```

#### `password`
Secure password field.

```typescript
{
  name: 'password',
  type: 'password',
  required: true,
  validate: (val) => val.length >= 8 || 'Password must be at least 8 characters',
}
```

#### `richText`
Full rich text editor (Lexical or Slate).

```typescript
{
  name: 'content',
  type: 'richText',
  required: true,
}
```

#### `code`
Code editor interface.

```typescript
{
  name: 'config',
  type: 'code',
  language: 'json', // 'json' | 'typescript' | 'css' | 'html' | etc.
}
```

#### `json`
JSON editor.

```typescript
{
  name: 'metadata',
  type: 'json',
  admin: {
    description: 'Additional metadata in JSON format',
  },
}
```

#### `point`
Geolocation coordinates.

```typescript
{
  name: 'location',
  type: 'point',
  admin: {
    description: 'Latitude and longitude',
  },
}
```

#### `join` (Virtual)
Two-way relationship (virtual field).

```typescript
{
  name: 'relatedOrders',
  type: 'join',
  collection: 'orders',
  on: 'customer', // Field in orders that references this collection
}
```

---

## Presentational Fields

These fields don't store data, only affect the Admin UI:

### `collapsible`
Collapsible container.

```typescript
{
  type: 'collapsible',
  label: 'Advanced Settings',
  fields: [
    { name: 'setting1', type: 'text' },
    { name: 'setting2', type: 'checkbox' },
  ],
}
```

### `row`
Horizontal field alignment.

```typescript
{
  type: 'row',
  fields: [
    { name: 'firstName', type: 'text', width: '50%' },
    { name: 'lastName', type: 'text', width: '50%' },
  ],
}
```

### `tabs`
Tabbed layout for fields.

```typescript
{
  type: 'tabs',
  tabs: [
    {
      label: 'General',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      label: 'SEO',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
      ],
    },
  ],
}
```

### `ui`
Custom UI component.

```typescript
{
  name: 'customSection',
  type: 'ui',
  admin: {
    components: {
      Field: '/components/CustomUISection',
    },
  },
}
```

---

## Virtual Fields

Fields that don't store data but compute values:

### Computed Text Field

```typescript
{
  name: 'fullName',
  type: 'text',
  virtual: true,
  hooks: {
    afterRead: [
      ({ siblingData }) => `${siblingData.firstName} ${siblingData.lastName}`,
    ],
  },
}
```

### Path Virtual

```typescript
{
  name: 'authorName',
  type: 'text',
  virtual: 'author.name', // Gets name from author relationship
}
```

---

## Field Options

Common options available on all fields:

```typescript
{
  name: 'fieldName',           // Required: field identifier
  type: 'text',                // Required: field type
  
  // Basic options
  label: 'Custom Label',       // Display label
  required: true,              // Required field
  unique: true,                // Unique constraint
  index: true,                 // Database index
  
  // Default value
  defaultValue: 'default',
  defaultValue: () => new Date().toISOString(),
  
  // Localization
  localized: true,             // Enable translations
  
  // Validation
  validate: (value, options) => {
    if (value.length < 3) {
      return 'Must be at least 3 characters'
    }
    return true
  },
  
  // Access control
  access: {
    read: ({ req }) => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
  },
  
  // Hooks
  hooks: {
    beforeValidate: [async ({ value }) => value?.trim()],
    beforeChange: [async ({ value }) => value?.toLowerCase()],
    afterRead: [async ({ value }) => value?.toUpperCase()],
  },
  
  // Admin UI
  admin: {
    description: 'Help text',
    position: 'sidebar',       // 'sidebar' | undefined
    readOnly: false,
    disabled: false,
    hidden: false,
    placeholder: 'Enter value...',
    width: '50%',              // CSS width
    
    // Conditional visibility
    condition: (data, siblingData) => {
      return data.status === 'active'
    },
    
    // Custom components
    components: {
      Field: '/components/CustomField',
      Cell: '/components/CustomCell',
      Label: '/components/CustomLabel',
      Description: '/components/CustomDescription',
    },
  },
}
```

---

## Validation

### Built-in Validation

| Option | Description |
|--------|-------------|
| `required` | Field must have a value |
| `unique` | Value must be unique in collection |
| `min` | Minimum value (number) |
| `max` | Maximum value (number) |
| `minLength` | Minimum length (text) |
| `maxLength` | Maximum length (text) |

### Custom Validation

```typescript
{
  name: 'phone',
  type: 'text',
  validate: (value) => {
    // Return true if valid
    if (/^\+?[\d\s-()]+$/.test(value)) {
      return true
    }
    // Return error message if invalid
    return 'Invalid phone number format'
  },
}
```

### Async Validation

```typescript
{
  name: 'email',
  type: 'email',
  validate: async (value, { req, operation, id }) => {
    const existing = await req.payload.find({
      collection: 'users',
      where: {
        email: { equals: value },
        id: { not_equals: id }, // Exclude current doc on update
      },
    })
    
    if (existing.docs.length > 0) {
      return 'Email already in use'
    }
    return true
  },
}
```

---

## Conditional Logic

Show/hide fields based on other field values:

```typescript
{
  name: 'otherField',
  type: 'text',
  admin: {
    condition: (data, siblingData) => {
      // data = all form data
      // siblingData = data at same level (for arrays/groups)
      return data.status === 'other'
    },
  },
}
```

### Complex Conditions

```typescript
{
  name: 'customDimensions',
  type: 'group',
  admin: {
    condition: (data) => {
      return data.productType === 'custom' && data.requiresDimensions === true
    },
  },
  fields: [
    { name: 'length', type: 'number' },
    { name: 'width', type: 'number' },
    { name: 'height', type: 'number' },
  ],
}
```

---

## Examples

### Order Item Array

```typescript
{
  name: 'items',
  type: 'array',
  required: true,
  minRows: 1,
  labels: {
    singular: 'Item',
    plural: 'Items',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          width: '50%',
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 1,
          width: '25%',
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
          width: '25%',
        },
      ],
    },
    {
      name: 'customizations',
      type: 'json',
      admin: {
        description: 'Custom specifications for this item',
      },
    },
    {
      name: 'productionStatus',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'In Production', value: 'in_production' },
        { label: 'Ready', value: 'ready' },
        { label: 'Delivered', value: 'delivered' },
      ],
      defaultValue: 'pending',
    },
  ],
}
```

### Address Group

```typescript
{
  name: 'address',
  type: 'group',
  fields: [
    {
      name: 'street',
      type: 'text',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'city',
          type: 'text',
          required: true,
          width: '50%',
        },
        {
          name: 'postalCode',
          type: 'text',
          required: true,
          width: '50%',
        },
      ],
    },
    {
      name: 'country',
      type: 'select',
      options: [
        { label: 'United States', value: 'US' },
        { label: 'United Kingdom', value: 'UK' },
        { label: 'Canada', value: 'CA' },
      ],
      defaultValue: 'US',
    },
  ],
}
```

### SEO Tab

```typescript
{
  type: 'tabs',
  tabs: [
    {
      label: 'Content',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'richText' },
      ],
    },
    {
      label: 'SEO',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          maxLength: 60,
          admin: {
            description: 'Recommended: 50-60 characters',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 160,
          admin: {
            description: 'Recommended: 150-160 characters',
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
```

---

## Reserved Field Names

Cannot use these as field names:
- `__v`
- `salt`
- `hash`
- `file`
- `status` (with Postgres + drafts enabled)

---

## Related Documentation

- [Collections](./collections.md)
- [Access Control](./access-control.md)
- [Hooks](./hooks.md)
- [Admin UI](./admin-ui.md)
