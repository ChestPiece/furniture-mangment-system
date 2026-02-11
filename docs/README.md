# Furniture Management System - Documentation

Welcome to the Furniture Management System documentation. This folder contains comprehensive guides for working with the application.

## 📚 Documentation Structure

```
docs/
├── README.md                 # This file
├── getting-started/          # Onboarding guides
│   ├── installation.md
│   ├── environment-setup.md
│   └── development-workflow.md
├── payload/                  # Payload CMS documentation
│   ├── README.md            # Overview
│   ├── collections.md       # Collection configuration
│   ├── fields.md            # Field types guide
│   ├── access-control.md    # Security & permissions
│   ├── hooks.md             # Lifecycle hooks
│   ├── queries.md           # Database operations
│   ├── authentication.md    # Auth configuration
│   ├── admin-ui.md          # Custom UI components
│   └── best-practices.md    # Recommended patterns
├── architecture/            # System architecture
│   ├── overview.md
│   ├── multi-tenancy.md
│   └── security-model.md
├── api/                     # API documentation
│   ├── rest-api.md
│   └── server-actions.md
├── frontend/                # Frontend guides
│   ├── components.md
│   ├── styling.md
│   └── forms.md
└── deployment/              # Deployment guides
    ├── vercel.md
    ├── docker.md
    └── production-checklist.md
```

## 🚀 Quick Start

1. **New to the project?** Start with [Getting Started](./getting-started/installation.md)
2. **Working with Payload?** Check [Payload CMS Docs](./payload/README.md)
3. **Need API reference?** See [API Documentation](./api/rest-api.md)
4. **Deploying?** Follow [Deployment Guides](./deployment/vercel.md)

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 + React 19 |
| CMS | PayloadCMS 3.74 |
| Database | MongoDB |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI + @payloadcms/ui |
| Forms | React Hook Form + Zod |
| Testing | Vitest + Playwright |

## 📖 Key Concepts

### Multi-Tenancy
The system uses a multi-tenant architecture where each furniture shop (tenant) operates in complete data isolation. All queries are automatically scoped by `tenant` field.

### Role-Based Access Control
- **Admin**: Full system access
- **Owner**: Full tenant access
- **Staff**: Limited operational access

### Order Workflow
```
Draft → Pending → In Progress → Quality Check → Ready → Delivered
```

## 🔗 External Resources

- [Payload CMS Docs](https://payloadcms.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Project README](../README.md)

---

**Need Help?** Check the [FAQ](./getting-started/faq.md) or refer to specific documentation sections.
