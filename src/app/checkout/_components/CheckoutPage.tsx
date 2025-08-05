import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function CheckoutPage() {
  // TODO: Fetch checkout data from API or context
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