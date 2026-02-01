import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/reports/pending-payments/route'
import { NextRequest } from 'next/server'

// Mock payload and config
vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))
vi.mock('@payload-config', () => ({}))

// Helper to mock request
const createRequest = (url: string, headers: HeadersInit = {}) => {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    headers: new Headers(headers),
  })
}

describe('API: Pending Payments Report', () => {
  let mockPayload: any

  beforeEach(async () => {
    vi.clearAllMocks()

    mockPayload = {
      auth: vi.fn(),
      find: vi.fn(),
    }

    const { getPayload } = await import('payload')
    ;(getPayload as any).mockResolvedValue(mockPayload)
  })

  it('should return 401 if not authenticated', async () => {
    mockPayload.auth.mockResolvedValue({ user: null })
    const req = createRequest('/api/reports/pending-payments')

    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('should return 400 for invalid query parameters', async () => {
    mockPayload.auth.mockResolvedValue({ user: { tenant: 'tenant1' } })
    const req = createRequest('/api/reports/pending-payments?page=invalid')

    const res = await GET(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Invalid query parameters')
  })

  it('should return pending orders correctly', async () => {
    mockPayload.auth.mockResolvedValue({ user: { tenant: 'tenant1' } })

    // Mock database response
    const mockOrders = {
      docs: [
        {
          id: '1',
          totalAmount: 1000,
          advancePaid: 200,
          remainingPaid: 0,
          status: 'pending',
          customer: { name: 'John Doe' },
          orderDate: '2024-01-01',
        },
        {
          id: '2',
          totalAmount: 500,
          advancePaid: 500, // Fully paid
          remainingPaid: 0,
          status: 'pending',
        },
      ],
      page: 1,
      totalPages: 1,
      totalDocs: 2,
      limit: 50,
    }

    mockPayload.find.mockResolvedValue(mockOrders)

    const req = createRequest('/api/reports/pending-payments')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const data = await res.json()

    // Should filter out fully paid order (id: 2)
    expect(data.pendingPaymentCount).toBe(1)
    expect(data.orders).toHaveLength(1)
    expect(data.orders[0].id).toBe('1')
    expect(data.orders[0].dueAmount).toBe(800)
    expect(data.totalPendingAmount).toBe(800)
  })

  it('should call payload.find with correct pagination parameters', async () => {
    mockPayload.auth.mockResolvedValue({ user: { tenant: { id: 'tenant1' } } }) // Test with object tenant
    mockPayload.find.mockResolvedValue({ docs: [], page: 2, totalPages: 5 })

    const req = createRequest('/api/reports/pending-payments?page=2&limit=20')
    await GET(req)

    expect(mockPayload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 20,
        where: expect.objectContaining({
          and: expect.arrayContaining([expect.objectContaining({ tenant: { equals: 'tenant1' } })]),
        }),
      }),
    )
  })
})
