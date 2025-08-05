"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Product } from "@/types"
import ProductCard from "@/components/ProductCard"
import SimplePagination from "@/components/SimplePagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const pageParam = searchParams.get('page') || "1"
  const searchParam = searchParams.get('search') || ""
  const categoryParam = searchParams.get('category') || ""

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(Number(pageParam))
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState(searchParam)
  const [category, setCategory] = useState(categoryParam)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/products?page=${page}&search=${encodeURIComponent(
            search
          )}&category=${encodeURIComponent(category)}`
        )
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [page, search, category])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/products?search=${encodeURIComponent(
      search
    )}&category=${encodeURIComponent(category)}`)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    router.push(`/products?page=${newPage}&search=${encodeURIComponent(
      search
    )}&category=${encodeURIComponent(category)}`)
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <form onSubmit={handleSearch} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-[200px] pl-8"
                />
              </div>
              <div className="w-[150px]">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Toys">Toys</SelectItem>
                    <SelectItem value="Books">Books</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Search</Button>
            </div>
          </form>
          {/* Product Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <Skeleton className="h-48 w-full rounded" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))
            ) : products.length === 0 ? (
              <div className="col-span-4 text-center text-gray-400">No products found.</div>
            ) : (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
          {/* Pagination */}
          <SimplePagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </section>
    </div>
  )
}

