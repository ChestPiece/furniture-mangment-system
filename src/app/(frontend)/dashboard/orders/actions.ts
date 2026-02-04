'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function deleteOrder(id: string) {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    throw new Error('Unauthorized')
  }

  try {
    await payload.delete({
      collection: 'orders',
      id,
      where: {
        tenant: {
          equals: user.tenant,
        }
      },
    })
    revalidatePath('/dashboard/orders')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete order:', error)
    return { success: false, error: 'Failed to delete order' }
  }
}
