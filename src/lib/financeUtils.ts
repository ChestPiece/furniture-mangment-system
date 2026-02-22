import type { Payload, PayloadRequest } from 'payload'

/**
 * Marks a Purchase Order as received and creates corresponding StockTransactions (purchase_receive).
 * This updates inventory levels for the items in the PO.
 */
export const receivePurchaseOrder = async ({
  payload,
  purchaseOrderId,
  tenantId,
  req,
}: {
  payload: Payload
  purchaseOrderId: string
  tenantId: string
  req?: PayloadRequest
}) => {
  try {
    const po = await payload.findByID({
      collection: 'purchase-orders',
      id: purchaseOrderId,
      depth: 1,
      ...(req ? { req } : {}),
    })

    if (!po) throw new Error('Purchase Order not found')
    if (po.status === 'received') throw new Error('Purchase Order already received')

    // Resolve target warehouse ONCE outside the loop to avoid N+1 queries
    let targetWarehouseId: string | undefined

    const warehouses = await payload.find({
      collection: 'warehouses',
      where: {
        and: [{ tenant: { equals: tenantId } }, { isDefault: { equals: true } }],
      },
      limit: 1,
      ...(req ? { req } : {}),
    })

    targetWarehouseId = warehouses.docs[0]?.id

    if (!targetWarehouseId) {
      const anyWarehouse = await payload.find({
        collection: 'warehouses',
        where: { tenant: { equals: tenantId } },
        limit: 1,
        ...(req ? { req } : {}),
      })
      targetWarehouseId = anyWarehouse.docs[0]?.id
    }

    if (!targetWarehouseId) {
      throw new Error('No warehouse found to receive stock into.')
    }

    if (po.items) {
      for (const item of po.items) {
        const productId = typeof item.product === 'string' ? item.product : item.product.id

        await payload.create({
          collection: 'stock-transactions',
          data: {
            type: 'purchase_receive',
            product: productId,
            warehouse: targetWarehouseId,
            quantity: item.quantity,
            supplier: typeof po.supplier === 'string' ? po.supplier : po.supplier.id,
            reference: `PO #${po.id}`,
            tenant: tenantId,
            date: new Date().toISOString(),
          },
          ...(req ? { req } : {}),
        })
      }
    }

    await payload.update({
      collection: 'purchase-orders',
      id: purchaseOrderId,
      data: {
        status: 'received',
      },
      ...(req ? { req } : {}),
    })

    return { success: true }
  } catch (error) {
    console.error('Error receiving PO:', error)
    throw error
  }
}
