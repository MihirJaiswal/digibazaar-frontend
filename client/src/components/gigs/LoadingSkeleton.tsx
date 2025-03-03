import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingSkeleton() {
  return (
    <div className="container py-8 px-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <Skeleton className="h-10 w-3/4 mb-4" />
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <Skeleton className="h-[400px] w-full rounded-lg" />

          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Skeleton className="h-[300px] w-full rounded-lg mb-6" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

