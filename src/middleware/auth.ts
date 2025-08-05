import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'

export const USER_SYMBOL = Symbol('user')

export function withAuth(handler: any, adminOnly = false) {
  return async (req: NextRequest, ...args: any[]) => {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    try {
      const payload = verifyAccessToken(token) as any
      if (adminOnly && payload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // Attach user info to request using a symbol
      ;(req as any)[USER_SYMBOL] = payload
      return handler(req, ...args)
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }
  }
} 