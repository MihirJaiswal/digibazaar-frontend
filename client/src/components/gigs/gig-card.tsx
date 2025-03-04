"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Seller {
  id: string
  username: string
  profilePicture: string
  level: string
}

interface Gig {
  id: string
  title: string
  description: string
  price: number
  rating: number
  reviews: number
  seller: Seller
  cover: string
  category: string
  tags: string[]
  deliveryTime: number
  isLiked?: boolean // Track if the gig is liked
}

interface GigCardProps {
  gig: Gig
  showDescription?: boolean
}

export function GigCard({ gig, showDescription = false }: GigCardProps) {
  const { token } = useAuthStore()
  const [isLiked, setIsLiked] = useState<boolean>(gig.isLiked ?? false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Fetch likes again on mount (ensuring likes persist after refresh)
  useEffect(() => {
    const fetchLikes = async () => {
      if (!token) return // Skip if user is not authenticated

      try {
        const res = await fetch("http://localhost:8800/api/gig-toggles-likes/gigs", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch liked gigs")

        const gigs: Gig[] = await res.json()
        const likedGig = gigs.find((g) => g.id === gig.id)
        setIsLiked(!!likedGig?.isLiked) // Update local state
      } catch (error) {
        console.error("Error fetching liked gigs:", error)
      }
    }

    fetchLikes()
  }, [gig.id, token])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!token) {
      toast.error("Please login to like a gig")
      return
    }

    try {
      const res = await fetch("http://localhost:8800/api/gig-toggles-likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gigId: gig.id }),
      })

      if (!res.ok) {
        throw new Error("Failed to toggle favorite")
      }

      // Toggle like state instantly for a better UX
      setIsLiked((prev) => !prev)
      toast.success(!isLiked ? "Added to favorites" : "Removed from favorites")
    } catch (error) {
      console.error("Error toggling like:", error)
      toast.error("An error occurred while updating favorites.")
    }
  }

  return (
    <Card className="overflow-hidden group h-full flex flex-col border-neutral-200 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
      <Link href={`/gigs/gig/${gig.id}`} className="flex-grow flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          {!imageLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}
          <img
            src={gig.cover || "/placeholder.svg"}
            alt={gig.title}
            className={`object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
          />
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-sm rounded-full opacity-90 hover:opacity-100 transition-all duration-200 z-10"
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-neutral-600"}`} />
          </Button>
          {gig.category && (
            <Badge
              variant="secondary"
              className="absolute top-3 left-3 bg-white/90 text-xs font-medium text-neutral-700"
            >
              {gig.category.replace(/_/g, " ").toLowerCase()}
            </Badge>
          )}
        </div>
        <CardContent className="p-5 flex-grow flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-neutral-200 bg-neutral-50">
              <img
                src={gig.seller?.profilePicture || "/placeholder.svg"}
                alt={gig.seller?.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">{gig.seller?.username}</p>
              <p className="text-xs text-neutral-500">{gig.seller?.level}</p>
            </div>
          </div>

          <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {gig.title}
          </h3>

          {showDescription && <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{gig.description}</p>}

          <div className="flex items-center gap-4 mt-auto mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
           {/*    <span className="text-sm font-medium text-neutral-900">{gig.rating.toFixed(1)}</span> */}
              <span className="text-xs text-neutral-500">({gig.reviews})</span>
            </div>

            <div className="flex items-center gap-1 text-neutral-600">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">{gig.deliveryTime} days</span>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100">
            <div className="flex justify-between items-center">
              <p className="text-xs text-neutral-500 font-medium">Starting at</p>
              <p className="font-bold text-lg text-neutral-900">${gig.price}</p>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

