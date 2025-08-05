import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/db/user.model'
import { withAuth } from '@/middleware/auth'

async function handler(req: NextRequest, { params }: { params: { id: string } }) {
  if (req.method !== 'PATCH') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }
  await dbConnect()
  const { id } = params
  const { role } = await req.json()
  if (!['user', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password')
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  return NextResponse.json({ user })
}

export const PATCH = withAuth(handler, true) 