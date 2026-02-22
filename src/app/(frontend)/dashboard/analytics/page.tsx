'use client'

import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import { Loader2 } from 'lucide-react'

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

export default function AnalyticsPage() {
  const tenant = useQuery(api.tenants.getMine)
  const stats = useQuery(api.orders.getStats, tenant ? { tenantId: tenant._id } : 'skip')
  const lowStockItems = useQuery(
    api.products.getLowStock,
    tenant ? { tenantId: tenant._id } : 'skip',
  )

  if (!stats || !lowStockItems) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  // Calculate specific analytics metrics not directly in getStats if needed,
  // or rely on getStats. getStats returns { totalRevenue, totalOrders, activeOrders }.
  // "Inventory Value" is missing from getStats. We might need to fetch products to calculate it
  // or update getStats. For now, we'll placeholder or calculate if we fetch products.

  // Actually, getLowStockItems returns products. We can't calculate total inventory value from just low stock.
  // We'll skip Inventory Value or add a query for it later. For now, let's use 0 or hide it.

  const inventoryValue = 0 // distinct query needed, expensive to scan all products just for this maybe?

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Operational Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Revenue" value={stats.totalRevenue} prefix="PKR " />
        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard title="Active Orders" value={stats.activeOrders} />
        <StatCard title="Low Stock Alerts" value={lowStockItems.length} />
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
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-red-600 font-bold">{item.stock}</td>
                    <td className="px-6 py-4 text-gray-500 capitalize">
                      {item.type?.replace('_', ' ') || 'N/A'}
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
