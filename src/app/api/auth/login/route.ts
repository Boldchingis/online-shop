import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/db/user.model'
import { signAccessToken, signRefreshToken } from '@/lib/jwt'
import { loginSchema } from '@/lib/validations'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    
    // Parse and validate input
    const body = await req.json()
    const validatedData = loginSchema.parse(body)
    
    // Find user by email
    const user = await User.findOne({ email: validatedData.email.toLowerCase() })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 })
    }
    
    // Verify password
    const isValidPassword = await user.comparePassword(validatedData.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    // Generate tokens
    const accessToken = signAccessToken({ id: user._id, role: user.role })
    const refreshToken = signRefreshToken({ id: user._id, role: user.role })
    
    // Update user login info
    user.lastLogin = new Date()
    user.refreshTokens.push(refreshToken)
    // Keep only last 5 refresh tokens
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5)
    }
    await user.save()
    
    return NextResponse.json({
      user: user.toJSON(),
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
