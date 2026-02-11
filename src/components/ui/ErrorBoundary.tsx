'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorState } from './ErrorState'
import { Button } from './button'
import { RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-8">
          <ErrorState
            title="Something went wrong"
            message={this.state.error?.message || 'An unexpected error occurred.'}
            actionLabel="Try Again"
            onAction={this.handleReset}
          />
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Async error wrapper for server components
interface AsyncErrorBoundaryProps {
  children: ReactNode
}

export function AsyncErrorBoundary({ children }: AsyncErrorBoundaryProps) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}
