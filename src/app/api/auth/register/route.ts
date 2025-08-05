import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/db/user.model'
import { signAccessToken, signRefreshToken } from '@/lib/jwt'
import { registerSchema } from '@/lib/validations'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    
    // Parse and validate input
    const body = await req.json()
    const validatedData = registerSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }
    
    // Create new user (password will be hashed by pre-save middleware)
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
      password: validatedData.password
    })
    
    // Generate tokens
    const accessToken = signAccessToken({ id: user._id, role: user.role })
    const refreshToken = signRefreshToken({ id: user._id, role: user.role })
    
    // Update user with refresh token
    user.refreshTokens.push(refreshToken)
    user.lastLogin = new Date()
    await user.save()
    
    return NextResponse.json({
      user: user.toJSON(),
      accessToken,
      refreshToken,
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
