# Product Requirements Document (PRD)

## Furniture Management System (FMS)

**Version:** 1.0  
**Date:** February 2026  
**Status:** Production Ready  

---

## 1. Executive Summary

The Furniture Management System (FMS) is a comprehensive, multi-tenant SaaS platform designed specifically for furniture shops, carpentry businesses, and interior design firms. The system provides end-to-end business operations management including order processing, inventory control, production tracking, delivery management, and financial reporting.

### 1.1 Business Objectives

| Objective | Description | Success Metric |
|-----------|-------------|----------------|
| Streamline Operations | Centralize all business processes in one platform | 50% reduction in manual paperwork |
| Multi-Tenancy | Support multiple furniture shops on a single instance | 99.9% data isolation compliance |
| Real-time Analytics | Provide actionable business insights | < 2s dashboard load time |
| Payment Tracking | Monitor receivables and reduce payment delays | 30% reduction in outstanding payments |
| Production Efficiency | Track manufacturing progress from order to delivery | 25% improvement in on-time delivery |

### 1.2 Target Users

| User Type | Role | Primary Activities |
|-----------|------|-------------------|
| God Admin | System Super Administrator | Platform management, tenant onboarding, system configuration |
| Shop Owner | Business Owner | Order management, expense tracking, staff management, reporting |
| Shop Staff | Employee | Order creation, customer management, production updates |
| Production Worker | Manufacturing Staff | Job card completion, production status updates |
| Delivery Driver | Logistics Staff | Delivery status updates, proof of delivery |

---

## 2. System Architecture

### 2.1 Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Next.js 15 │  │  Tailwind 4 │  │  Radix UI + Lucide      │  │
│  │  (React 19) │  │   (CSS)     │  │  (Components/Icons)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                        APPLICATION LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  PayloadCMS │  │   Middleware│  │  Server Actions         │  │
│  │    3.74     │  │(Auth/Rate)  │  │  (Form Handling)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                         DATA LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   MongoDB   │  │    Sharp    │  │  JWT (jose)             │  │
│  │  (Mongoose) │  │(Image Proc) │  │  (Auth Tokens)          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Multi-Tenant Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    APPLICATION INSTANCE                      │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │  Tenant A   │    │  Tenant B   │    │  Tenant C   │      │
│  │  "WoodCraft │    │  "Royal     │    │  "Modern    │      │
│  │   Furniture"│    │   Interiors"│    │   Living"   │      │
│  │             │    │             │    │             │      │
│  │ • Orders    │    │ • Orders    │    │ • Orders    │      │
│  │ • Customers │    │ • Customers │    │ • Customers │      │
│  │ • Products  │    │ • Products  │    │ • Products  │      │
│  │ • Staff     │    │ • Staff     │    │ • Staff     │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│                                                              │
│  Shared Infrastructure: Auth, Media Storage, Analytics       │
└──────────────────────────────────────────────────────────────┘
```

### 2.3 Security Model

| Layer | Implementation | Details |
|-------|---------------|---------|
| Authentication | JWT + HTTP-only Cookies | SHA-256 hashed tokens, 24h expiry |
| Authorization | Role-Based Access Control | Admin / Owner / Staff hierarchy |
| Data Isolation | Tenant Filtering | Automatic query scoping by tenant ID |
| API Protection | Rate Limiting | 100 requests/minute per IP |
| Admin Panel | Hidden from Non-Admins | 404 rewrite for unauthorized access |

---

## 3. Functional Requirements

### 3.1 User Management & Authentication

#### 3.1.1 User Roles

| Role | Permissions | Access Scope |
|------|-------------|--------------|
| **Admin** | Full system access | All tenants, admin panel |
| **Owner** | Business management | Own tenant only, dashboard |
| **Staff** | Operational tasks | Own tenant only, limited dashboard |

#### 3.1.2 Authentication Flow

```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│  Login  │────▶│ Validate │────▶│  JWT    │────▶│ Redirect │
│  Page   │     │ Credentials     │  Token  │     │ Dashboard│
└─────────┘     └──────────┘     └─────────┘     └──────────┘
      │                                           │
      │                                           ▼
      │                                    ┌──────────┐
      │                                    │ Dashboard│
      │                                    │  Layout  │
      │                                    └──────────┘
      │                                           │
      ▼                                           ▼
