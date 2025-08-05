import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Product from '@/db/product-model'

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '4')
    
    // Get featured products (you can modify this query based on your business logic)
    // For now, let's get the most recent products or add a 'featured' field to your schema
    const products = await Product.find({ featured: true })
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean()
    
    // If no featured products, fall back to recent products
    if (products.length === 0) {
      const fallbackProducts = await Product.find({})
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
      
      return NextResponse.json({
        success: true,
        data: fallbackProducts,
        message: 'Featured products retrieved successfully'
      })
    }
    
    return NextResponse.json({
      success: true,
      data: products,
      message: 'Featured products retrieved successfully'
    })
    
  } catch (error) {
    console.error('Featured products API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch featured products',
        message: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
