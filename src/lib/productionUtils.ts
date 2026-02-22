import type { Payload, PayloadRequest } from 'payload'

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
  req,
}: {
  payload: Payload
  productionRunId: string
  tenantId: string
  req?: PayloadRequest
}) => {
  try {
    const reqOpts = req ? { req } : {}

    const productionRun = await payload.findByID({
      collection: 'production-runs',
      id: productionRunId,
      ...reqOpts,
    })

    if (!productionRun) throw new Error('Production Run not found')
    if (productionRun.status !== 'planned') throw new Error('Production already started')

    const product =
      typeof productionRun.product === 'string'
        ? await payload.findByID({ collection: 'products', id: productionRun.product, ...reqOpts })
        : productionRun.product

    if (!product.bom || product.bom.length === 0) {
      // No BOM - skip stock deduction
    } else {
      let quantityToMake = 1
      if (productionRun.order && productionRun.orderItem) {
        const order =
          typeof productionRun.order === 'string'
            ? await payload.findByID({ collection: 'orders', id: productionRun.order, ...reqOpts })
            : productionRun.order

        const item = order.items?.find((i) => i.id === productionRun.orderItem)
        if (item) quantityToMake = item.quantity
      }

      // Batch-fetch all materials to avoid N+1 queries
      const materialIds = product.bom.map((bomItem) =>
        typeof bomItem.material === 'string' ? bomItem.material : bomItem.material.id,
      )

      const materialsResult = await payload.find({
        collection: 'products',
        where: {
          id: { in: materialIds },
        },
        limit: materialIds.length,
        ...reqOpts,
      })

      const materialsMap = new Map(materialsResult.docs.map((m) => [m.id, m]))

      for (const bomItem of product.bom) {
        const materialId =
          typeof bomItem.material === 'string' ? bomItem.material : bomItem.material.id
        const qtyNeeded = bomItem.quantity * quantityToMake

        const material = materialsMap.get(materialId)
        const sourceWarehouse = material?.warehouseStock?.[0]?.warehouse

        if (!sourceWarehouse) {
          console.warn(`No warehouse found for material ${material?.name ?? materialId}.`)
        }

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
          ...reqOpts,
        })
      }
    }

    await payload.update({
      collection: 'production-runs',
      id: productionRunId,
      data: {
        status: 'in_progress',
      },
      ...reqOpts,
    })

    return { success: true }
  } catch (error) {
    console.error('Error starting production:', error)
    throw error
  }
}