┌─────────┐     ┌──────────┐            ┌──────────────┐
│ Payload │◀────│  Cookie  │            │ Role-Based   │
│  Auth   │     │  Store   │            │ Navigation   │
└─────────┘     └──────────┘            └──────────────┘
```

### 3.2 Core Modules

#### 3.2.1 Dashboard Module

**Purpose:** Provide at-a-glance business overview with real-time metrics.

**Features:**

| Feature | Description | Priority |
|---------|-------------|----------|
| Today's Sales | Animated counter showing daily revenue | High |
| Active Orders | Count of pending and in-progress orders | High |
| Pending Payments | Orders with outstanding balances | High |
| Recent Orders Table | Last 5 orders with customer info | High |
| Quick Actions | Shortcuts to create order/customer | Medium |
| Trend Indicators | Day-over-day comparison | Medium |

**UI Components:**
- `StatsCard` - Metric display with icons and trends
- `AnimatedCounter` - Number animation for metrics
- `RecentOrdersTable` - Order summary table
- `EmptyState` - Guidance for new users

#### 3.2.2 Order Management Module

**Purpose:** Complete order lifecycle management from creation to delivery.

**Order Types:**

| Type | Description | Workflow |
|------|-------------|----------|
| Ready-Made | Existing inventory items | Order → Payment → Delivery |
| Custom | Made-to-order furniture | Order → Production → Payment → Delivery |

**Order Status Workflow:**

```
┌─────────┐    ┌─────────────┐    ┌───────────┐    ┌───────────┐
│  Draft  │───▶│   Pending   │───▶│ In Progress│───▶│ Delivered │
└─────────┘    └─────────────┘    └───────────┘    └───────────┘
                      │
                      ▼
               ┌─────────────┐
               │  Cancelled  │
               └─────────────┘
```

**Payment Tracking:**

| Field | Type | Validation |
|-------|------|------------|
| Total Amount | Number | Required, ≥ 0 |
| Advance Paid | Number | Required, ≤ Total |
| Remaining Paid | Number | ≤ (Total - Advance) |
| Due Amount | Virtual | Auto-calculated |
| Payment Status | Select | unpaid / partial / paid |

**Order Items Structure:**
```typescript
{
  product: Relationship<Product>,
  variant: string,           // SKU or variant name
  quantity: number,          // ≥ 1
  price: number,             // Unit price
  customizations: JSON,      // Dynamic custom fields
  productionStatus: Select   // pending / in_production / ready / delivered
}
```

#### 3.2.3 Customer Management Module

**Purpose:** Maintain customer database and order history.

**Customer Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | Text | Yes | Non-empty |
| Phone | Text | Yes | `/^\+?[\d\s-()]+$/` |
| Email | Email | No | Valid email format |
| Tenant | Relationship | Yes | Auto-assigned |

**Features:**
- Quick customer creation from order flow
- Customer order history view
- Phone number validation with international support
- Duplicate detection by phone

#### 3.2.4 Product & Inventory Module

**Purpose:** Manage product catalog, stock levels, and warehouse distribution.

**Product Types:**

| Type | Description | Use Case |
|------|-------------|----------|
| Finished Good | Sellable furniture items | Sofas, tables, chairs |
| Raw Material | Manufacturing inputs | Wood, fabric, hardware |
| Service | Non-physical offerings | Assembly, design consultation |

**Product Structure:**

```typescript
{
  name: string,
  slug: string,
  sku: string,              // Unique identifier
  type: 'finished_good' | 'raw_material' | 'service',
  price: number,            // Selling price
  cost: number,             // Cost price
  unit: string,             // pcs, feet, kg, etc.
  stock: number,            // Total across warehouses
  warehouseStock: [{       // Per-warehouse breakdown
    warehouse: Warehouse,
    quantity: number
  }],
  variants: [{              // Product variations
    name: string,
    sku: string,
    price: number,
    stock: number
  }],
  bom: [{                   // Bill of Materials (for finished goods)
    material: Product,      // Raw material reference
    quantity: number        // Required quantity
  }]
}
```

**Stock Transaction Types:**

| Type | Description | Impact |
|------|-------------|--------|
| Purchase Receive | Stock from supplier | +Stock |
| Order Deduction | Stock allocated to order | -Stock |
| Manual Adjustment | Correction entry | ±Stock |
| Return | Customer return | +Stock |
| Waste | Damaged/unusable | -Stock |

**Inventory Flow:**

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Purchase Order │────▶│  Stock Receive  │────▶│  Warehouse      │
│  (Supplier)     │     │  (Transaction)  │     │  Stock Update   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
┌─────────────────┐     ┌─────────────────┐              │
│  Order Delivery │◀────│  Stock Deduction│◀─────────────┘
│  (Customer)     │     │  (Transaction)  │
└─────────────────┘     └─────────────────┘
```

