import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { startProductionRun } from '@/lib/productionUtils'

const verifyProduction = async (): Promise<void> => {
  const payload = await getPayload({ config: configPromise })
  payload.logger.info('Starting Production Verification...')

  try {
    // 1. Setup Data (Tenant, Warehouse, Products)
    const timestamp = Date.now()
    const tenant = await payload.create({
      collection: 'tenants',
      data: { name: `Prod Tenant ${timestamp}`, slug: `prod-test-${timestamp}`, active: true },
      overrideAccess: true,
    })

    const warehouse = await payload.create({
      collection: 'warehouses',
      data: { name: 'Factory', tenant: tenant.id, isDefault: true },
      overrideAccess: true,
    })

    const rawMaterial = await payload.create({
      collection: 'products',
      data: {
        name: 'Wood Plank',
        type: 'raw_material',
        price: 50,
        tenant: tenant.id,
        stock: 100, // Initial stock hack? No, use transaction
      },
      overrideAccess: true,
    })

    // Add stock properly
    await payload.create({
      collection: 'stock-transactions',
      data: {
        type: 'purchase_receive',
        product: rawMaterial.id,
        warehouse: warehouse.id,
        quantity: 10,
        tenant: tenant.id,
        date: new Date().toISOString(),
      },
      overrideAccess: true,
    })

    const finishedGood = await payload.create({
      collection: 'products',
      data: {
        name: 'Chair',
        type: 'finished_good',
        price: 200,
        tenant: tenant.id,
        bom: [
          { material: rawMaterial.id, quantity: 2 }, // Requires 2 Wood Planks
        ],
      },
      overrideAccess: true,
    })

    // 2. Create Order
    // @ts-expect-error Payload types might be mismatching with the detailed data structure here
    const order = await payload.create({
      collection: 'orders',
      data: {
        tenant: tenant.id,
        status: 'pending',
        type: 'ready-made', // or custom
        customer: (
          await payload.create({
            collection: 'customers',
            data: { name: 'John', phone: '123', tenant: tenant.id },
            overrideAccess: true,
          })
        ).id,
        items: [
          {
            product: finishedGood.id,
            quantity: 1,
            price: 200,
            productionStatus: 'pending',
          },
        ],
        totalAmount: 200,
        advancePaid: 0,
      },
      overrideAccess: true,
    })

    // 3. Create Production Run
    const productionRun = await payload.create({
      collection: 'production-runs',
      data: {
        order: order.id,
        orderItem: order.items?.[0].id as string,
        product: finishedGood.id,
        status: 'planned',
        stages: [{ stage: 'cutting', status: 'pending' }],
        tenant: tenant.id,
      },
      overrideAccess: true,
    })

    payload.logger.info(`Created Production Run: ${productionRun.id}`)

    // 4. Start Production (Should deduct 2 Wood Planks)
    payload.logger.info('Starting Production...')
    await startProductionRun({
      payload,
      productionRunId: productionRun.id,
      tenantId: tenant.id as string,
      actorId: 'system', // Simulated
    })

    // 5. Verification
    // Check Production Status
    const updatedRun = await payload.findByID({
      collection: 'production-runs',
      id: productionRun.id,
      overrideAccess: true,
    })
    if (updatedRun.status !== 'in_progress') throw new Error('Production Status not updated')

    // Check Raw Material Stock (10 - 2 = 8)
    const updatedMaterial = await payload.findByID({
      collection: 'products',
      id: rawMaterial.id,
      overrideAccess: true,
    })
    payload.logger.info(`Raw Material Stock: ${updatedMaterial.stock}`)

    if (updatedMaterial.stock !== 8)
      throw new Error(`Stock Deduction Failed! Expected 8, got ${updatedMaterial.stock}`)

    payload.logger.info('✅ VERIFICATION SUCCESSFUL: Production Logic Works.')
  } catch (error) {
    payload.logger.error({ err: error }, 'Verification Failed')
    process.exit(1)
  }
  process.exit(0)
}

verifyProduction()
