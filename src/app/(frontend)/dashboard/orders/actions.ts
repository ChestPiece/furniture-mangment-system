'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

import { extractTenantId } from '@/lib/tenant-utils'

export async function deleteOrder(id: string) {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  const tenantId = extractTenantId(user?.tenant)

  if (!user || !tenantId) {
    throw new Error('Unauthorized')
  }

  try {
    await payload.delete({
      collection: 'orders',
      where: {
        and: [
          {
            id: {
              equals: id,
            },
          },
          {
            tenant: {
              equals: tenantId,
            },
          },
        ],
      },
    })
    revalidatePath('/dashboard/orders')
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`Failed to delete order (ID: ${id}):`, errorMessage)
    return { success: false, error: 'Failed to delete order' }
  }
}
