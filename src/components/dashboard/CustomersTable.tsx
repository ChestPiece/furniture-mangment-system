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
import { MoreHorizontal, Pencil, Trash2, Users } from 'lucide-react'
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal'
import { deleteCustomer } from '@/app/(frontend)/dashboard/customers/actions'

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  createdAt: string
  tenant?: string | { id: string }
}

interface CustomersTableProps {
  customers: Customer[]
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const result = await deleteCustomer(deleteId)
      if (result.success) {
        setDeleteId(null)
        router.refresh()
      } else {
        alert('Failed to delete customer. Ensure they have no active orders.')
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
              <TableHead className="py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Customer Name
              </TableHead>
              <TableHead className="py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Phone
              </TableHead>
              <TableHead className="py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Email
              </TableHead>
              <TableHead className="py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Joined On
              </TableHead>
              <TableHead className="py-2 w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow
                key={customer.id}
                className="hover:bg-muted/30 border-border group transition-colors"
              >
                <TableCell className="py-2.5 font-medium text-sm">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary">
                      <Users className="h-4 w-4" />
                    </div>
                    {customer.name}
                  </div>
                </TableCell>
                <TableCell className="py-2.5 text-sm">{customer.phone}</TableCell>
                <TableCell className="py-2.5 text-sm text-muted-foreground">
                  {customer.email || '-'}
                </TableCell>
                <TableCell className="py-2.5 text-sm text-muted-foreground">
                  {new Date(customer.createdAt).toLocaleDateString()}
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
                        <Link
                          href={`/dashboard/customers/${customer.id}`}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                        onClick={() => setDeleteId(customer.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No customers found.
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
        title="Delete Customer"
        description="Are you sure? This will delete the customer profile. Orders linked to this customer might effectively become orphaned or display as 'Unknown'."
        isDeleting={isDeleting}
      />
    </>
  )
}
