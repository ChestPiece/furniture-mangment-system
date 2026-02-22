'use client'

import React, { useState } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { signIn } = useAuthActions()
  const [step, setStep] = useState<'signIn' | 'signUp'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn('password', { email, password, flow: step })
    } catch (err) {
      setError('Authentication failed')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center">
          {step === 'signIn' ? 'Sign In' : 'Sign Up'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {step === 'signIn' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button variant="link" onClick={() => setStep(step === 'signIn' ? 'signUp' : 'signIn')}>
            {step === 'signIn'
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </Button>
        </div>
      </div>
    </div>
  )
}
