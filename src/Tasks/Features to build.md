Context:
You are an AI assistant tasked with building a multi-tenant, enterprise-grade Furniture POS system for small-to-medium furniture shops in Pakistan. The system must handle orders, inventory, production, payments, suppliers, customers, deliveries, and reports. Each shop is a tenant with complete data isolation. The system will be used on desktop, tablet, and mobile, with responsive design and modern UX.

Technical Stack:

Frontend: Next.js, React, Tailwind CSS, Radix UI, Lucide icons, React Hook Form + Zod

Backend: PayloadCMS (headless CMS), Node.js, TypeScript

Database: MongoDB

Authentication: JWT token-based, HTTP-only cookies

Notifications: Toasts (Sonner)

Animations: Tailwind CSS + Framer Motion if needed

Containerization: Docker optional

Local Pakistan integrations: JazzCash, Easypaisa, bank transfers

System Modules & Features
1. Multi-Tenancy

Each shop is a tenant; data must be fully isolated.

Custom branding: logos, colors, and invoice footers per tenant.

Tenant-level configuration: custom order fields, product categories, measurement units.

Admin vs Owner vs Staff roles:

Admin (global): full access across tenants.

Owner (tenant): full access within shop, cannot create tenants.

Staff: limited access to orders and customers only.

2. Inventory & Product Management

Products must support variants and SKUs.

Bill of Materials (BOM) for custom furniture (materials, quantities).

Stock tracking:

Incoming stock from suppliers

Consumption during production

Returns and wastage

Low-stock alerts with notifications.

Multi-warehouse support.

Bulk import/export for products and stock.

3. Order & Production Workflow

Orders can be ready-made or custom.

Payment tracking: advance, partial, installment, remaining, due amounts.

Cannot deliver orders with outstanding balance.

Custom fields per tenant (e.g., wood type, fabric, dimensions).

Production stages: Cutting → Assembly → Sanding → Upholstery → QC → Delivery

Job cards: assign workers, log hours, track stage completion.

Auto-deduct materials from inventory as production progresses.

4. Customer Management / CRM

Customer profiles: name, phone, email, order history.

Loyalty points and repeat customer tracking.

Follow-up reminders via WhatsApp/SMS (delivery, payments, promotions).

Customer segmentation: VIP, frequent buyers, location-based.

Quick customer creation inline during order creation.

5. Supplier & Purchase Management

Supplier database: contact info, payment terms, delivery history.

Purchase orders: create, approve, track deliveries.

Track costs per supplier, item, and order.

Integration with inventory: incoming stock updates automatically.

6. Delivery & Logistics

Delivery scheduling: assign drivers, date/time, track status.

Status tracking: pending, in-transit, delivered.

Proof of delivery: photo or signature capture.

Optional: simple map integration for route visualization.

7. Payments & Accounting

Supports cash, card, bank transfer, and local gateways (JazzCash, Easypaisa).

Partial payments per order item.

Refund and cancellation handling.

Automated due reminders via notifications/WhatsApp.

Simple profit calculation: total revenue - cost of materials and expenses.

8. Reporting & Analytics

Revenue, profit per order, expenses, and cash flow.

Order statistics by type, status, and time period.

Inventory aging: slow-moving vs fast-moving products.

Employee performance metrics.

Export reports to PDF/Excel.

9. Dashboard & UX

Role-based dashboards: owner sees revenue & production stats, staff sees orders and tasks.

Real-time counters, toast notifications, skeleton loaders.

Mobile-first responsive design.

Barcode / QR scanning support for products and orders.

Offline mode with auto-sync when internet is restored.

10. Security & Access Control

JWT-based authentication with HTTP-only cookies.

Role-based access control enforced on frontend and backend.

Tenant isolation in all queries.

Rate limiting for API requests.

Audit logs for all operations.

11. Database Structure

Tenants: Shops, branding, configuration

Users: Admin/Owner/Staff, roles, tenant relation

Products: Variants, BOM, stock, warehouse

Orders: Customer, type, stage, payment, production, custom fields

Customers: Profile, order history, loyalty points

Suppliers: Contact, POs, transaction history

Expenses: Title, amount, date, description, tenant

PurchaseOrders: Supplier, items, status, delivery date

Deliveries: Driver, order, status, proof

Configurations: Custom fields, invoice footer, units, categories

Media: Images/documents, tenant-isolated

12. APIs

RESTful endpoints for all modules: tenants, users, products, orders, customers, suppliers, expenses, POs, deliveries, reports.

Automatic tenant filtering in all requests.

Full CRUD with validation and business rules.

13. Pakistan Market Adaptations

Support local currencies and measurement units (feet, inches, meters).

Payment integration: JazzCash, Easypaisa, bank transfers.

Invoice/receipt templates suitable for local print formats.

Language: English by default, optional Urdu support.

14. Developer Requirements

TypeScript + Next.js 15+, PayloadCMS 3.x

Tailwind CSS + Radix UI components

MongoDB database with indexes for tenant, orders, customers

Responsive design and smooth animations

Modular, maintainable code for multi-tenant SaaS

Deliverable:
Build a full-featured, production-ready Furniture POS that can scale to multiple tenants, handle complex furniture workflows, track inventory and production, integrate local payment gateways, and provide actionable reports and CRM functionality. Ensure the frontend, backend, and database models are complete and ready for testing.