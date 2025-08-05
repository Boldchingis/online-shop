"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminUsersPage() {
  const { user, accessToken, loading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!accessToken) return
    setFetching(true)
    fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || [])
        setFetching(false)
      })
      .catch(() => {
        setError('Failed to fetch users')
        setFetching(false)
      })
  }, [accessToken])

  async function handleRoleChange(id: string, currentRole: string) {
    if (!accessToken) return
    setRoleLoading(id)
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ role: currentRole === 'admin' ? 'user' : 'admin' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to change role')
      setUsers(users => users.map(u => (u.id === id ? { ...u, role: data.user.role } : u)))
    } catch (err: any) {
      setError(err.message || 'Failed to change role')
    } finally {
      setRoleLoading(null)
    }
  }

  if (loading || fetching) {
    return <div className="flex min-h-screen items-center justify-center text-gray-600">Loading...</div>
  }
  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-600">{error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">User Management</h1>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white p-6 shadow">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 font-semibold text-gray-700">Name</th>
              <th className="px-4 py-2 font-semibold text-gray-700">Email</th>
              <th className="px-4 py-2 font-semibold text-gray-700">Role</th>
              <th className="px-4 py-2 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 capitalize">{u.role}</td>
                <td className="px-4 py-2">
                  {u.id !== user?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={roleLoading === u.id}
                      onClick={() => handleRoleChange(u.id, u.role)}
                    >
                      {roleLoading === u.id
                        ? 'Updating...'
                        : u.role === 'admin'
                        ? 'Make User'
                        : 'Make Admin'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 