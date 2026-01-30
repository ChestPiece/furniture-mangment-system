'use client'

import React, { useState, useEffect } from 'react'

export default function ReportsPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dailyStats, setDailyStats] = useState<any>(null)
  const [pendingStats, setPendingStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [date])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const [salesRes, pendingRes] = await Promise.all([
        fetch(`/api/reports/daily-sales?date=${date}`),
        fetch(`/api/reports/pending-payments`),
      ])

      const salesData = await salesRes.json()
      const pendingData = await pendingRes.json()

      setDailyStats(salesData)
      setPendingStats(pendingData)
    } catch (err) {
      console.error('Failed to fetch reports', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      {/* Daily Sales Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Daily Sales</h2>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-9 border px-3"
          />
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <span className="block text-sm font-medium text-gray-500">Total Orders</span>
                <span className="block text-2xl font-bold text-gray-900">
                  {dailyStats?.totalOrders || 0}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <span className="block text-sm font-medium text-gray-500">Total Revenue</span>
                <span className="block text-2xl font-bold text-green-600">
                  {dailyStats?.totalSales || 0}
                </span>
              </div>
            </div>

            {dailyStats?.orders?.length > 0 && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dailyStats.orders.map((order: any) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Pending Payments Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Pending Payments</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-red-50 p-4 rounded-md">
                <span className="block text-sm font-medium text-red-800">Pending Orders</span>
                <span className="block text-2xl font-bold text-red-900">
                  {pendingStats?.pendingPaymentCount || 0}
                </span>
              </div>
              <div className="bg-red-50 p-4 rounded-md">
                <span className="block text-sm font-medium text-red-800">Total Amount Due</span>
                <span className="block text-2xl font-bold text-red-900">
                  {pendingStats?.totalPendingAmount || 0}
                </span>
              </div>
            </div>

            {pendingStats?.orders?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Amount
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingStats.orders.map((order: any) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.id.slice(-6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.totalAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                          {order.dueAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                          <a href={`/dashboard/orders/${order.id}`}>View</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No pending payments found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
