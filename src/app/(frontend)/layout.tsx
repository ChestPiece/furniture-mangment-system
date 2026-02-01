import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Tenant, User } from '@/payload-types'
import Link from 'next/link'
import '@/app/(frontend)/styles.css'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Outfit, Inter } from 'next/font/google'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

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
          <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <h1 className="text-2xl font-bold text-red-600 mb-2">No Shop Assigned</h1>
              <p className="text-gray-600">This user account is not associated with any shop.</p>
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
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-gray-50/50 font-sans antialiased text-slate-800">
        <div className="flex min-h-screen">
          <AppSidebar
            user={{
              email: user.email,
              roles: user.roles || [], // Ensure roles is always an array
            }}
            branding={branding}
          />
          <main className="flex-1 w-full relative h-screen overflow-y-auto">
            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 w-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
