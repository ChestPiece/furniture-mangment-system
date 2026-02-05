import { Payload } from 'payload'

/**
 * Marks a Purchase Order as received and creates corresponding StockTransactions (purchase_receive).
 * This updates inventory levels for the items in the PO.
 */
export const receivePurchaseOrder = async ({
  payload,
  purchaseOrderId,
  tenantId,
}: {
  payload: Payload
  purchaseOrderId: string
  tenantId: string
}) => {
  try {
    // 1. Fetch PO
    const po = await payload.findByID({
      collection: 'purchase-orders',
      id: purchaseOrderId,
      depth: 1, // Need details to check if product is valid
    })

    if (!po) throw new Error('Purchase Order not found')
    if (po.status === 'received') throw new Error('Purchase Order already received')

    // 2. Iterate Items and Create Transactions
    if (po.items) {
      for (const item of po.items) {
        const productId = typeof item.product === 'string' ? item.product : item.product.id

        // Get Product to find a warehouse?
        // Or should PO specify warehouse? Ideally PO specifies warehouse.
        // For now, let's look up the "Default" warehouse for the tenant again?
        // Or look up if the product has a preferred warehouse.
        // Simplification: Fetch tenant default warehouse.

        // Note: In a real app we'd query for the default warehouse once outside the loop.
        const warehouses = await payload.find({
          collection: 'warehouses',
          where: {
            and: [{ tenant: { equals: tenantId } }, { isDefault: { equals: true } }],
          },
          limit: 1,
        })

        let targetWarehouseId = warehouses.docs[0]?.id

        if (!targetWarehouseId) {
          // Fallback: any warehouse
          const anyWarehouse = await payload.find({
            collection: 'warehouses',
            where: { tenant: { equals: tenantId } },
            limit: 1,
          })
          targetWarehouseId = anyWarehouse.docs[0]?.id
        }

        if (!targetWarehouseId) {
          throw new Error('No warehouse found to receive stock into.')
        }

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
        })
      }
    }

    // 3. Update PO Status
    await payload.update({
      collection: 'purchase-orders',
      id: purchaseOrderId,
      data: {
        status: 'received',
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error receiving PO:', error)
    throw error
  }
}
