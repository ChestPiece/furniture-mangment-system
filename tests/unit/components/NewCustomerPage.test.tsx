import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import NewCustomerPage from '@/app/(frontend)/dashboard/customers/new/page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

global.fetch = vi.fn()

describe('NewCustomerPage', () => {
  it('renders form elements', () => {
    render(<NewCustomerPage />)
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add Customer/i })).toBeInTheDocument()
  })

  it('submits form correctly', async () => {
    const mockRouter = { push: vi.fn(), refresh: vi.fn() }
    const { useRouter } = await import('next/navigation')
    ;(useRouter as any).mockReturnValue(mockRouter)
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ id: '123' }),
    })

    render(<NewCustomerPage />)

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '1234567890' } })

    fireEvent.click(screen.getByRole('button', { name: /Add Customer/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/customers',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'John Doe', phone: '1234567890' }),
        }),
      )
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/customers')
    })
  })

  it('handles error display', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ errors: [{ message: 'API Error' }] }),
    })

    render(<NewCustomerPage />)

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John Doe' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Customer/i }))

    await waitFor(() => {
      expect(screen.getByText(/Failed to create customer/i)).toBeInTheDocument()
    })
  })
})