#### 3.2.5 Production Management Module

**Purpose:** Track custom furniture manufacturing from order to completion.

**Production Run:**

| Field | Type | Description |
|-------|------|-------------|
| Order | Relationship | Linked customer order |
| Order Item | Text | Specific item ID from order |
| Product | Relationship | Product being manufactured |
| Status | Select | planned → in_progress → quality_check → completed |
| Stages | Array | Manufacturing steps with status |

**Production Stages:**

| Stage | Description | Typical Duration |
|-------|-------------|------------------|
| Cutting | Raw material cutting | 1-2 days |
| Assembly | Frame construction | 2-3 days |
| Sanding | Surface preparation | 1 day |
| Upholstery | Fabric/leather work | 2-3 days |
| QC | Quality inspection | 1 day |

**Job Cards:**

| Field | Type | Description |
|-------|------|-------------|
| Production Run | Relationship | Parent production run |
| Stage | Text | Manufacturing stage |
| Worker | Relationship | Assigned staff |
| Status | Select | assigned → in_progress → done |
| Notes | Textarea | Work notes |

**Production Workflow:**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Planned   │───▶│  Cutting    │───▶│  Assembly   │───▶│   Sanding   │
│  (Created)  │    │  (Job Card) │    │  (Job Card) │    │  (Job Card) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
                       ┌─────────────┐                        │
                       │  Completed  │◀───────────────────────┘
                       │  (Ready)    │
                       └─────────────┘
```

#### 3.2.6 Delivery Management Module

**Purpose:** Coordinate and track order deliveries.

**Delivery Fields:**

| Field | Type | Description |
|-------|------|-------------|
| Order | Relationship | Linked order |
| Status | Select | pending → in_transit → delivered / failed |
| Scheduled Date | Date | Planned delivery date |
| Driver | Relationship | Assigned delivery person |
| Proof of Delivery | Upload | Photo/signature |
| Notes | Textarea | Delivery notes |

#### 3.2.7 Financial Management Module

**Purpose:** Track payments, expenses, and financial reporting.

**Payments:**

| Field | Type | Description |
|-------|------|-------------|
| Order | Relationship | Linked order |
| Amount | Number | Payment amount |
| Method | Select | cash / jazzcash / easypaisa / bank_transfer |
| Reference | Text | Transaction ID |
| Date | Date | Payment date |
| Status | Select | pending / completed / failed |

**Expenses (Owner Only):**

| Field | Type | Description |
|-------|------|-------------|
| Title | Text | Expense description |
| Amount | Number | Expense amount |
| Date | Date | Expense date |
| Description | Textarea | Additional details |

**Financial Reports:**

| Report | Description | Access |
|--------|-------------|--------|
| Revenue Summary | Total sales, paid, due | Owner/Staff |
| Expense Report | Expense breakdown | Owner |
| Profit/Loss | Revenue - Expenses | Owner |
| Pending Payments | Outstanding receivables | Owner/Staff |

#### 3.2.8 Supplier & Purchase Order Module

**Purpose:** Manage suppliers and raw material procurement.

**Supplier Fields:**

| Field | Type | Description |
|-------|------|-------------|
| Name | Text | Company name |
| Contact Person | Text | Primary contact |
| Phone | Text | Contact number |
| Email | Email | Contact email |
| Address | Textarea | Physical address |
| Payment Terms | Text | Net 30, COD, etc. |

**Purchase Order:**

| Field | Type | Description |
|-------|------|-------------|
| Supplier | Relationship | Vendor |
| Status | Select | draft → ordered → received → cancelled |
| Items | Array | Products with quantity and cost |
| Total Cost | Number | Auto-calculated |
| Expected Delivery | Date | ETA |

### 3.3 Configuration Module

**Purpose:** Tenant-specific customization settings.

**Configuration Fields:**

| Field | Type | Description |
|-------|------|-------------|
| Tenant | Relationship | One config per tenant |
| Invoice Footer | Textarea | Custom invoice text |
| Measurement Units | Array | Custom units (feet, inches, etc.) |
| Product Categories | Array | Business-specific categories |
| Custom Order Fields | JSON | Dynamic form fields |

**Custom Order Fields Example:**

```json
[
  {
    "name": "woodType",
    "label": "Wood Type",
    "type": "select",
    "options": ["Sheesham", "Oak", "Pine"]
  },
  {
    "name": "dimensions",
    "label": "Dimensions (LxWxH)",
    "type": "text"
  },
  {
    "name": "fabricColor",
    "label": "Fabric Color",
    "type": "color"
  }
]
```

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dashboard Load | < 2 seconds | Time to Interactive |
| API Response | < 500ms | Server response time |
| Database Query | < 100ms | Query execution time |
| Image Optimization | < 1s | Sharp processing time |
| Concurrent Users | 100+ | Simultaneous active sessions |

### 4.2 Security

| Requirement | Implementation |
|-------------|----------------|
| Password Hashing | bcrypt (auto by Payload) |
| JWT Secret | SHA-256 hashed |
| Cookie Security | HTTP-only, Secure, SameSite |
| Rate Limiting | 100 req/min per IP |
| SQL Injection | Prevented by Mongoose |
| XSS Protection | React auto-escaping |
| CSRF Protection | Payload built-in |

### 4.3 Availability

| Aspect | Target |
|--------|--------|
| Uptime | 99.9% |
| Recovery Time | < 1 hour |
| Backup Frequency | Daily |
| Data Retention | 7 years |

### 4.4 Scalability

| Component | Strategy |
|-----------|----------|
| Application | Horizontal scaling (stateless) |
| Database | MongoDB replica sets |
| File Storage | Cloud storage (S3-compatible) |
| Caching | Redis for rate limiting |

---

## 5. User Interface Design

### 5.1 Design System

**Color Palette:**

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#3b82f6` | Buttons, links, active states |
| Success | `#22c55e` | Paid status, delivered orders |
| Warning | `#eab308` | Pending orders, alerts |
| Destructive | `#ef4444` | Due amounts, delete actions |
| Info | `#3b82f6` | In-progress orders |
| Background | `#ffffff` | Page background |
| Card | `#ffffff` | Component backgrounds |
| Muted | `#f3f4f6` | Secondary backgrounds |

