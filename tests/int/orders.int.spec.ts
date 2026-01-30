import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload
let tenant: any
let owner: any
let customer: any

describe('Orders Logic', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // Setup Tenant & User
    tenant = await payload.create({
      collection: 'tenants',
      data: { name: 'Order Shop', slug: 'order-shop' },
    })

    owner = await payload.create({
      collection: 'users',
      data: {
        email: 'order.owner@test.com',
        password: 'password123',
        roles: ['owner'],
        tenant: tenant.id,
      },
      overrideAccess: true,
    })

    customer = await payload.create({
      collection: 'customers',
      data: { name: 'Buyer', phone: '999', tenant: tenant.id },
      user: owner,
      overrideAccess: false,
      draft: false,
    })
  })

  it('should calculate due amount correctly', async () => {
    const order = await payload.create({
      collection: 'orders',
      data: {
        customer: customer.id,
        totalAmount: 1000,
        advancePaid: 200,
        status: 'pending',
        type: 'ready-made',
        orderDate: new Date().toISOString(),
        tenant: tenant.id,
      },
      user: owner,
      overrideAccess: false,
      draft: false,
    })

    // dueAmount is virtual, usually not returned in create/update result unless specifically populated or computed locally
    // but our test logic should verify the virtual field if possible or just the calculation logic if we use API
    // Let's re-fetch to be sure
    const refetched = await payload.findByID({
      collection: 'orders',
      id: order.id,
      user: owner,
      overrideAccess: false,
    })

    expect(refetched.dueAmount).toEqual(800)
    expect(refetched.tenant).toEqual(tenant.id)
  })

  it('should prevent marking as delivered if due amount > 0', async () => {
    const order = await payload.create({
      collection: 'orders',
      data: {
        customer: customer.id,
        totalAmount: 500,
        advancePaid: 100,
        status: 'pending',
        type: 'ready-made',
        orderDate: new Date().toISOString(),
        tenant: tenant.id,
      },
      user: owner,
      overrideAccess: false,
      draft: false,
    })

    try {
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: { status: 'delivered' },
        user: owner,
        overrideAccess: false,
      })
      expect.fail('Should have thrown error')
    } catch (e: any) {
      expect(e.message).toContain('Cannot mark as delivered while there is a due amount')
    }
  })

  it('should allow delivery if paid in full', async () => {
    const order = await payload.create({
      collection: 'orders',
      data: {
        customer: customer.id,
        totalAmount: 500,
        advancePaid: 100,
        status: 'pending',
        type: 'ready-made',
        orderDate: new Date().toISOString(),
        tenant: tenant.id,
      },
      user: owner,
      overrideAccess: false,
      draft: false,
    })

    // Pay remaining
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { remainingPaid: 400 },
      user: owner,
      overrideAccess: false,
    })

    const delivered = await payload.update({
      collection: 'orders',
      id: order.id,
      data: { status: 'delivered' },
      user: owner,
      overrideAccess: false,
    })

    expect(delivered.status).toEqual('delivered')
  })
})
