// ==================== PRODUCT SERVICE ====================
// Server-side product service with caching and optimization

import { apiService } from './api'
import { Product, Category, SearchParams, ApiResponse } from '@/types'

export class ProductService {
  private static instance: ProductService
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService()
    }
    return ProductService.instance
  }

  // Get all products with filtering and pagination
  async getProducts(params: SearchParams = {}): Promise<ApiResponse<Product[]>> {
    const cacheKey = `products_${JSON.stringify(params)}`
    const cached = this.getFromCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiService.get<Product[]>('/products', params)
    
    if (response.success) {
      this.setCache(cacheKey, response)
    }
    
    return response
  }

  // Get single product by ID
  async getProduct(id: string): Promise<Product> {
    const cacheKey = `product_${id}`
    const cached = this.getFromCache(cacheKey)
    
    if (cached) {
      return cached.data
    }

    const response = await apiService.get<Product>(`/products/${id}`)
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data)
      return response.data
    }
    
    throw new Error(response.error || 'Product not found')
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 4): Promise<Product[]> {
    const cacheKey = `featured_products_${limit}`
    const cached = this.getFromCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiService.get<Product[]>('/products/featured', { limit })
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data)
      return response.data
    }
    
    return []
  }

  // Get products by category
  async getProductsByCategory(category: string, params: SearchParams = {}): Promise<ApiResponse<Product[]>> {
    const searchParams = { ...params, category }
    return this.getProducts(searchParams)
  }

  // Search products
  async searchProducts(query: string, params: SearchParams = {}): Promise<ApiResponse<Product[]>> {
    const searchParams = { ...params, query }
    return this.getProducts(searchParams)
  }

  // Get related products
  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const cacheKey = `related_products_${productId}_${limit}`
    const cached = this.getFromCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiService.get<Product[]>(`/products/${productId}/related`, { limit })
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data)
      return response.data
    }
    
    return []
  }

  // Cache management
  private getFromCache(key: string): any {
    const cached = this.cache.get(key)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    
    this.cache.delete(key)
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clearCache(): void {
    this.cache.clear()
  }
}

// ==================== CATEGORY SERVICE ====================

export class CategoryService {
  private static instance: CategoryService
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_TTL = 10 * 60 * 1000 // 10 minutes

  static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService()
    }
    return CategoryService.instance
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    const cacheKey = 'categories'
    const cached = this.getFromCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiService.get<Category[]>('/categories')
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data)
      return response.data
    }
    
    return []
  }

  // Get single category
  async getCategory(id: string): Promise<Category> {
    const cacheKey = `category_${id}`
    const cached = this.getFromCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiService.get<Category>(`/categories/${id}`)
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data)
      return response.data
    }
    
    throw new Error(response.error || 'Category not found')
  }

  // Cache management
  private getFromCache(key: string): any {
    const cached = this.cache.get(key)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    
    this.cache.delete(key)
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const productService = ProductService.getInstance()
export const categoryService = CategoryService.getInstance()
