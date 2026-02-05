import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const verifyAnalytics = async (): Promise<void> => {
  const payload = await getPayload({ config: configPromise })
  payload.logger.info('Starting Analytics Verification...')

  try {
    const timestamp = Date.now()
    const tenant = await payload.create({
      collection: 'tenants',
      data: { name: `Analytics Tenant ${timestamp}`, slug: `ana-test-${timestamp}`, active: true },
      overrideAccess: true,
    })

    // 1. Setup Data
    // Create Order with Payment for Revenue
    // @ts-ignore
    const order = await payload.create({
      collection: 'orders',
      data: {
        tenant: tenant.id,
        type: 'ready-made',
        status: 'pending', // Valid status
        paymentStatus: 'paid', // Our custom status
        totalAmount: 5000,
        items: [
          {
            product: (
              await payload.create({
                collection: 'products',
                data: {
                  name: 'Dummy',
                  type: 'finished_good',
                  price: 5000,
                  stock: 100,
                  tenant: tenant.id,
                },
                overrideAccess: true,
              })
            ).id,
            quantity: 1,
            price: 5000,
          },
        ],
        customer: (
          await payload.create({
            collection: 'customers',
            data: { name: 'Ana', phone: '123', tenant: tenant.id },
            overrideAccess: true,
          })
        ).id,
      },
      overrideAccess: true,
    })

    await payload.create({
      collection: 'payments',
      data: {
        order: order.id,
        amount: 5000,
        method: 'cash',
        status: 'completed',
        date: new Date().toISOString(),
        tenant: tenant.id,
      },
      overrideAccess: true,
    })

    // Create Low Stock Item
    await payload.create({
      collection: 'products',
      data: {
        name: 'Low Item',
        type: 'raw_material',
        price: 10,
        stock: 2,
        tenant: tenant.id,
        cost: 5,
      },
      overrideAccess: true,
    })

    // Create Normal Stock Item
    await payload.create({
      collection: 'products',
      data: {
        name: 'High Item',
        type: 'raw_material',
        price: 10,
        stock: 50,
        tenant: tenant.id,
        cost: 5,
      },
      overrideAccess: true,
    })

    // 2. Perform Queries (Logic from reports.ts)

    // Revenue
    const payments = await payload.find({
      collection: 'payments',
      where: {
        and: [{ tenant: { equals: tenant.id } }, { status: { equals: 'completed' } }],
      },
      limit: 0,
      pagination: false,
    })
    const totalRevenue = payments.docs.reduce((acc, p) => acc + (p.amount || 0), 0)

    // Low Stock
    const lowStock = await payload.find({
      collection: 'products',
      where: {
        and: [{ tenant: { equals: tenant.id } }, { stock: { less_than: 10 } }],
      },
      limit: 0,
    })

    // Inventory Value (2*5 + 50*5 = 10 + 250 = 260. Dummy is 100*? (No cost set).
    // Wait, Dummy has no cost set. Default cost?
    // Product cost field min 0. If undefined, it might be 0.
    // So Dummy value = 100 * 0 = 0.
    // Inventory Value expected reference: 260.
    const products = await payload.find({
      collection: 'products',
      where: { tenant: { equals: tenant.id } },
      limit: 0,
      pagination: false,
    })
    const inventoryValue = products.docs.reduce((acc, p) => acc + (p.stock || 0) * (p.cost || 0), 0)

    // 3. Assertions
    payload.logger.info(
      `Revenue: ${totalRevenue}, Orders: ? (1), LowStock: ${lowStock.totalDocs}, Value: ${inventoryValue}`,
    )

    if (totalRevenue !== 5000) throw new Error(`Revenue failed: got ${totalRevenue}`)
    if (lowStock.totalDocs !== 1) throw new Error(`Low Stock failed: got ${lowStock.totalDocs}`)
    if (inventoryValue !== 260) throw new Error(`Inventory Value failed: got ${inventoryValue}`)

    payload.logger.info('✅ VERIFICATION SUCCESSFUL: Analytics Queries are correct.')
  } catch (error) {
    payload.logger.error({ err: error }, 'Verification Failed')
    process.exit(1)
  }
  process.exit(0)
}

verifyAnalytics()
