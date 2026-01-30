Product Name

Furniture Shop Management System (Multi-Tenant)

1. Objective

Build a web-based management system for small furniture shops to replace manual, paper-based workflows for:

Orders

Payments

Customers

Delivery tracking

The system must support multiple independent furniture shops (tenants) using a single codebase, with configurable branding and fields per shop.

2. Target Users
   Primary User

Small furniture shop owner

2–10 workers

Non-technical

Operates in a physical furniture market

Secondary User

Shop staff responsible for order entry and payment tracking

3. Non-Goals (Explicit Exclusions)

The following are NOT part of v1 (MVP) and must not be implemented:

Worker payroll

Accounting / tax compliance

Advanced analytics

Inventory optimization

Multi-branch shops

Mobile application

External integrations (SMS, WhatsApp, etc.)

4. Core Workflow (Authoritative)

Customer places an order (ready-made or custom)

Advance payment is recorded

Order is produced / prepared

Remaining payment is collected

Order is marked as delivered

This workflow is non-negotiable and identical for all shops.

5. Tenant Model (Critical Constraint)

Each furniture shop is a tenant

All data must be isolated by tenantId

No data is shared across tenants

A tenant represents exactly one shop

6. Functional Requirements (MVP)
   6.1 Authentication & Access

Users authenticate via Payload CMS auth

Each user belongs to exactly one tenant

Roles:

owner

staff

6.2 Customers

Create customer

View customer list

Store:

Name

Phone number

View customer order history

6.3 Orders

Create order

Order types:

Ready-made

Custom

Required fields:

Customer

Order date

Delivery date (optional)

Total amount

Advance paid

Due amount (derived)

Status (pending, in_progress, delivered)

Custom fields allowed (config-driven)

6.4 Payments

Record advance payment at order creation

Record remaining payment before delivery

Payment tracking is order-level only

Partial payments beyond advance + due are not supported in MVP

6.5 Expenses (Minimal)

Record expense

Fields:

Title

Amount

Date

Used only for basic profit visibility

6.6 Reports (Simple)

Daily total sales

Pending payments list

7. Configuration & Flexibility (Controlled)

Customization is allowed only via configuration, not code changes.

Allowed per-tenant configuration:

Shop name

Logo

Invoice text

Measurement units

Product categories

Custom fields for orders

All configurations must be:

Stored in database

JSON-structured

Read dynamically by UI

8. Branding (White-Labeling)

Each tenant has:

Logo

Color theme

No logic differences per tenant

Branding is cosmetic only

9. Data Model (High-Level)

All collections must include:

tenantId: ObjectId

Core Collections

tenants

users

customers

orders

expenses

configurations

10. Technical Architecture
    Frontend

Next.js

Custom UI for shop users

Backend

Payload CMS

REST or GraphQL APIs via Payload

Database

MongoDB (via Payload adapter)

11. Security & Data Integrity

Tenant isolation enforced at API level

Users cannot access data outside their tenant

Validation enforced at Payload schema level

No direct database access from frontend

12. MVP Success Criteria

The MVP is successful if:

A shop owner can manage orders daily without paper

Advance and due payments are always clear

No cross-tenant data leakage occurs

System runs with a single backend + database

13. Future Considerations (Not Implemented)

These are explicitly out of scope for MVP:

Inventory automation

Worker management

Analytics dashboards

Multi-tenant user switching

External integrations

14. Implementation Constraints (AI-Safety Rules)

No custom business logic per tenant

No schema divergence per shop

No dynamic code generation

All flexibility via configuration only

Core workflow must not be altered
