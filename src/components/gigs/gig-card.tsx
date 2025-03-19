"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Star, Clock, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Seller {
  id: string
  username: string
  profilePic: string
  level: string
}

interface Gig {
  id: string
  title: string
  description: string
  bulkPrice: number
  rating: number
  reviews: number
  seller: Seller
  cover: string
  category: string
  leadTime: number
  minOrderQty: number
  supplyCapacity?: number
  features: unknown
  isLiked?: boolean
}

interface GigCardProps {
  gig: Gig
  showDescription?: boolean
}

export function GigCard({ gig, showDescription = false }) {
  const { token } = useAuthStore()
  const [isLiked, setIsLiked] = useState<boolean>(gig.isLiked ?? false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Fetch likes on mount
  useEffect(() => {
    const fetchLikes = async () => {
      if (!token) return
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gig-toggles-likes/gigs`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch liked gigs")
        const gigs: Gig[] = await res.json()
        const likedGig = gigs.find((g) => g.id === gig.id)
        setIsLiked(!!likedGig?.isLiked)
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
      toast.error("Please login to like a listing")
      return
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gig-toggles-likes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gigId: gig.id }),
      })
      if (!res.ok) throw new Error("Failed to toggle favorite")
      setIsLiked((prev) => !prev)
      toast.success(!isLiked ? "Added to favorites" : "Removed from favorites")
    } catch (error) {
      console.error("Error toggling like:", error)
      toast.error("An error occurred while updating favorites.")
    }
  }

  return (
    <Card
      className="w-full overflow-hidden h-full flex flex-col border-border/40 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link href={`/gigs/gig/${gig.id}`} className="flex-grow flex flex-col">
        <div className="relative aspect-video overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          <Image
            src={gig.cover || "/placeholder.svg?height=400&width=600"}
            alt={gig.title || "Product image"}
            width={600}
            height={400}
            quality={85}
            priority={true}
            className={`object-cover w-full h-full transition-transform duration-700 ${
              isHovering ? "scale-110" : "scale-100"
            } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
          />
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 bg-background/90 hover:bg-background shadow-sm rounded-full z-10 transition-all duration-300 hover:scale-105"
            onClick={handleLike}
          >
            <Heart
              className={`h-4 w-4 transition-colors duration-300 ${
                isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-400"
              }`}
            />
          </Button>
          {gig.category && (
            <Badge
              variant="secondary"
              className="absolute top-3 left-3 bg-background/90 hover:bg-background text-xs px-2.5 py-0.5 shadow-sm font-medium text-foreground/80 rounded-full"
            >
              {gig.category.replace(/_/g, " ").toLowerCase()}
            </Badge>
          )}
        </div>

        <CardContent className="p-4 flex-grow flex flex-col">
          {/* Seller info */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={gig.seller?.profilePic} alt={gig.seller?.username} />
              <AvatarFallback>{gig.seller?.username?.charAt(0) || "S"}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-muted-foreground">{gig.seller?.username || "Seller"}</span>
            {gig.rating > 0 && (
              <div className="ml-auto flex items-center gap-1 text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-500" />
                <span className="text-xs font-semibold">{gig.rating.toFixed(1)}</span>
                {gig.reviews > 0 && <span className="text-xs text-muted-foreground">({gig.reviews})</span>}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 text-base">{gig.title}</h3>

          {/* Description - only if showDescription is true */}
          {showDescription && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{gig.description}</p>}

          {/* Key details */}
          <div className="flex flex-wrap gap-3 mt-auto pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">
                {gig.leadTime} day{gig.leadTime !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Min: {gig.minOrderQty} units</span>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground">Price per unit</p>
              <p className="font-bold text-lg text-foreground">₹{gig.bulkPrice.toFixed(2)}</p>
            </div>
            <Button variant="default" size="sm" className="rounded-full px-4">
              View
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

