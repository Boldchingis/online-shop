import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Product from '@/db/product.model'
import { withAuth } from '@/middleware/auth'

async function handler(req: NextRequest) {
  await dbConnect()
  if (req.method === 'GET') {
    const products = await Product.find()
    return NextResponse.json({ products })
  }
  if (req.method === 'POST') {
    const data = await req.json()
    const product = await Product.create(data)
    return NextResponse.json({ product })
  }
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export const GET = withAuth(handler, true)
export const POST = withAuth(handler, true) 