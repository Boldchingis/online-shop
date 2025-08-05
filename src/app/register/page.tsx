"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await register(name, email, password)
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        {error && <div className="rounded bg-red-100 p-2 text-sm text-red-700">{error}</div>}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full rounded border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </Button>
        <div className="text-center text-sm text-gray-600">
          Already have an account? <a href="/login" className="font-medium text-black hover:underline">Sign in</a>
        </div>
      </form>
    </div>
  )
} 