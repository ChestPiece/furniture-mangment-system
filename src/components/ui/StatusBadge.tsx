import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Truck, AlertCircle } from 'lucide-react'

export type StatusType =
  | 'pending'
  | 'in_progress'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'overdue'

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
    icon: <Clock className="w-3 h-3 mr-1" />,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
    icon: <Clock className="w-3 h-3 mr-1" />,
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
    icon: <Truck className="w-3 h-3 mr-1" />,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
    icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
    icon: <AlertCircle className="w-3 h-3 mr-1" />,
  },
  overdue: {
    label: 'Overdue',
    color: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
    icon: <AlertCircle className="w-3 h-3 mr-1" />,
  },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normalizedStatus = status?.toLowerCase() || 'pending'
  const config = statusConfig[normalizedStatus] || {
    label: status,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: null,
  }

  return (
    <Badge
      variant="outline"
      className={cn('capitalize font-medium flex items-center w-fit', config.color, className)}
    >
      {config.icon}
      {config.label}
    </Badge>
  )
}