**Typography:**

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | System UI | 2.25rem | 700 |
| H2 | System UI | 1.5rem | 600 |
| H3 | System UI | 1.25rem | 600 |
| Body | System UI | 1rem | 400 |
| Small | System UI | 0.875rem | 400 |
| Mono | Monospace | 0.875rem | 500 |

### 5.2 Navigation Structure

```
Dashboard (/dashboard)
├── Analytics (/dashboard/analytics)
├── Inventory (/dashboard/products)
│   └── New Product (/dashboard/products/new)
├── Orders (/dashboard/orders)
│   └── New Order (/dashboard/orders/new)
├── Production (/dashboard/production)
│   └── New Production Run (/dashboard/production/new)
├── Deliveries (/dashboard/deliveries)
├── Customers (/dashboard/customers)
│   └── New Customer (/dashboard/customers/new)
├── Finance (/dashboard/finance)
└── Settings (/dashboard/settings)
```

### 5.3 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, drawer nav |
| Tablet | 640-1024px | Two columns, collapsible sidebar |
| Desktop | > 1024px | Full sidebar, multi-column |

---

## 6. API Specifications

### 6.1 REST Endpoints

#### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/login` | User authentication |
| POST | `/api/users/logout` | Session termination |
| GET | `/api/users/me` | Current user info |

#### Orders

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/orders` | Tenant-filtered | List orders |
| POST | `/api/orders` | Authenticated | Create order |
| GET | `/api/orders/:id` | Tenant-filtered | Get order details |
| PATCH | `/api/orders/:id` | Tenant-filtered | Update order |
| DELETE | `/api/orders/:id` | Tenant-filtered | Delete order |

#### Reports

| Method | Endpoint | Parameters | Description |
|--------|----------|------------|-------------|
| GET | `/api/reports/daily-sales` | `date` | Daily revenue |
| GET | `/api/reports/pending-payments` | - | Outstanding amounts |

### 6.2 Response Format

```typescript
// Success Response
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

