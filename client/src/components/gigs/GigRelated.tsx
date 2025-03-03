"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import type { Gig } from "@/app/gigs/types/gig"
import { useRouter } from "next/navigation"

interface GigRelatedProps {
  gig: Gig
}

export default function GigRelated({ gig }: GigRelatedProps) {
  const router = useRouter()

  const handleGigClick = (id: string) => {
    router.push(`/gigs/${id}`)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">You might also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map((item) => (
          <Card
            key={item}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleGigClick(`related-${item}`)}
          >
            <div className="h-40 overflow-hidden">
              <img
                src={`/placeholder.svg?height=160&width=320&text=Related+Gig+${item}`}
                alt={`Related gig ${item}`}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium truncate">Similar {gig.category.replace("_", " ")} Service</h3>
              <div className="flex items-center mt-2">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="text-sm">4.8</span>
                <span className="text-sm text-muted-foreground ml-1">(24)</span>
                <span className="ml-auto font-semibold">${Math.round(gig.price * (item === 1 ? 0.9 : 1.1))}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

