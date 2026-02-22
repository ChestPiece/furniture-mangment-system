import type { Payload, PayloadRequest } from 'payload'

/**
 * Recalculates the stock for a specific Product and sets the warehouseStock and total stock.
 * This should be called whenever a StockTransaction is created, updated, or deleted.
 */
export const recalculateProductStock = async ({
  payload,
  productId,
  tenantId,
  req,
}: {
  payload: Payload
  productId: string
  tenantId: string
  req?: PayloadRequest
}) => {
  try {
    const transactions = await payload.find({
      collection: 'stock-transactions',
      where: {
        and: [
          {
            product: {
              equals: productId,
            },
          },
          {
            tenant: {
              equals: tenantId,
            },
          },
        ],
      },
      limit: 0,
      pagination: false,
      ...(req ? { req } : {}),
    })

    // 2. Aggregate per warehouse
    const warehouseMap = new Map<string, number>()
    let totalStock = 0

    transactions.docs.forEach((tx) => {
      const warehouseId = typeof tx.warehouse === 'string' ? tx.warehouse : tx.warehouse.id
      const qty = tx.quantity || 0

      const current = warehouseMap.get(warehouseId) || 0
      warehouseMap.set(warehouseId, current + qty)
      totalStock += qty
    })

    // 3. Format for Product.warehouseStock
    const warehouseStock = Array.from(warehouseMap.entries()).map(([whId, qty]) => ({
      warehouse: whId,
      quantity: qty,
    }))

    await payload.update({
      collection: 'products',
      id: productId,
      data: {
        stock: totalStock,
        warehouseStock: warehouseStock,
      },
      context: {
        skipStockUpdate: true,
      },
      ...(req ? { req } : {}),
    })
  } catch (error) {
    console.error('Error recalculating stock:', error)
    throw error
  }
}
