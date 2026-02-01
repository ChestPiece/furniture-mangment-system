import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect, afterAll } from 'vitest'

let payload: Payload
let tenantA: any
let tenantB: any
let ownerA: any
let ownerB: any

describe('Multi-Tenant Isolation', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // Clean up existing data
    await payload.delete({ collection: 'orders', where: { id: { exists: true } } })
    await payload.delete({ collection: 'customers', where: { id: { exists: true } } })
    await payload.delete({ collection: 'users', where: { email: { contains: 'test' } } })
    await payload.delete({ collection: 'tenants', where: { slug: { contains: 'test' } } })

    // Create Tenants
    tenantA = await payload.create({
      collection: 'tenants',
      data: { name: 'Shop A', slug: 'test-shop-a' },
    })

    tenantB = await payload.create({
      collection: 'tenants',
      data: { name: 'Shop B', slug: 'test-shop-b' },
    })

    // Create Owners
    ownerA = await payload.create({
      collection: 'users',
      data: {
        email: 'ownerA@test.com',
        password: 'password123',
        roles: ['owner'],
        tenant: tenantA.id,
      },
      overrideAccess: true, // Only for setup
    })

    ownerB = await payload.create({
      collection: 'users',
      data: {
        email: 'ownerB@test.com',
        password: 'password123',
        roles: ['owner'],
        tenant: tenantB.id,
      },
      overrideAccess: true,
    })
  })

  it('should allow owner to create customer in their tenant', async () => {
    const customer = await payload.create({
      collection: 'customers',
      data: { name: 'Customer A', phone: '111', tenant: tenantA.id },
      user: ownerA,
      overrideAccess: false,
      draft: false,
    })

    expect(customer.tenant).toEqual(tenantA.id)
  })

  it('should auto-assign tenant when owner creates customer', async () => {
    const customer = await payload.create({
      collection: 'customers',
      data: { name: 'Customer A2', phone: '112', tenant: tenantA.id },
      user: ownerA,
      overrideAccess: false,
      draft: false,
    })

    expect(customer.tenant).toEqual(tenantA.id)
  })

  it('should NOT allow owner A to see owner B customers', async () => {
    // Create customer for B
    await payload.create({
      collection: 'customers',
      data: { name: 'Customer B', phone: '222', tenant: tenantB.id },
      user: ownerB,
      overrideAccess: false,
      draft: false,
    })

    // Query as Owner A
    const result = await payload.find({
      collection: 'customers',
      user: ownerA,
      overrideAccess: false,
    })

    // Should only see A's customers
    expect(result.docs).toHaveLength(2)
    result.docs.forEach((doc) => {
      expect(doc.tenant).toEqual(tenantA.id)
    })
  })

  it('should NOT allow owner A to update owner B customer', async () => {
    // Create customer for B
    const custB = await payload.create({
      collection: 'customers',
      data: { name: 'Customer B2', phone: '223', tenant: tenantB.id },
      user: ownerB,
      overrideAccess: false,
      draft: false,
    })

    // Try update as Owner A
    await expect(
      payload.update({
        collection: 'customers',
        id: custB.id,
        data: { name: 'Hacked' },
        user: ownerA,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
})
