"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Share2, Pencil, Bookmark } from "lucide-react"
import type { Gig } from "@/app/gigs/types/gig"
import { useRouter } from "next/navigation"

interface GigImageGalleryProps {
  gig: Gig
  isLiked: boolean
  isBookmarked: boolean
  onLike: () => void
  onBookmark: () => void
  isOwner: boolean
}

export default function GigImageGallery({
  gig,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
  isOwner,
}: GigImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(gig.cover)
  const router = useRouter()

  const handleEditGig = () => {
    router.push(`/gigs/edit/${gig.id}`)
  }

  return (
    <Card className="overflow-hidden border-none shadow-sm">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={activeImage || gig.cover || "/placeholder.svg?height=500&width=800"}
            alt={gig.title}
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            {isOwner ? (
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={handleEditGig}
              >
                <Pencil className="h-5 w-5 text-gray-700" />
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                  onClick={onLike}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                  onClick={onBookmark}
                >
                  <Bookmark
                    className={`h-5 w-5 ${isBookmarked ? "fill-yellow-500 text-yellow-500" : "text-gray-700"}`}
                  />
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <Share2 className="h-5 w-5 text-gray-700" />
            </Button>
          </div>
        </div>

        {/* Thumbnails */}
        {gig.images && gig.images.length > 0 && gig.images[0] !== "" && (
          <div className="flex gap-2 p-4 overflow-x-auto">
            <div
              className={`h-16 w-16 rounded-md overflow-hidden cursor-pointer border-2 ${activeImage === gig.cover ? "border-primary" : "border-transparent"}`}
              onClick={() => setActiveImage(gig.cover)}
            >
              <img src={gig.cover || "/placeholder.svg"} alt="thumbnail" className="h-full w-full object-cover" />
            </div>
            {gig.images.map(
              (img, index) =>
                img && (
                  <div
                    key={index}
                    className={`h-16 w-16 rounded-md overflow-hidden cursor-pointer border-2 ${activeImage === img ? "border-primary" : "border-transparent"}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`thumbnail ${index}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

