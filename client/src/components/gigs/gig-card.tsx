"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Star, Clock, Package, BadgeCheck, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"

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
  features: unknown // Changed to unknown to account for possible non-array types
  isLiked?: boolean
}



export function GigCard({ gig, showDescription = false }) {
  const { token } = useAuthStore()
  const [isLiked, setIsLiked] = useState<boolean>(gig.isLiked ?? false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Convert features to an array safely
  const featuresArray = Array.isArray(gig.features)
    ? gig.features
    : typeof gig.features === "string"
      ? [gig.features]
      : []

  // Fetch likes on mount
  useEffect(() => {
    const fetchLikes = async () => {
      if (!token) return
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
      const res = await fetch("http://localhost:8800/api/gig-toggles-likes", {
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

  // Calculate supply utilization percentage for progress bar
  const supplyPercentage = gig.supplyCapacity
    ? Math.min(100, Math.round((gig.minOrderQty / gig.supplyCapacity) * 100))
    : 0

  return (
    <Card
      className="w-full overflow-hidden h-full flex flex-col border border-neutral-200 dark:border-neutral-800 transition-all duration-300 hover:shadow-md rounded-xl bg-white dark:bg-black"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link href={`/gigs/gig/${gig.id}`} className="flex-grow flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-black">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          <Image
            src={gig.cover || "/placeholder.svg"}
            alt={gig.title || "Product image"}
            width={600}
            height={450}
            quality={90}
            loading="lazy"
            className={`object-cover w-full h-full transition-transform duration-700 ${
              isHovering ? "scale-110" : "scale-100"
            } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
          />
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-sm rounded-full z-10 transition-all duration-300 hover:scale-105 hover:shadow-md"
            onClick={handleLike}
          >
            <Heart
              className={`h-4 w-4 transition-colors duration-300 ${
                isLiked ? "fill-red-500 text-red-500" : "text-neutral-600 hover:text-red-400"
              }`}
            />
          </Button>
          {gig.category && (
            <Badge
              variant="secondary"
              className="absolute top-3 left-3 bg-white/90 hover:bg-white text-xs px-3 py-1 shadow-sm font-medium text-neutral-700 dark:text-neutral-800 rounded-full"
            >
              {gig.category.replace(/_/g, " ").toLowerCase()}
            </Badge>
          )}
          {gig.rating > 0 && (
            <div className="absolute bottom-3 left-3 bg-white/90 px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 text-amber-500">
              <Star className="h-3.5 w-3.5 fill-amber-500" />
              <span className="text-xs font-semibold">{gig.rating.toFixed(1)}</span>
              {gig.reviews > 0 && <span className="text-xs text-neutral-500">({gig.reviews})</span>}
            </div>
          )}
        </div>
        <CardContent className="p-5 flex-grow flex flex-col">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-200 mb-3 line-clamp-2 group-hover:text-primary transition-colors text-base">
            {gig.title}
          </h3>

          {showDescription && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">{gig.description}</p>
          )}

          <div className="flex flex-col gap-2.5 mb-4 mt-1 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                Delivery in{" "}
                <span className="font-semibold">
                  {gig.leadTime} day{gig.leadTime !== 1 ? "s" : ""}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                MOQ: <span className="font-semibold">{gig.minOrderQty}</span> units
              </span>
            </div>
            {gig.supplyCapacity && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  Supply: <span className="font-semibold">{gig.supplyCapacity}</span> units/month
                </span>
              </div>
            )}
          </div>
          <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800">
            {gig.supplyCapacity && (
              <div className="mb-3">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-neutral-500 dark:text-neutral-400">Supply Capacity</span>
                  <span className="font-medium">{supplyPercentage}%</span>
                </div>
                <Progress value={supplyPercentage} className="h-2 bg-neutral-100 dark:bg-neutral-800" />
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Bulk Price</p>
                <p className="font-bold text-xl text-neutral-900 dark:text-neutral-100">
                  ${gig.bulkPrice.toFixed(2)}
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 ml-1">per unit</span>
                </p>
              </div>
              <Button
                variant="default"
                size="sm"
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

