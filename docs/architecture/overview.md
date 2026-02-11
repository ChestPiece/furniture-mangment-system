# Architecture Overview

High-level architecture of the Furniture Management System.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │
│  │   Browser   │  │   Mobile    │  │        Admin Panel          │  │
│  │  (Dashboard)│  │  (Future)   │  │       (/admin)              │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     Next.js 15 App                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │    │
│  │  │  (frontend)  │  │  (payload)   │  │      /api        │  │    │
│  │  │   Routes     │  │   Admin UI   │  │    Endpoints     │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    PayloadCMS 3.74                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │    │
│  │  │  Collections │  │    Hooks     │  │  Access Control  │  │    │
│  │  │   & Fields   │  │              │  │                  │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │     MongoDB     │  │      Media      │  │       Cache         │  │
│  │    (Mongoose)   │  │  (Local/S3/...) │  │   (Redis - Future)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Multi-Tenant Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     APPLICATION INSTANCE                             │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  Tenant A    │  │  Tenant B    │  │  Tenant C    │               │
│  │ "WoodCraft"  │  │ "Royal Int." │  │ "Modern L."  │               │
│  │              │  │              │  │              │               │
│  │  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │               │
│  │  │ Orders │  │  │  │ Orders │  │  │  │ Orders │  │               │
│  │  │Users   │  │  │  │Users   │  │  │  │Users   │  │               │
│  │  │Products│  │  │  │Products│  │  │  │Products│  │               │
│  │  │ etc.   │  │  │  │ etc.   │  │  │  │ etc.   │  │               │
│  │  └────────┘  │  │  └────────┘  │  │  └────────┘  │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                      │
│  Shared: Auth, Config, Media Storage                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Request Flow

```
┌─────────┐     ┌────────────┐     ┌─────────────┐     ┌─────────────┐
│ Request │────▶│ Middleware │────▶│    Auth     │────▶│   Access    │
│         │     │            │     │   Check     │     │   Control   │
└─────────┘     └────────────┘     └─────────────┘     └──────┬──────┘
                                                              │
                                    ┌─────────────────────────┘
                                    ▼
                           ┌─────────────────┐
                           │  Payload Local  │
                           │      API        │
                           └────────┬────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              ┌─────────┐     ┌─────────┐     ┌─────────┐
              │  Hooks  │     │   DB    │     │  After  │
              │ before  │     │ Query   │     │  Hooks  │
              └─────────┘     └─────────┘     └─────────┘
```

## Security Layers

1. **Middleware Layer** - Rate limiting, route protection
2. **Authentication Layer** - JWT validation, session management
3. **Access Control Layer** - Role-based permissions, tenant isolation
4. **Database Layer** - Query scoping, field-level access

## Module Organization

```
src/
├── access/           # Access control functions
├── actions/          # Server actions
├── app/             # Next.js routes
│   ├── (auth)/      # Auth routes
│   ├── (frontend)/  # Dashboard routes
│   ├── (payload)/   # Admin panel
│   └── api/         # API routes
├── collections/      # Payload collections
├── components/       # React components
│   ├── dashboard/   # Dashboard components
│   ├── layout/      # Layout components
│   └── ui/          # UI components
├── hooks/            # Shared hooks
├── lib/              # Utilities
└── middleware.ts     # Next.js middleware
```

## Data Flow Example: Creating an Order

```
1. User submits form
   ↓
2. Server Action validates (Zod)
   ↓
3. Payload Local API called
   ↓
4. beforeValidate hook runs
   ↓
5. beforeChange hook assigns tenant
   ↓
6. Access control validates permissions
   ↓
7. Database insert
   ↓
8. afterChange hook updates related data
   ↓
9. Response returned to client
```

## Related Documentation

- [Multi-Tenancy](./multi-tenancy.md)
- [Security Model](./security-model.md)
