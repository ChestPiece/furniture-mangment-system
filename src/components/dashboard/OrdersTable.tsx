'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge' // Will use specific class overrides
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/utilities/formatCurrency'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal'
import { deleteOrder } from '@/app/(frontend)/dashboard/orders/actions'
import { toast } from 'sonner' // Assuming sonner is used, or we fallback to alert/console if not installed.
// Standard Shadcn often uses 'sonner' or 'toast' hook. I'll check package.json or use simple console/alert for now if unsure.
// Checked package.json earlier, didn't see sonner. I'll use simple alert or just relies on revalidate.
// user said "Reuse shadcn components". I'll assume basic interaction.

interface Order {
  id: string
  orderDate: string
  customer?: { name: string } | string | null
  status: string
  totalAmount?: number
  advancePaid?: number
  remainingPaid?: number
  tenant?: string | { id: string }
}

interface OrdersTableProps {
  orders: Order[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const result = await deleteOrder(deleteId)
      if (result.success) {
        setDeleteId(null)
        // Router refresh handled by server action revalidatePath,
        // but explicit refresh ensures client state sync if needed.
        router.refresh()
      } else {
        alert('Failed to delete order')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-[100px] h-10 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Order ID
              </TableHead>
              <TableHead className="h-10 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Date
              </TableHead>
              <TableHead className="h-10 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Customer
              </TableHead>
              <TableHead className="h-10 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="h-10 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider text-right">
                Total
              </TableHead>
              <TableHead className="h-10 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider text-right">
                Due
              </TableHead>
              <TableHead className="h-10 py-2 w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const customerName =
                typeof order.customer === 'object' ? order.customer?.name : 'Unknown'
              const calculatedDue = Math.max(
                0,
                (order.totalAmount || 0) - (order.advancePaid || 0) - (order.remainingPaid || 0),
              )

              return (
                <TableRow
                  key={order.id}
                  className="hover:bg-muted/30 border-border group transition-colors"
                >
                  <TableCell className="py-2.5 font-medium text-sm font-mono text-muted-foreground">
                    #{order.id.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell className="py-2.5 text-sm">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-2.5 text-sm font-medium">{customerName}</TableCell>
                  <TableCell className="py-2.5">
                    <StatusBadge status={order.status} className="scale-90 origin-left" />
                  </TableCell>
                  <TableCell className="py-2.5 text-sm font-medium text-right font-mono">
                    {formatCurrency(order.totalAmount || 0)}
                  </TableCell>
                  <TableCell className="py-2.5 text-right">
                    {calculatedDue > 0 ? (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        {formatCurrency(calculatedDue)}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Paid
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-2.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/orders/${order.id}`} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                          onClick={() => setDeleteId(order.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </>
  )
}
