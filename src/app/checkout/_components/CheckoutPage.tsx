import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/providers'
import { useCart } from '@/lib/providers/cart-provider'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { cart, isLoading: cartLoading, totalItems, totalPrice } = useCart()
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout')
    }
  }, [authLoading, isAuthenticated, router])

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout')
      return
    }
    
    try {
      setIsPlacingOrder(true)
      // TODO: Implement actual order placement logic
      // This would typically call an API endpoint to create the order
      console.log('Placing order for user:', user)
      console.log('Cart items:', cart?.items)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to order confirmation page
      router.push('/order-confirmation')
    } catch (error) {
      console.error('Order placement failed:', error)
      // TODO: Show error message to user
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (authLoading || cartLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Order Summary</h3>
              <p className="text-gray-600">{totalItems} items in your cart</p>
              <p className="text-xl font-bold">Total: ${totalPrice.toFixed(2)}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Shipping Information</h3>
              {/* TODO: Add shipping form */}
              <p className="text-gray-600">User: {user?.name}</p>
              <p className="text-gray-600">Email: {user?.email}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Payment Information</h3>
              {/* TODO: Add payment form */}
              <p className="text-gray-600">Payment details will be collected securely</p>
            </div>
            
            <Button 
              onClick={handlePlaceOrder} 
              disabled={isPlacingOrder || totalItems === 0}
              className="w-full"
            >
              {isPlacingOrder ? 'Placing Order...' : `Place Order ($${totalPrice.toFixed(2)})`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 