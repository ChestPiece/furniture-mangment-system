import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

export default defineSchema({
  ...authTables,

  // Tenants: Organizations that own data
  tenants: defineTable({
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
  }).index('by_slug', ['slug']),

  // Extend users table (from authTables) or define separate profile if preferred.
  // Convex Auth uses 'users' table by default. We can add fields to it in a separate step
  // or trust the default and use a separate 'profiles' table if we want strict separation.
  // For now, abiding by standard Convex Auth patterns, user data is in 'users'.
  // We will define a separate 'user_profiles' if we need extensive custom fields linked to the auth user.

  // Products: Inventory items
  products: defineTable({
    tenantId: v.id('tenants'),
    name: v.string(),
    description: v.optional(v.string()),
    sku: v.string(),
    price: v.number(),
    cost: v.number(),
    stock: v.number(),
    type: v.optional(v.string()),
    unit: v.optional(v.string()),
    lowStockThreshold: v.number(),
    categoryId: v.optional(v.id('categories')),
    supplierId: v.optional(v.id('suppliers')),
  })
    .index('by_tenant', ['tenantId'])
    .index('by_sku', ['tenantId', 'sku']),

  // Categories
  categories: defineTable({
    tenantId: v.id('tenants'),
    name: v.string(),
    slug: v.string(),
  }).index('by_tenant', ['tenantId']),

  // Suppliers
  suppliers: defineTable({
    tenantId: v.id('tenants'),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  }).index('by_tenant', ['tenantId']),

  // Warehouses
  warehouses: defineTable({
    tenantId: v.id('tenants'),
    name: v.string(),
    address: v.optional(v.string()),
    isDefault: v.boolean(),
  }).index('by_tenant', ['tenantId']),

  // Customers
  customers: defineTable({
    tenantId: v.id('tenants'),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  })
    .index('by_tenant', ['tenantId'])
    .index('by_email', ['tenantId', 'email']),

  // Orders
  orders: defineTable({
    tenantId: v.id('tenants'),
    customerId: v.id('customers'),
    orderNumber: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('completed'),
      v.literal('cancelled'),
    ),
    totalAmount: v.number(),
    paymentStatus: v.union(v.literal('paid'), v.literal('unpaid'), v.literal('partial')),
    dueDate: v.number(), // epoch timestamp
  })
    .index('by_tenant', ['tenantId'])
    .index('by_customer', ['tenantId', 'customerId'])
    .index('by_date', ['tenantId', 'dueDate']),

  // Order Items
  order_items: defineTable({
    orderId: v.id('orders'),
    productId: v.id('products'),
    quantity: v.number(),
    price: v.number(),
  }).index('by_order', ['orderId']),

  // Stock Transactions (History)
  stock_transactions: defineTable({
    tenantId: v.id('tenants'),
    productId: v.id('products'),
    warehouseId: v.id('warehouses'),
    type: v.union(
      v.literal('in'),
      v.literal('out'),
      v.literal('adjustment'),
      v.literal('purchase_receive'),
    ),
    quantity: v.number(),
    reference: v.optional(v.string()), // e.g., Order ID, PO ID
    notes: v.optional(v.string()),
  })
    .index('by_product', ['productId'])
    .index('by_tenant', ['tenantId']),

  // Production Runs
  production_runs: defineTable({
    tenantId: v.id('tenants'),
    productId: v.id('products'), // The finished good being produced
    quantity: v.number(),
    status: v.union(v.literal('planned'), v.literal('in_progress'), v.literal('completed')),
    startDate: v.number(),
    endDate: v.optional(v.number()),
  }).index('by_tenant', ['tenantId']),

  // Purchase Orders
  purchase_orders: defineTable({
    tenantId: v.id('tenants'),
    supplierId: v.id('suppliers'),
    poNumber: v.string(),
    status: v.union(v.literal('draft'), v.literal('ordered'), v.literal('received')),
    totalAmount: v.number(),
    date: v.number(),
  }).index('by_tenant', ['tenantId']),

  // Purchase Order Items
  purchase_order_items: defineTable({
    purchaseOrderId: v.id('purchase_orders'),
    productId: v.id('products'),
    quantity: v.number(),
    cost: v.number(),
  }).index('by_po', ['purchaseOrderId']),
})