// Error Response
{
  "errors": [
    {
      "message": "Validation failed",
      "field": "totalAmount"
    }
  ]
}
```

---

## 7. Data Model

### 7.1 Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Tenants    │────▶│    Users     │◀────│   Customers  │
│  (Shops)     │     │   (Auth)     │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
       │                                           │
       │     ┌──────────────┐     ┌──────────────┐ │
       │     │   Products   │     │    Orders    │◀┘
       │     │              │     │              │
       │     │ • Finished   │     │ • Items[]    │
       │     │ • Raw Mat.   │     │ • Payments   │
       │     │ • BOM        │     │ • Status     │
       │     └──────────────┘     └──────┬───────┘
       │                                 │
       │     ┌──────────────┐     ┌──────┴───────┐
       │     │  Warehouses  │◀────│ Stock Txns   │
       │     │              │     │              │
       │     └──────────────┘     └──────────────┘
       │
       │     ┌──────────────┐     ┌──────────────┐
       └──▶  │   Suppliers  │◀────│ Purchase Ord │
             │              │     │              │
             └──────────────┘     └──────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ProductionRuns│◀────│   JobCards   │     │  Deliveries  │
│              │     │              │     │              │
│ • Stages[]   │     │ • Worker     │     │ • Driver     │
│ • Status     │     │ • Status     │     │ • POD        │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 7.2 Key Indexes

| Collection | Field | Type | Purpose |
|------------|-------|------|---------|
| Orders | `tenant` | Single | Tenant filtering |
| Orders | `status` | Single | Status queries |
| Orders | `orderDate` | Single | Date range queries |
| Customers | `tenant` | Single | Tenant filtering |
| Customers | `phone` | Single | Duplicate detection |
| Products | `tenant` | Single | Tenant filtering |
| Products | `sku` | Unique | SKU uniqueness |
| StockTransactions | `tenant` | Single | Tenant filtering |
| StockTransactions | `product` | Single | Stock recalculation |

---

## 8. Testing Strategy

### 8.1 Test Coverage

| Category | Framework | Coverage Target |
|----------|-----------|-----------------|
| Unit Tests | Vitest | 80%+ |
| Integration Tests | Vitest | 70%+ |
| E2E Tests | Playwright | Critical paths |

### 8.2 Critical Test Scenarios

| Scenario | Type | Priority |
|----------|------|----------|
| Tenant data isolation | Integration | Critical |
| Order payment validation | Unit | Critical |
| User authentication | E2E | Critical |
| Role-based access control | Integration | High |
| Stock recalculation | Unit | High |
| Production workflow | E2E | Medium |

---

## 9. Deployment & Operations

### 9.1 Environment Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | MongoDB connection |
| `PAYLOAD_SECRET` | Yes | - | JWT signing secret |
| `NEXT_PUBLIC_SERVER_URL` | Yes | - | App URL |
| `GOD_ADMIN_EMAIL` | Yes | - | Protected admin |
| `GOD_ADMIN_PASSWORD` | Yes | - | Admin password |
| `RATE_LIMIT_WINDOW_MS` | No | 60000 | Rate limit window |
| `MAX_REQUESTS_PER_WINDOW` | No | 100 | Request limit |

### 9.2 Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB connection tested
- [ ] God Admin credentials set
- [ ] SSL certificate installed
- [ ] Rate limiting enabled
- [ ] Backup schedule configured
- [ ] Monitoring setup (Sentry/LogRocket)
- [ ] CDN configured for media

### 9.3 Monitoring

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| Error Rate | Sentry | > 1% |
| Response Time | Vercel Analytics | > 2s |
| Database Connections | MongoDB Atlas | > 80% |
| Disk Usage | MongoDB Atlas | > 85% |

---

## 10. Future Roadmap

### 10.1 Phase 2 Features

| Feature | Description | ETA |
|---------|-------------|-----|
| Mobile App | React Native companion app | Q2 2026 |
| Advanced Analytics | Predictive sales forecasting | Q2 2026 |
| Multi-Currency | Support for international shops | Q3 2026 |
| API Webhooks | Third-party integrations | Q3 2026 |

### 10.2 Phase 3 Features

| Feature | Description | ETA |
|---------|-------------|-----|
| AI Recommendations | Smart inventory suggestions | Q4 2026 |
| Customer Portal | Self-service order tracking | Q4 2026 |
| Barcode Scanning | Inventory management | Q1 2027 |
| Multi-Location | Single tenant, multiple shops | Q1 2027 |

---

## 11. Appendix

### 11.1 Glossary

| Term | Definition |
|------|------------|
| BOM | Bill of Materials - List of raw materials needed |
| Job Card | Work assignment for production workers |
| Multi-tenancy | Single application serving multiple isolated organizations |
| Production Run | Manufacturing batch for a specific order |
| SKU | Stock Keeping Unit - Unique product identifier |
| Tenant | A furniture shop/business using the system |

### 11.2 Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-11 | Initial PRD creation |

---

**End of Document**
