import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Truck, AlertCircle, RefreshCw } from 'lucide-react'

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
    color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100', // Soft Yellow
    icon: <Clock className="w-3 h-3 mr-1.5" />,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', // Soft Blue
    icon: <RefreshCw className="w-3 h-3 mr-1.5" />,
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100', // Soft Indigo
    icon: <Truck className="w-3 h-3 mr-1.5" />,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-50 text-green-700 hover:bg-green-100', // Soft Green
    icon: <CheckCircle2 className="w-3 h-3 mr-1.5" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-slate-100 text-slate-600 hover:bg-slate-200', // Soft Gray
    icon: <AlertCircle className="w-3 h-3 mr-1.5" />,
  },
  overdue: {
    label: 'Overdue',
    color: 'bg-red-50 text-red-700 hover:bg-red-100', // Soft Red
    icon: <AlertCircle className="w-3 h-3 mr-1.5" />,
  },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normalizedStatus = status?.toLowerCase() || 'pending'
  // Fallback for unknown statuses
  const config = statusConfig[normalizedStatus] || {
    label: status,
    color: 'bg-slate-50 text-slate-700',
    icon: null,
  }

  return (
    <Badge
      variant="secondary" // Use secondary to remove border default in some themes, but we override class
      className={cn(
        'rounded-full px-2.5 py-0.5 font-medium border-0 shadow-none hover:shadow-none transition-colors cursor-default',
        config.color,
        className,
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  )
}
