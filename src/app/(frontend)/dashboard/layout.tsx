import React from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
    </div>
  )
}
