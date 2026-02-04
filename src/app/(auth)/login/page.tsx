'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Loader2, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const LoginPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || ''}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await res.json()

      if (res.ok && data.user) {
        if (data.user.roles?.includes('admin')) {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
        router.refresh()
      } else {
        setError(data.errors?.[0]?.message || 'Invalid email or password')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 relative">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] -z-10 bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,transparent,black)]" />

        <div className="flex flex-col items-center">
          <div className="rounded-xl bg-primary/10 p-3 mb-6 ring-1 ring-primary/20 shadow-sm">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900 font-heading">
            Furniture Shop
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
            Enter your credentials to access the management dashboard.
          </p>
        </div>

        <Card className="border-border/60 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl text-center font-medium">Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-white/50"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-white/50"
                />
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full shadow-md hover:shadow-lg transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-center text-sm text-gray-500 pt-2 pb-6">
            <div className="text-center text-xs text-muted-foreground">
              Powered by Payload CMS & Next.js
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
