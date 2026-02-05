import React from 'react'
import { getDashboardStats } from '@/actions/reports'
import { getLowStockItems } from '@/actions/lowStock'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

// Helper to get tenant
const getTenant = async () => {
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })

  // Simplification: In a real app we'd resolve tenant from host or cookie properly.
  // For now, let's assume we are testing and might need to fetch the first active tenant
  // OR we rely on the implementation assuming this page is protected and we can extract user tenant.

  // BUT since this is a Server Component, getting the User's tenant is tricky if we use standard Payload Auth
  // without passing requests.
  // Let's use a "Hardcoded" or "First Found" approach for the MVP demo if Auth isn't fully wired to Server Components.
  // BETTER: Check currentUser.

  const { user } = await payload.auth({ headers: headersList })
  if (user?.tenant) return typeof user.tenant === 'string' ? user.tenant : user.tenant.id
  return null
}

const StatCard = ({
  title,
  value,
  prefix = '',
  suffix = '',
}: {
  title: string
  value: string | number
  prefix?: string
  suffix?: string
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
    <p className="text-3xl font-bold mt-2 text-gray-900">
      {prefix}
      {typeof value === 'number' ? value.toLocaleString() : value}
      {suffix}
    </p>
  </div>
)

export default async function AnalyticsPage() {
  const tenantId = await getTenant()

  if (!tenantId) {
    return <div className="p-8">Please log in to view analytics.</div>
  }

  const stats = await getDashboardStats({ tenantId })
  const lowStockItems = await getLowStockItems({ tenantId })

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Operational Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Revenue" value={stats.totalRevenue} prefix="PKR " />
        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard title="Inventory Value" value={stats.inventoryValue} prefix="PKR " />
        <StatCard title="Low Stock Alerts" value={stats.lowStockCount} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Low Stock Attention Required</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Current Stock</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-red-600 font-bold">{item.stock}</td>
                    <td className="px-6 py-4 text-gray-500 capitalize">
                      {item.type?.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Create PO
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                    All stock levels are healthy!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
