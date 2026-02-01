import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LucideIcon, PlusCircle } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  icon?: LucideIcon
  actionLabel?: string
  actionUrl?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  actionLabel,
  actionUrl,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg border-muted-foreground/25 bg-muted/50 h-[300px]',
        className,
      )}
    >
      {Icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background border border-border mb-4">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-sm">{description}</p>

      {actionLabel && (actionUrl || onAction) && (
        <div>
          {actionUrl ? (
            <Link href={actionUrl}>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button onClick={onAction}>
              <PlusCircle className="w-4 h-4 mr-2" />
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
