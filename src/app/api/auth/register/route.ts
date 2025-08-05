import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/db/user.model'
import { hashPassword } from '@/lib/auth'
import { signAccessToken, signRefreshToken } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }
    const hashed = await hashPassword(password)
    const user = await User.create({ name, email, password: hashed })
    const accessToken = signAccessToken({ id: user._id, role: user.role })
    const refreshToken = signRefreshToken({ id: user._id, role: user.role })
    return NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
} 