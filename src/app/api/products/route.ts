import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'

// Mock products data - replace with actual MongoDB models
const mockProducts = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 299.99,
    images: ['/headphones-1.jpg', '/headphones-2.jpg'],
    category: 'Electronics',
    inStock: true,
    rating: 4.5,
    reviews: 128,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Minimalist Watch',
    description: 'Elegant minimalist watch with leather strap',
    price: 199.99,
    images: ['/watch-1.jpg', '/watch-2.jpg'],
    category: 'Fashion',
    inStock: true,
    rating: 4.8,
    reviews: 89,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable organic cotton t-shirt in black',
    price: 29.99,
    images: ['/tshirt-1.jpg', '/tshirt-2.jpg'],
    category: 'Clothing',
    inStock: true,
    rating: 4.2,
    reviews: 256,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Smartphone Case',
    description: 'Durable smartphone case with premium finish',
    price: 49.99,
    images: ['/case-1.jpg', '/case-2.jpg'],
    category: 'Electronics',
    inStock: false,
    rating: 4.0,
    reviews: 67,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    
    let filteredProducts = mockProducts
    
    // Filter by category
    if (category) {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      )
    }
    
    // Filter by search
    if (search) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
    
    return NextResponse.json({
      products: paginatedProducts,
      total: filteredProducts.length,
      page,
      totalPages: Math.ceil(filteredProducts.length / limit),
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
} 