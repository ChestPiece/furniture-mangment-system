import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  linkUrl?: string
  className?: string
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  linkUrl,
  className,
}) => {
  const content = (
    <Card className={cn('hover:bg-muted/50 transition-colors', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {trend && (
              <span
                className={cn(
                  'flex items-center mr-2 font-medium',
                  trend.direction === 'up' && 'text-green-600',
                  trend.direction === 'down' && 'text-red-600',
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
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )

  if (linkUrl) {
    return (
      <Link href={linkUrl} className="block">
        {content}
      </Link>
    )
  }

  return content
}
