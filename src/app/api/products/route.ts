import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Product from '@/db/product-model'

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    
    // Build MongoDB query
    let query: any = {}
    
    // Filter by category
    if (category) {
      query.category = new RegExp(category, 'i')
    }
    
    // Filter by search
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ]
    }
    
    // Get total count for pagination
    const total = await Product.countDocuments(query)
    
    // Get products with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
    
    // Transform MongoDB _id to id for frontend compatibility
    const transformedProducts = products.map(product => ({
      ...product,
      id: product._id.toString(),
      _id: undefined
    }))
    
    return NextResponse.json({
      products: transformedProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
