# Furniture Management System - Refactoring Plan

## Current Architecture Analysis

### Project Structure (Current)
```
src/
├── access/              # Access control functions
├── actions/             # Server actions
├── app/                 # Next.js app router
│   ├── (auth)/          # Auth routes
│   ├── (frontend)/      # Dashboard routes
│   └── (payload)/       # Payload admin
├── collections/         # Payload collections
├── components/          # React components
│   ├── dashboard/       # Dashboard-specific
│   ├── layout/          # Layout components
│   └── ui/              # UI primitives
├── hooks/               # React hooks
├── lib/                 # Utilities
├── access/              # Access control
├── utilities/           # More utilities
└── payload.config.ts
```

### Identified Issues

#### 1. **Code Duplication**
- Tenant auto-assignment hooks duplicated in every collection
- Access control patterns repeated across collections
- Common field patterns (tenant relationship) duplicated

#### 2. **Magic Strings**
- Status values scattered throughout code
- Role names used as literal strings
- No centralized constants

#### 3. **Mixed Concerns**
- Utilities folder has mixed domain logic
- No clear separation between business logic and utilities

#### 4. **Inconsistent Error Handling**
- Some places throw Error, others don't handle errors
- No centralized error handling pattern

#### 5. **Type Safety Gaps**
- Some `any` types used
- Not leveraging Payload's generated types fully

---

## Refactoring Strategy

### Phase 1: Foundation (Constants, Types, Utilities)

#### 1.1 Create Constants Layer
```
src/
├── constants/
│   ├── enums.ts          # All enum-like constants
│   ├── roles.ts          # Role definitions
│   ├── http.ts           # HTTP status codes
│   └── messages.ts       # Error/success messages
```

#### 1.2 Create Shared Types
```
src/
├── types/
│   ├── index.ts          # Re-exports
│   ├── api.ts            # API-related types
│   ├── business.ts       # Business logic types
│   └── utils.ts          # Utility types
```

#### 1.3 Reorganize Utilities
```
src/
├── lib/
│   ├── utils/            # Generic utilities
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   └── date.ts
│   ├── tenant/           # Tenant-specific
│   │   ├── access.ts
│   │   ├── hooks.ts
│   │   └── utils.ts
│   ├── payload/          # Payload helpers
│   │   ├── queries.ts
│   │   └── hooks.ts
│   └── error/            # Error handling
│       ├── handler.ts
│       └── types.ts
```

### Phase 2: Collection Patterns (DRY)

#### 2.1 Create Field Factories
```
src/
├── fields/
│   ├── factories/
│   │   ├── tenantField.ts
│   │   ├── timestampFields.ts
│   │   ├── statusField.ts
│   │   └── relationshipField.ts
│   ├── common/
│   │   ├── index.ts
│   │   ├── order.ts
│   │   └── product.ts
│   └── types.ts
```

#### 2.2 Create Reusable Hooks
```
src/
├── hooks/
│   ├── collections/
│   │   ├── autoAssignTenant.ts
│   │   ├── validatePayments.ts
│   │   └── updateStock.ts
│   └── types.ts
```

#### 2.3 Standardize Access Control
```
src/
├── access/
│   ├── factories/
│   │   ├── tenantAccess.ts
│   │   ├── roleAccess.ts
│   │   └── compositeAccess.ts
│   ├── presets/
│   │   ├── index.ts
│   │   ├── ownerOnly.ts
│   │   └── adminOrOwner.ts
│   └── types.ts
```

### Phase 3: Collection Refactoring

#### 3.1 Updated Collection Pattern
```typescript
// Before: 200+ lines with duplicated logic
export const Orders: CollectionConfig = { 
  // ... lots of duplicated tenant logic
}

// After: Clean, composed configuration
export const Orders: CollectionConfig = createCollection({
  slug: 'orders',
  fields: [/* business fields only */],
  hooks: [/* specific hooks */],
  // Tenant isolation, common fields auto-injected
})
```

### Phase 4: Component Architecture

#### 4.1 Component Organization
```
src/
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── common/           # Shared domain components
│   │   ├── forms/
│   │   ├── tables/
│   │   └── feedback/
│   ├── features/         # Feature-specific
│   │   ├── orders/
│   │   ├── customers/
│   │   └── inventory/
│   └── layouts/
│       ├── dashboard/
│       └── auth/
```

---

## Implementation Priority

### High Priority (Foundation)
1. ✅ Constants and enums
2. ✅ Access control factories
3. ✅ Field factories
4. ✅ Tenant hook factory

### Medium Priority (Collections)
5. ✅ Refactor Users collection
6. ✅ Refactor Orders collection
7. ✅ Refactor Products collection
8. ✅ Refactor remaining collections

### Low Priority (Polish)
9. ✅ Component reorganization
10. ✅ Add comprehensive tests
11. ✅ Documentation updates

---

## Best Practices Applied

### 1. **DRY (Don't Repeat Yourself)**
- Single source of truth for constants
- Reusable field factories
- Shared hook patterns

### 2. **Single Responsibility Principle**
- Each function/class has one reason to change
- Separated concerns: access, hooks, fields

### 3. **Open/Closed Principle**
- Extensible factories
- Plugin-like hook system

### 4. **Dependency Inversion**
- Depend on abstractions (types/interfaces)
- Factory pattern for configuration

### 5. **Type Safety**
- Strict TypeScript throughout
- Leverage Payload's type generation
- No `any` types

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Constants | `SCREAMING_SNAKE_CASE` | `USER_ROLES` |
| Functions | `camelCase` | `createTenantField` |
| Components | `PascalCase` | `OrderForm` |
| Types/Interfaces | `PascalCase` with type suffix | `OrderConfig` |
| Factories | `create` prefix | `createCollection` |

---

## Migration Strategy

### Step 1: Create New Structure (Side-by-side)
- Keep existing code functional
- Create new structure in parallel

### Step 2: Gradual Migration
- Migrate one collection at a time
- Update imports incrementally

### Step 3: Verification
- Run type checks: `tsc --noEmit`
- Run tests: `pnpm test`
- Manual smoke testing

### Step 4: Cleanup
- Remove old patterns
- Final verification
