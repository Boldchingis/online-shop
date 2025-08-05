// ==================== SERVER COMPONENT ====================
// Server-side product grid with proper data fetching

import { Suspense } from 'react'
import { productService } from '@/lib/services/product.service'
import { SearchParams } from '@/types'
import ProductCard from '@/components/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'

interface ProductGridProps {
  searchParams?: SearchParams
  className?: string
}

export default async function ProductGrid({ searchParams = {}, className }: ProductGridProps) {
  try {
    const response = await productService.getProducts(searchParams)
    
    if (!response.success || !response.data) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )
    }

    const { data: products, pagination } = response

    return (
      <div className={className}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {pagination && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Showing {products.length} of {pagination.total} products
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Failed to load products:', error)
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load products</p>
      </div>
    )
  }
}

// Loading skeleton component
export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
