import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tenants } from './collections/Tenants'
import { Configurations } from './collections/Configurations'
import { Customers } from './collections/Customers'
import { Orders } from './collections/Orders'
import { Expenses } from './collections/Expenses'
import { Products } from './collections/Products'
import { Warehouses } from './collections/Warehouses'
import { Suppliers } from './collections/Suppliers'
import { StockTransactions } from './collections/StockTransactions'

import { ProductionRuns } from './collections/ProductionRuns'
import { JobCards } from './collections/JobCards'
import { Deliveries } from './collections/Deliveries'
import { PurchaseOrders } from './collections/PurchaseOrders'
import { Payments } from './collections/Payments'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'].filter(Boolean) as string[],
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'].filter(Boolean) as string[],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Tenants,
    Configurations,
    Customers,
    Orders,
    Expenses,
    Products,
    Warehouses,
    Suppliers,
    StockTransactions,
    ProductionRuns,
    JobCards,
    Deliveries,
    PurchaseOrders,
    Payments,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [],
})
