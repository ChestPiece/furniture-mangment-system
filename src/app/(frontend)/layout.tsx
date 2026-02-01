import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Tenant, User } from '@/payload-types'
import Link from 'next/link'
import './styles.css'

export const metadata = {
  description: 'Furniture Shop Management System',
  title: 'Furniture Shop Dashboard',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = (await payload.auth({ headers: headersList })) as { user: User | null }

  if (!user) {
    redirect('/admin/login')
  }

  // Ensure user has a tenant or is an admin
  if (!user.tenant && !user.roles?.includes('admin')) {
    return (
      <html lang="en">
        <body>
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600">No Shop Assigned</h1>
              <p className="mt-2 text-gray-600">
                This user account is not associated with any shop.
              </p>
            </div>
          </div>
        </body>
      </html>
    )
  }

  // Fetch tenant branding if user has a tenant
  let branding: Tenant | null = null
  if (user.tenant) {
    const tenant =
      typeof user.tenant === 'object'
        ? user.tenant
        : await payload.findByID({
            collection: 'tenants',
            id: user.tenant as string,
          })
    branding = tenant
  }

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    {(branding?.logo && (
                      <span className="font-bold text-xl">{branding.name}</span>
                    )) || <span className="font-bold text-xl">Furniture Shop</span>}
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link
                      href="/"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <a
                      href="/dashboard/orders"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Orders
                    </a>
                    <a
                      href="/dashboard/customers"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Customers
                    </a>
                    <a
                      href="/dashboard/reports"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Reports
                    </a>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 mr-4">
                    {user.email} ({user.roles?.join(', ')})
                  </span>
                  <Link href="/admin/logout" className="text-sm text-red-600 hover:text-red-900">
                    {' '}
                    Logout
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <main className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
