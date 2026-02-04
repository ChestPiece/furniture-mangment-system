'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function deleteCustomer(id: string) {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    throw new Error('Unauthorized')
  }

  try {
    await payload.delete({
      collection: 'customers',
      where: {
        and: [
          {
            id: {
              equals: id,
            },
          },
          {
            tenant: {
              equals: user.tenant,
            },
          },
        ],
      },
    })
    revalidatePath('/dashboard/customers')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete customer:', error)
    return { success: false, error: 'Failed to delete customer' }
  }
}

export async function updateCustomer(id: string, data: any) {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    throw new Error('Unauthorized')
  }

  try {
    await payload.update({
      collection: 'customers',
      id,
      data,
      where: {
        tenant: {
          equals: user.tenant,
        },
      },
    })
    revalidatePath(`/dashboard/customers/${id}`)
    revalidatePath('/dashboard/customers')
    return { success: true }
  } catch (error) {
    console.error('Failed to update customer:', error)
    return { success: false, error: 'Failed to update customer' }
  }
}
