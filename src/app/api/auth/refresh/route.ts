import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/jwt'
import dbConnect from '@/lib/db'
import User from '@/db/user.model'

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json()
    if (!refreshToken) {
      return NextResponse.json({ error: 'Missing refresh token' }, { status: 400 })
    }
    let payload: any
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
    }
    await dbConnect()
    const user = await User.findById(payload.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const newAccessToken = signAccessToken({ id: user._id, role: user.role })
    const newRefreshToken = signRefreshToken({ id: user._id, role: user.role })
    return NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 })
  }
} 