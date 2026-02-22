import React from 'react'
import '@/app/(frontend)/styles.css'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Outfit, Inter } from 'next/font/google'
import { Toaster } from 'sonner'

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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

import ConvexClientProvider from '@/app/ConvexClientProvider'

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  // TODO: Fetch user from Convex Auth in AppSidebar or wrap Sidebar in a client component that does
  const user = {
    email: 'demo@example.com',
    roles: ['admin'],
  }
  const branding = null

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable}`}
      style={{ colorScheme: 'light dark' }}
    >
      <body className="bg-gray-50/50 font-sans antialiased text-slate-800">
        <ConvexClientProvider>
          <div className="flex min-h-screen">
            <AppSidebar user={user} branding={branding} />
            <main className="flex-1 w-full relative h-screen overflow-y-auto">
              <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 w-full">
                {children}
              </div>
            </main>
          </div>
          <Toaster />
        </ConvexClientProvider>
      </body>
    </html>
  )
}
