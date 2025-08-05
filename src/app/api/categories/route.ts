import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Category from '@/db/category.model'
import { createCategorySchema, paginationSchema } from '@/lib/validations'
import { withAuth } from '@/middleware/auth'
import { z } from 'zod'

async function getCategories(req: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(req.url)
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    })
    
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const parentCategory = searchParams.get('parentCategory')
    
    // Build query
    let query: any = {}
    if (!includeInactive) {
      query.isActive = true
    }
    if (parentCategory) {
      query.parentCategory = parentCategory === 'null' ? null : parentCategory
    }
    
    // Get total count
    const total = await Category.countDocuments(query)
    
    // Get categories with pagination
    const categories = await Category.find(query)
      .populate('parentCategory', 'name slug')
      .populate('subcategories')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
    
    return NextResponse.json({
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get categories error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

async function createCategory(req: NextRequest) {
  try {
    await dbConnect()
    
    const body = await req.json()
    const validatedData = createCategorySchema.parse(body)
    
    // Check if category name already exists
    const existingCategory = await Category.findOne({ name: validatedData.name })
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      )
    }
    
    // Validate parent category if provided
    if (validatedData.parentCategory) {
      const parentExists = await Category.findById(validatedData.parentCategory)
      if (!parentExists) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 404 }
        )
      }
    }
    
    const category = await Category.create(validatedData)
    await category.populate('parentCategory', 'name slug')
    
    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Create category error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

export const GET = getCategories
export const POST = withAuth(createCategory, true) // Admin only
