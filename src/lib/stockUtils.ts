import { Payload } from 'payload'

/**
 * Recalculates the stock for a specific Product and sets the warehouseStock and total stock.
 * This should be called whenever a StockTransaction is created, updated, or deleted.
 */
export const recalculateProductStock = async ({
  payload,
  productId,
  tenantId,
}: {
  payload: Payload
  productId: string
  tenantId: string
}) => {
  try {
    // 1. Fetch all transactions for this product
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
      limit: 0, // Get all
      pagination: false,
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

    // 4. Update Product
    await payload.update({
      collection: 'products',
      id: productId,
      data: {
        stock: totalStock,
        warehouseStock: warehouseStock,
      },
      context: {
        skipStockUpdate: true, // prevent infinite loops if we had hooks on Product update
      },
    })

    console.log(`Updated stock for Product ${productId}: Total ${totalStock}`)
  } catch (error) {
    console.error('Error recalculating stock:', error)
  }
}
