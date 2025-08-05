import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboard() {
  // TODO: Fetch admin dashboard data from API
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