import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { receivePurchaseOrder } from '@/lib/financeUtils'

const verifyFinance = async (): Promise<void> => {
  const payload = await getPayload({ config: configPromise })
  payload.logger.info('Starting Finance Verification...')

  try {
    const timestamp = Date.now()
    // 1. Setup Tenant and Warehouse
    const tenant = await payload.create({
      collection: 'tenants',
      data: { name: `Fin Tenant ${timestamp}`, slug: `fin-test-${timestamp}`, active: true },
      overrideAccess: true,
    })

    const warehouse = await payload.create({
      collection: 'warehouses',
      data: { name: 'Main Depot', tenant: tenant.id, isDefault: true },
      overrideAccess: true,
    })

    const supplier = await payload.create({
      collection: 'suppliers',
      data: { name: 'Super Supply', tenant: tenant.id },
      overrideAccess: true,
    })

    const product = await payload.create({
      collection: 'products',
      data: { name: 'Steel Pipe', type: 'raw_material', price: 10, tenant: tenant.id },
      overrideAccess: true,
    })

    // 2. Create PO
    const po = await payload.create({
      collection: 'purchase-orders',
      data: {
        supplier: supplier.id,
        status: 'ordered',
        items: [{ product: product.id, quantity: 50, unitCost: 5 }],
        tenant: tenant.id,
      },
      overrideAccess: true,
    })

    payload.logger.info(`Created PO: ${po.id}`)

    // 3. Receive PO (Triggers Stock Transaction)
    payload.logger.info('Receiving PO...')
    await receivePurchaseOrder({
      payload,
      purchaseOrderId: po.id,
      tenantId: tenant.id as string,
    })

    // 4. Verify Stock
    const updatedProduct = await payload.findByID({
      collection: 'products',
      id: product.id,
      overrideAccess: true,
    })
    payload.logger.info(`Product Stock: ${updatedProduct.stock}`)

    if (updatedProduct.stock !== 50)
      throw new Error(`Stock mismatch! Expected 50, got ${updatedProduct.stock}`)

    // 5. Verify PO Status
    const updatedPO = await payload.findByID({
      collection: 'purchase-orders',
      id: po.id,
      overrideAccess: true,
    })
    if (updatedPO.status !== 'received') throw new Error('PO Status not updated to received')

    payload.logger.info('✅ VERIFICATION SUCCESSFUL: Finance Logic Works.')
  } catch (error) {
    payload.logger.error({ err: error }, 'Verification Failed')
    process.exit(1)
  }
  process.exit(0)
}

verifyFinance()
