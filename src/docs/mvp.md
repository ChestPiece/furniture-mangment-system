Furniture Shop Management System (Multi-Tenant) – MVP Specification

1. Objective

Develop a web-based multi-tenant management system for small furniture shops to digitize manual workflows. The MVP enables order management, payment tracking, customer handling, basic reporting, and per-shop configuration.

2. Target Users

Primary: Shop owners (2–10 workers, non-technical)
Secondary: Shop staff responsible for order entry and payment tracking

3. Core Workflow (Mandatory)

Customer places an order (ready-made or custom).

Advance payment is recorded.

Order is produced/prepared.

Remaining payment is collected.

Order is marked as delivered.

Workflow is identical for all tenants. No variations are allowed in MVP.

4. Tenant Model

Each furniture shop is a tenant.

Data isolation: All collections must include tenantId. No cross-tenant data sharing.

One tenant represents exactly one shop.

5. Functional Requirements
   5.1 Authentication & Access

Users authenticate via Payload CMS auth.

Roles: owner, staff.

Each user belongs to exactly one tenant.

5.2 Customers

Create and view customers.

Fields: name, phone.

View order history per customer.

5.3 Orders

Create orders: ready-made or custom.

Required fields:

Customer

Order date

Delivery date (optional)

Total amount

Advance paid

Due amount (derived)

Status: pending, in_progress, delivered

Support custom fields via configuration.

5.4 Payments

Record advance at order creation.

Record remaining payment before delivery.

Only one remaining payment is allowed per order.

5.5 Expenses

Record basic expenses.

Fields: title, amount, date.

Used only for profit visibility.

5.6 Reports

Daily total sales.

Pending payments list.

6. Configuration & Branding

Per-tenant configuration (stored in database as JSON):

Shop name

Logo

Invoice text

Measurement units

Product categories

Custom fields for orders

White-labeling:

Logo and color theme per tenant

No logic differences; branding is cosmetic only

7. Data Model (High-Level)

All collections include tenantId: ObjectId.

Core Collections:

tenants

users

customers

orders

expenses

configurations

8. Technical Architecture

Frontend: Next.js with custom UI for shop users
Backend: Payload CMS (REST/GraphQL APIs)
Database: MongoDB (via Payload adapter)

9. Security & Data Integrity

Tenant isolation enforced at API level.

Users cannot access other tenants’ data.

Validation enforced at Payload schema level.

No direct database access from frontend.

10. MVP Success Criteria

Shop owner can manage orders without paper.

Advance and due payments are clear and accurate.

No cross-tenant data leakage occurs.

Single backend and database serve all tenants.

11. Excluded Features (Out of Scope for MVP)

Payroll, accounting, tax compliance

Advanced analytics, inventory optimization

Multi-branch shops

Mobile apps, external integrations (SMS/WhatsApp)

Multi-tenant user switching
