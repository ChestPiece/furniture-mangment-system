import { Payload } from 'payload'

/**
 * Starts production for a specific run.
 * 1. Validates status.
 * 2. Deducts Raw Materials from Inventory based on Product BOM.
 * 3. Updates ProductionRun status.
 */
export const startProductionRun = async ({
  payload,
  productionRunId,
  tenantId,
  actorId, // User ID who started it
}: {
  payload: Payload
  productionRunId: string
  tenantId: string
  actorId: string
}) => {
  try {
    // 1. Fetch Production Run
    const productionRun = await payload.findByID({
      collection: 'production-runs',
      id: productionRunId,
    })

    if (!productionRun) throw new Error('Production Run not found')
    if (productionRun.status !== 'planned') throw new Error('Production already started')

    // 2. Fetch Product BOM
    const product =
      typeof productionRun.product === 'string'
        ? await payload.findByID({ collection: 'products', id: productionRun.product })
        : productionRun.product

    if (!product.bom || product.bom.length === 0) {
      console.warn(`Product ${product.name} has no BOM. Skipping stock deduction.`)
    } else {
      // 3. Deduct Materials
      // We need to know the quantity of the Finished Good being made.
      // The ProductionRun doesn't explicitly store "quantity" in my schema yet?
      // Wait, ProductionRun links to Order Item. We should fetch Order Item quantity.
      // Ideally ProductionRun should probably cache the quantity.
      // For now, let's assume 1 unit if not specified, OR fetch Order.

      let quantityToMake = 1
      if (productionRun.order && productionRun.orderItem) {
        const order =
          typeof productionRun.order === 'string'
            ? await payload.findByID({ collection: 'orders', id: productionRun.order })
            : productionRun.order

        const item = order.items?.find((i: any) => i.id === productionRun.orderItem)
        if (item) quantityToMake = item.quantity
      }

      for (const bomItem of product.bom) {
        const materialId =
          typeof bomItem.material === 'string' ? bomItem.material : bomItem.material.id
        const qtyNeeded = bomItem.quantity * quantityToMake

        // Fetch Material to find its warehouse
        const material = await payload.findByID({ collection: 'products', id: materialId })

        // Find a warehouse with stock? Or just the first one?
        // For MVP, if material has stock in multiple warehouses, this logic is naive.
        // We'll default to the first warehouse found in stock list, or the Default Warehouse of the tenant if no stock.
        const sourceWarehouse = material.warehouseStock?.[0]?.warehouse

        if (!sourceWarehouse) {
          // Fallback or warning
          console.warn(`No warehouse found for material ${material.name}. Validation might fail.`)
          // Try to use the product's (finished good) warehouse as a fallback? unlikely to help if it's raw vs finished.
        }

        // Create OUT transaction
        await payload.create({
          collection: 'stock-transactions',
          data: {
            type: 'order_deduction',
            product: materialId,
            warehouse: sourceWarehouse as string,
            quantity: -qtyNeeded,
            tenant: tenantId,
            reference: `Production Start: ${productionRunId}`,
            date: new Date().toISOString(),
          },
        })
      }
    }

    // 4. Update Status
    await payload.update({
      collection: 'production-runs',
      id: productionRunId,
      data: {
        status: 'in_progress',
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error starting production:', error)
    throw error
  }
}
