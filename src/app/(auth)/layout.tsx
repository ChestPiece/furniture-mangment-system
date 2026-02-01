import React from 'react'
import '../(frontend)/styles.css'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">{children}</div>
      </body>
    </html>
  )
}
