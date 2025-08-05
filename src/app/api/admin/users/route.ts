import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/db/user.model'
import { withAuth } from '@/middleware/auth'

async function handler(req: NextRequest) {
  await dbConnect()
  const users = await User.find().select('-password')
  return NextResponse.json({ users })
}

export const GET = withAuth(handler, true) 