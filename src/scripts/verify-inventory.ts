// @ts-nocheck
import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const verifyInventory = async (): Promise<void> => {
  const payload = await getPayload({ config: configPromise })

  payload.logger.info('Starting Inventory Verification...')

  try {
    // 1. Create Tenant
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Inventory Test Tenant',
        slug: 'inventory-test',
        active: true,
      },
      overrideAccess: true, // As Admin
    })
    payload.logger.info(`Created Tenant: ${tenant.name}`)

    // 2. Create Warehouse
    const warehouse = await payload.create({
      collection: 'warehouses',
      data: {
        name: 'Main Test Warehouse',
        tenant: tenant.id,
        isDefault: true,
      },
      overrideAccess: true,
    })
    payload.logger.info(`Created Warehouse: ${warehouse.name}`)

    // 3. Create Supplier
    const supplier = await payload.create({
      collection: 'suppliers',
      data: {
        name: 'Test Setup Supplier',
        tenant: tenant.id,
      },
      overrideAccess: true,
    })
    payload.logger.info(`Created Supplier: ${supplier.name}`)

    // 4. Create Product
    const product = await payload.create({
      collection: 'products',
      data: {
        name: 'Test Material',
        type: 'raw_material',
        price: 100,
        cost: 50,
        tenant: tenant.id as string,
      },
      overrideAccess: true,
    })
    payload.logger.info(`Created Product: ${product.name}, Stock: ${product.stock}`)

    if (product.stock !== 0) {
      throw new Error('Initial stock should be 0')
    }

    // 5. Create Transaction (IN)
    payload.logger.info('Creating Purchase Receive Transaction (+100)...')
    await payload.create({
      collection: 'stock-transactions',
      data: {
        type: 'purchase_receive',
        product: product.id,
        warehouse: warehouse.id,
        supplier: supplier.id,
        quantity: 100,
        tenant: tenant.id,
        date: new Date().toISOString(),
      },
      overrideAccess: true,
    })

    // 6. Verify Stock Update
    // Fetch product again
    const updatedProduct = await payload.findByID({
      collection: 'products',
      id: product.id,
      overrideAccess: true,
    })

    payload.logger.info(`Updated Product Stock: ${updatedProduct.stock}`)

    if (updatedProduct.stock !== 100) {
      throw new Error(`Stock mismatch! Expected 100, got ${updatedProduct.stock}`)
    }

    // Verify Warehouse Stock
    const whStock = updatedProduct.warehouseStock?.find(
      (ws) => (typeof ws.warehouse === 'string' ? ws.warehouse : ws.warehouse?.id) === warehouse.id,
    )
    if (!whStock || whStock.quantity !== 100) {
      throw new Error(`Warehouse Stock mismatch! Expected 100, got ${whStock?.quantity}`)
    }

    payload.logger.info('✅ VERIFICATION SUCCESSFUL: Stock updated correctly.')

    // Optional: Cleanup
    // await payload.delete({ collection: 'tenants', id: tenant.id, overrideAccess: true })
  } catch (error) {
    payload.logger.error({ err: error }, 'Verification Failed')
    process.exit(1)
  }

  process.exit(0)
}

verifyInventory()
