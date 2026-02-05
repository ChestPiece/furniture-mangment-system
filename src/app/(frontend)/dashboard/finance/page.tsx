import Link from 'next/link'
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { Button } from '@/components/ui/button'
import { Wallet, PlusCircle } from 'lucide-react'
import { ErrorState } from '@/components/ui/ErrorState'
import { Pagination } from '@/components/ui/Pagination'

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || !user.tenant) {
    return (
      <ErrorState
        title="Unauthorized Access"
        message="You must be logged in and associated with a shop to view financial records."
        actionLabel="Return to Dashboard"
        actionUrl="/dashboard"
      />
    )
  }

  // Placeholder query for expenses or similar financial records
  const resolvedParams = await searchParams
  const page = typeof resolvedParams.page === 'string' ? Number(resolvedParams.page) : 1

  const { docs: expenses, totalPages } = await payload.find({
    collection: 'expenses',
    where: {
      tenant: {
        equals: user.tenant,
      },
    },
    sort: '-createdAt',
    depth: 1,
    limit: 10,
    page,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
        <Button asChild>
          <Link href="/dashboard/finance/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Record Expense
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <div className="bg-muted p-4 rounded-full mb-3">
              <Wallet className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-1">No financial records</h3>
            <p className="max-w-xs mx-auto mb-4">Track your shop's expenses and income here.</p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/finance/new">Record Expense</Link>
            </Button>
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {expenses.map((expense: any) => (
                  <tr
                    key={expense.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-middle">{expense.description || expense.category}</td>
                    <td className="p-4 align-middle text-red-600">
                      -${expense.amount?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination totalPages={totalPages} />
    </div>
  )
}
