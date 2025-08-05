import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function OrderConfirmationPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="text-xl font-semibold">Thank you for your order!</p>
              <p className="text-gray-600 mt-2">
                Your order has been placed successfully. You will receive an email confirmation shortly.
              </p>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium mb-4">Order Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">#ORD-000001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">$0.00</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium mb-4">Next Steps</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>You will receive an email confirmation with your order details</li>
                <li>Our team will process your order and send shipping updates</li>
                <li>You can track your order status in your account dashboard</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button className="flex-1" onClick={() => window.location.href = '/'}>
                Continue Shopping
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/account/orders'}>
                View Order History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
