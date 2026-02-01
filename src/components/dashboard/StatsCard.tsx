import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'

interface StatsCardProps {
  title: string
  value: string | number | React.ReactNode
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  linkUrl?: string
  className?: string
  iconClassName?: string
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  linkUrl,
  className,
  iconClassName,
}) => {
  const content = (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-muted/60 bg-white/50 backdrop-blur-sm',
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground font-sans">
          {title}
        </CardTitle>
        <div
          className={cn(
            'p-2 rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground',
            iconClassName,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold font-heading tracking-tight">{value}</div>
        {(description || trend) && (
          <div className="flex items-center mt-1 space-x-2">
            {trend && (
              <span
                className={cn(
                  'flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full',
                  trend.direction === 'up' &&
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                  trend.direction === 'down' &&
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                )}
              >
                {trend.direction === 'up' ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : trend.direction === 'down' ? (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                ) : null}
                {trend.value}%
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (linkUrl) {
    return (
      <Link
        href={linkUrl}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
      >
        {content}
      </Link>
    )
  }

  return content
}
