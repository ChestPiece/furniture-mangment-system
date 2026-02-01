import React from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ErrorStateProps {
  title?: string
  message?: string
  actionLabel?: string
  actionUrl?: string
  onAction?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'There was an error loading this content. Please try again.',
  actionLabel,
  actionUrl,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-red-200 bg-red-50 h-[300px]">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
        <AlertCircle className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-red-900 tracking-tight">{title}</h3>
      <p className="text-sm text-red-800 mt-2 mb-6 max-w-sm">{message}</p>

      {actionLabel && (actionUrl || onAction) && (
        <div>
          {actionUrl ? (
            <Link href={actionUrl}>
              <Button variant="destructive">{actionLabel}</Button>
            </Link>
          ) : (
            <Button variant="destructive" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
