// ==================== SERVER COMPONENT ====================
// Server-side featured products with proper data fetching

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { productService } from '@/lib/services/product.service'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'

interface FeaturedProductsProps {
  limit?: number
  className?: string
}

export default async function FeaturedProducts({ limit = 4, className }: FeaturedProductsProps) {
  try {
    const products = await productService.getFeaturedProducts(limit)

    if (!products.length) {
      return null
    }

    return (
      <section className={className}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
              <p className="text-muted-foreground mt-2">
                Discover our handpicked selection of premium products
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    )
  } catch (error) {
    console.error('Failed to load featured products:', error)
    return null
  }
}

// Loading skeleton component
export function FeaturedProductsSkeleton() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
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
      </div>
    </section>
  )
}
