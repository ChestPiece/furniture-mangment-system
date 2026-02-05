# Furniture Management System

A comprehensive, multi-tenant furniture shop management system built with Next.js, PayloadCMS, and MongoDB. This enterprise-grade application enables furniture shop owners to manage orders, customers, expenses, and generate detailed reports with complete data isolation between tenants.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technical Stack](#technical-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Collections & Data Models](#collections--data-models)
- [User Roles & Permissions](#user-roles--permissions)
- [Security Features](#security-features)
- [Dashboard Features](#dashboard-features)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)

---

## 🎯 Overview

The Furniture Management System is a **multi-tenant SaaS application** designed to help furniture shop owners streamline their business operations. Each shop (tenant) operates in complete isolation with their own customers, orders, expenses, and configurations. The system provides real-time analytics, payment tracking, and customizable order fields to adapt to different business needs.

### Business Use Cases

- **Furniture Shops**: Manage custom and ready-made furniture orders
- **Carpentry Businesses**: Track custom orders with detailed measurements
- **Interior Design Firms**: Manage client orders and project expenses
- **Multi-location Furniture Chains**: Each location operates as a separate tenant

---

## ✨ Key Features

### 🏢 Multi-Tenancy

- **Complete Data Isolation**: Each shop's data is completely separated
- **Tenant-Specific Branding**: Custom logos and color themes per shop
- **Scalable Architecture**: Support for unlimited tenants
- **Tenant-Level Configuration**: Custom fields, categories, and settings per shop

### 📊 Order Management

- **Order Types**: Support for both ready-made and custom furniture orders
- **Payment Tracking**: Track advance payments, remaining payments, and due amounts
- **Status Workflow**: Pending → In Progress → Delivered
- **Custom Fields**: Define tenant-specific order fields (e.g., wood type, dimensions)
- **Delivery Date Tracking**: Monitor order timelines
- **Payment Validation**: Prevent marking orders as delivered with outstanding payments

### 👥 Customer Management

- **Customer Profiles**: Store name, phone, email, and order history
- **Phone Validation**: Flexible international phone number support
- **Tenant Isolation**: Customers belong to specific shops
- **Quick Customer Creation**: Add customers directly from order creation flow

### 💰 Expense Tracking

- **Expense Records**: Track business expenses with title, amount, date, and description
- **Owner-Only Access**: Only shop owners and admins can manage expenses
- **Financial Reports**: View expenses alongside revenue in reports

### 📈 Reports & Analytics

- **Revenue Analytics**: Total revenue, paid amounts, and due amounts
- **Order Statistics**: Total orders, pending, in-progress, and delivered counts
- **Expense Tracking**: Total expenses for the period
- **Date Range Filtering**: View reports for custom date ranges
- **Real-Time Calculations**: Dynamic stats updated as data changes

### 🎨 Customization

- **Custom Order Fields**: Define JSON-based custom fields per tenant
- **Product Categories**: Tenant-specific product categorization
- **Measurement Units**: Configurable units (feet, inches, meters, etc.)
- **Invoice Customization**: Custom footer text for invoices

### 🔐 Security & Access Control

- **Role-Based Access Control (RBAC)**: Admin, Owner, and Staff roles
- **God Admin**: Protected super-admin account that cannot be deleted
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API protection against abuse (100 requests/minute)
- **Tenant Isolation**: Automatic filtering of all queries by tenant
- **Admin Panel Hiding**: Shop users have no knowledge of admin panel existence

### 🎨 Modern UI/UX

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Animated Components**: Smooth transitions and counter animations
- **Status Badges**: Color-coded status indicators
- **Empty States**: Helpful guidance when no data exists
- **Toast Notifications**: Real-time feedback using Sonner
- **Skeleton Loaders**: Improved perceived performance during data loading
- **Glassmorphism Design**: Modern, premium aesthetic

---

## 🛠 Technical Stack

### Frontend

- **Framework**: [Next.js 15.4.11](https://nextjs.org/) (React 19.2.1)
- **Styling**: [Tailwind CSS 4.1.18](https://tailwindcss.com/) with custom design tokens
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Animations**: CSS transitions and Tailwind animations

### Backend

- **CMS**: [PayloadCMS 3.74.0](https://payloadcms.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with Payload MongoDB adapter
- **Authentication**: JWT-based auth with [jose](https://github.com/panva/jose)
- **Rich Text**: Lexical editor integration
- **File Uploads**: Media collection with Sharp image processing

### Development Tools

- **Language**: [TypeScript 5.7.3](https://www.typescriptlang.org/)
- **Package Manager**: pnpm (v9 or v10)
- **Testing**:
  - [Vitest](https://vitest.dev/) for unit/integration tests
  - [Playwright](https://playwright.dev/) for E2E tests
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Node Version**: 18.20.2+ or 20.9.0+
- **Deployment**: Vercel-ready, Docker-ready

---

## 🏗 Architecture

### Multi-Tenant Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Next.js    │  │  Payload    │  │   Middleware        │ │
│  │  Frontend   │  │  Admin      │  │   (Auth & Rate      │ │
│  │             │  │  Panel      │  │    Limiting)        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Access Control Layer                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tenant Isolation Filters (tenantFilter)             │  │
│  │  - Automatic tenant ID injection                     │  │
│  │  - Query filtering by tenant                         │  │
│  │  - Role-based access control                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer (MongoDB)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Tenant 1 │  │ Tenant 2 │  │ Tenant 3 │  │   ...    │   │
│  │  Data    │  │  Data    │  │  Data    │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Authentication**: JWT tokens stored in HTTP-only cookies
2. **Tenant Extraction**: Middleware extracts tenant ID from JWT
3. **Automatic Filtering**: All queries automatically filtered by tenant ID
4. **Access Control**: Role-based permissions enforced at collection level
5. **Data Isolation**: MongoDB queries include tenant filter

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.20.2+ or 20.9.0+
- pnpm 9+ or 10+
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd furniture-mangment-system
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   DATABASE_URL=mongodb://localhost:27017/furnitureManagment
   PAYLOAD_SECRET=your-secret-key-here
   NEXT_PUBLIC_SERVER_URL=http://localhost:3000
   GOD_ADMIN_EMAIL=admin@example.com
   GOD_ADMIN_PASSWORD=secure-password
   ```

4. **Start the development server**

   ```bash
   pnpm dev
   ```

5. **Access the application**
   - Shop Dashboard: http://localhost:3000/dashboard
   - Admin Panel: http://localhost:3000/admin
   - Login Page: http://localhost:3000/login

### Docker Setup (Optional)

1. **Update MongoDB URL in `.env`**

   ```env
   DATABASE_URL=mongodb://127.0.0.1/furnitureManagment
   ```

2. **Start Docker containers**

   ```bash
   docker-compose up -d
   ```

3. **Run the application**
   ```bash
   pnpm dev
   ```

---

## 📦 Collections & Data Models

### 1. **Tenants** (Shops)

Represents individual furniture shops in the multi-tenant system.

**Fields:**

- `name` (text, required): Shop name
- `slug` (text, required, unique): URL-friendly identifier
- `logo` (upload): Shop logo image
- `colorTheme` (json): Primary and secondary brand colors
- `contact` (group): Phone, email, and address
- `active` (checkbox): Shop activation status

**Access Control:**

- Read: Admins (all) or owners (own tenant only)
- Create: Admins only
- Update: Admins or owners (own tenant only)
- Delete: Admins only

---

### 2. **Users**

Authentication-enabled collection for system users.

**Fields:**

- `email` (email, required): User email (used for login)
- `password` (password, required): Hashed password
- `name` (text): User's full name
- `roles` (select, multi): admin, owner, staff
- `tenant` (relationship): Associated shop/tenant

**Access Control:**

- Admins: Full access to all users
- Owners: Can manage users within their tenant
- Staff: Can only view/update themselves

**Special Features:**

- God Admin protection (cannot be deleted)
- Auto-tenant assignment for non-admin users
- JWT-based authentication

---

### 3. **Customers**

Customer records for each shop.

**Fields:**

- `name` (text, required): Customer name
- `phone` (text, required, indexed): Phone number with validation
- `email` (email, optional): Customer email
- `tenant` (relationship, required): Associated shop

**Access Control:**

- Tenant-isolated (users only see their shop's customers)
- Create: Owners and staff
- Update/Delete: Tenant-filtered access

**Validation:**

- Phone: Supports international formats with +, spaces, dashes, parentheses

---

### 4. **Orders**

Core order management with payment tracking.

**Fields:**

- `customer` (relationship, required): Link to customer
- `type` (select, required): ready-made or custom
- `orderDate` (date, required, indexed): Order creation date
- `deliveryDate` (date): Expected delivery date
- `totalAmount` (number, required): Total order value
- `advancePaid` (number, required): Advance payment received
- `remainingPaid` (number): Remaining payment received
- `dueAmount` (virtual): Auto-calculated outstanding amount
- `status` (select, required, indexed): pending, in_progress, delivered
- `customFieldsData` (json): Dynamic custom fields
- `tenant` (relationship, required): Associated shop

**Business Logic:**

- Virtual `dueAmount` = totalAmount - advancePaid - remainingPaid
- Cannot mark as delivered with outstanding payments
- Total paid cannot exceed order amount
- Auto-tenant assignment on creation

**Access Control:**

- Tenant-isolated (complete data separation)
- Create: Authenticated users
- Update/Delete: Tenant-filtered access

---

### 5. **Expenses**

Business expense tracking for shop owners.

**Fields:**

- `title` (text, required): Expense title
- `amount` (number, required): Expense amount
- `date` (date, required): Expense date
- `description` (textarea): Additional details
- `tenant` (relationship, required): Associated shop

**Access Control:**

- Create: Owners and admins only
- Read/Update/Delete: Tenant-filtered access

---

### 6. **Configurations**

Tenant-specific settings and customizations.

**Fields:**

- `tenant` (relationship, required, unique): One config per tenant
- `invoiceText` (textarea): Custom invoice footer text
- `measurementUnits` (array): Custom measurement units
- `productCategories` (array): Product category list
- `customOrderFields` (json): Dynamic order field definitions

**Access Control:**

- Tenant admins (owners) can manage their own configuration
- Global admins have full access

**Example Custom Order Fields:**

```json
[
  {
    "name": "woodType",
    "label": "Wood Type",
    "type": "text"
  },
  {
    "name": "dimensions",
    "label": "Dimensions",
    "type": "text"
  }
]
```

---

### 7. **Media**

File upload collection for images and documents.

**Features:**

- Image optimization with Sharp
- Automatic resizing and format conversion
- Tenant-isolated storage

---

## 👤 User Roles & Permissions

### 🔴 Admin (Global Super Admin)

**Capabilities:**

- Full system access across all tenants
- Create and manage tenants
- View and manage all users
- Access admin panel at `/admin`
- Cannot be deleted if designated as God Admin

**Use Case:** System administrators managing the entire platform

---

### 🟢 Owner (Shop Owner)

**Capabilities:**

- Full access to their own tenant's data
- Manage customers, orders, and expenses
- Create and manage staff users within their shop
- Configure shop settings (branding, custom fields)
- View reports and analytics
- Access shop dashboard at `/dashboard`

**Restrictions:**

- Cannot access other tenants' data
- Cannot access admin panel
- Cannot create tenants

**Use Case:** Furniture shop owners managing their business

---

### 🟡 Staff (Shop Employee)

**Capabilities:**

- View and create customers
- View and create orders
- View their own profile
- Access shop dashboard at `/dashboard`

**Restrictions:**

- Cannot manage expenses
- Cannot manage other users
- Cannot modify shop configuration
- Cannot access admin panel

**Use Case:** Shop employees handling day-to-day operations

---

## 🔒 Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure, HTTP-only cookie-based authentication
- **Password Hashing**: Bcrypt-based password encryption
- **Role-Based Access Control**: Granular permissions per collection
- **God Admin Protection**: Designated admin account cannot be deleted

### Tenant Isolation

- **Automatic Filtering**: All queries automatically scoped to user's tenant
- **Middleware Protection**: Tenant ID validation on every request
- **Access Control Functions**:
  - `tenantFilter`: Standard tenant-based filtering
  - `tenantAdmins`: Owner/admin-only access
  - `tenantSelfAccess`: Self-service tenant management

### API Security

- **Rate Limiting**: 100 requests per minute per IP
- **Request Logging**: Development-mode request tracking
- **Error Sanitization**: No sensitive data in error messages
- **CORS Protection**: Configured for specific origins

### Admin Panel Security

- **Complete Hiding**: Non-admin users receive 404 on `/admin` routes
- **Strict Separation**: Admins redirected from shop dashboard
- **Token Verification**: JWT validation on protected routes

### Data Validation

- **Input Validation**: Zod schemas for form validation
- **Business Rules**: Payment validation, status checks
- **Phone Number Validation**: International format support
- **Email Validation**: Built-in email format checking

---

## 📊 Dashboard Features

### Main Dashboard (`/dashboard`)

- **Today's Sales**: Real-time revenue counter with animation
- **Active Orders**: Count of pending and in-progress orders
- **Pending Payments**: Orders with outstanding balances
- **Recent Orders Table**: Last 5 orders with customer, date, status, amount
- **Quick Actions**: Create new order, add customer buttons
- **Empty States**: Helpful guidance when no data exists

### Orders Management (`/dashboard/orders`)

- **Orders Table**: Sortable, filterable list of all orders
- **Status Filtering**: Filter by pending, in-progress, delivered
- **Search**: Search by customer name or order ID
- **Pagination**: Efficient handling of large datasets
- **Bulk Actions**: Delete multiple orders (with confirmation)
- **Order Details**: View full order information
- **Payment Tracking**: Visual indicators for due amounts

### Order Creation (`/dashboard/orders/new`)

- **Customer Selection**: Dropdown with existing customers
- **Quick Customer Add**: Create customer inline
- **Order Type Selection**: Ready-made or custom
- **Date Pickers**: Order date and delivery date
- **Payment Fields**: Total amount, advance, remaining
- **Custom Fields**: Dynamic fields based on tenant configuration
- **Validation**: Real-time form validation
- **Toast Notifications**: Success/error feedback

### Customers Management (`/dashboard/customers`)

- **Customer Table**: List with name, phone, email, created date
- **Search**: Find customers by name or phone
- **Customer Details**: View order history per customer
- **Quick Add**: Inline customer creation
- **Edit/Delete**: Manage customer records

### Reports (`/dashboard/reports`)

- **Date Range Selector**: Custom date range filtering
- **Revenue Stats**: Total revenue, paid, due amounts
- **Order Stats**: Total, pending, in-progress, delivered counts
- **Expense Stats**: Total expenses for period
- **Skeleton Loaders**: Smooth loading experience
- **Export Options**: (Future feature) PDF/Excel export

---

## 🌐 API Endpoints

### Authentication

- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `GET /api/users/me` - Get current user

### Orders

- `GET /api/orders` - List orders (tenant-filtered)
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Customers

- `GET /api/customers` - List customers (tenant-filtered)
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer details
- `PATCH /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Expenses

- `GET /api/expenses` - List expenses (tenant-filtered)
- `POST /api/expenses` - Create expense (owner only)
- `GET /api/expenses/:id` - Get expense details
- `PATCH /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Reports

- `GET /api/reports?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get analytics

### Tenants (Admin Only)

- `GET /api/tenants` - List all tenants
- `POST /api/tenants` - Create tenant
- `GET /api/tenants/:id` - Get tenant details
- `PATCH /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Delete tenant

---

## 🧪 Testing

### Unit & Integration Tests (Vitest)

```bash
pnpm run test:int
```

**Test Coverage:**

- Tenant isolation logic
- Access control functions
- Order validation rules
- Payment calculations
- Custom field handling

### End-to-End Tests (Playwright)

```bash
pnpm run test:e2e
```

**Test Scenarios:**

- User authentication flow
- Order creation workflow
- Customer management
- Multi-tenant data isolation
- Admin panel access control

### Run All Tests

```bash
pnpm test
```

---

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Configure Environment Variables**: Add all `.env` variables
3. **Deploy**: Vercel auto-deploys on push to main branch

### Docker Deployment

1. **Build Docker Image**

   ```bash
   docker build -t furniture-management .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 --env-file .env furniture-management
   ```

### Production Checklist

- [ ] Set strong `PAYLOAD_SECRET`
- [ ] Configure production MongoDB URL
- [ ] Set `NEXT_PUBLIC_SERVER_URL` to production domain
- [ ] Enable HTTPS
- [ ] Configure rate limiting (consider Redis)
- [ ] Set up database backups
- [ ] Configure monitoring (Sentry, LogRocket)
- [ ] Enable error tracking

---

## 🔧 Environment Variables

### Required Variables

| Variable                 | Description                       | Example                                        |
| ------------------------ | --------------------------------- | ---------------------------------------------- |
| `DATABASE_URL`           | MongoDB connection string         | `mongodb://localhost:27017/furnitureManagment` |
| `PAYLOAD_SECRET`         | JWT signing secret (min 32 chars) | `your-super-secret-key-here`                   |
| `NEXT_PUBLIC_SERVER_URL` | Public application URL            | `http://localhost:3000`                        |
| `GOD_ADMIN_EMAIL`        | Protected admin email             | `admin@example.com`                            |
| `GOD_ADMIN_PASSWORD`     | Protected admin password          | `secure-password`                              |

### Optional Variables

| Variable                  | Description                 | Default         |
| ------------------------- | --------------------------- | --------------- |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit time window (ms) | `60000` (1 min) |
| `MAX_REQUESTS_PER_WINDOW` | Max requests per window     | `100`           |
| `NODE_ENV`                | Environment mode            | `development`   |

---

## 💻 Development Workflow

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm devsafe          # Clean .next and start dev server

# Building
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier (if configured)

# Testing
pnpm test             # Run all tests
pnpm test:int         # Run integration tests
pnpm test:e2e         # Run E2E tests

# Payload CMS
pnpm payload          # Payload CLI commands
pnpm generate:types   # Generate TypeScript types
pnpm generate:importmap # Generate import map

# Database
pnpm seed             # Seed database with sample data
```

### Project Structure

```
furniture-mangment-system/
├── src/
│   ├── access/              # Access control functions
│   │   └── tenantIsolation.ts
│   ├── app/                 # Next.js app directory
│   │   ├── (auth)/          # Auth routes (login)
│   │   ├── (frontend)/      # Shop dashboard routes
│   │   │   └── dashboard/
│   │   │       ├── customers/
│   │   │       ├── orders/
│   │   │       ├── reports/
│   │   │       └── page.tsx
│   │   ├── (payload)/       # Payload admin routes
│   │   └── api/             # API routes
│   ├── collections/         # Payload collections
│   │   ├── Customers.ts
│   │   ├── Orders.ts
│   │   ├── Tenants.ts
│   │   ├── Users.ts
│   │   ├── Expenses.ts
│   │   ├── Configurations.ts
│   │   └── Media.ts
│   ├── components/          # React components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── layout/          # Layout components (sidebar, etc.)
│   │   └── ui/              # Reusable UI components
│   ├── lib/                 # Utility libraries
│   │   └── tenant-utils.ts
│   ├── utilities/           # Helper functions
│   ├── middleware.ts        # Next.js middleware (auth, rate limiting)
│   ├── payload.config.ts    # Payload CMS configuration
│   └── seed.ts              # Database seeding script
├── tests/                   # Test files
│   ├── integration/
│   └── e2e/
├── .env                     # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

### Theming System

The application uses a semantic theming system built with Tailwind CSS variables.

**Color Tokens** (defined in `src/app/(frontend)/styles.css`):

- **Success**: Green - Used for 'Paid' status, 'Delivered' orders
- **Warning**: Yellow - Used for 'Pending' orders
- **Info**: Blue - Used for 'In Progress' orders
- **Destructive**: Red - Used for 'Due Amount', errors

**Usage:**

```tsx
<div className="bg-success text-success-foreground">Paid</div>
<div className="bg-warning text-warning-foreground">Pending</div>
<div className="bg-info text-info-foreground">In Progress</div>
<div className="bg-destructive text-destructive-foreground">Due</div>
```

---

## 📝 Key Design Decisions

### Why Multi-Tenancy?

- **Scalability**: Single codebase serves multiple shops
- **Cost Efficiency**: Shared infrastructure reduces costs
- **Data Security**: Complete isolation prevents data leaks
- **Easy Onboarding**: New shops can be added instantly

### Why PayloadCMS?

- **Headless CMS**: Flexible, API-first architecture
- **Built-in Auth**: JWT authentication out of the box
- **Type Safety**: Auto-generated TypeScript types
- **Admin Panel**: Free, customizable admin interface
- **Extensibility**: Easy to add custom collections and fields

### Why MongoDB?

- **Flexible Schema**: Easy to add custom fields per tenant
- **Scalability**: Horizontal scaling for multi-tenant data
- **JSON Storage**: Native support for dynamic configurations
- **Performance**: Indexed queries for fast tenant filtering

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [PayloadCMS](https://payloadcms.com/) for the amazing headless CMS
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives

---

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for furniture shop owners worldwide**
