'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from './skeleton'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientOnly({ children, fallback }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return fallback || <Skeleton className="h-10 w-full" />
  }

  return <>{children}</>
}
