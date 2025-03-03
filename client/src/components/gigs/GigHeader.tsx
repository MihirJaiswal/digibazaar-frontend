import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Star, MapPin } from "lucide-react"
import type { Gig } from "@/app/gigs/types/gig"

interface GigHeaderProps {
  gig: Gig
}

export default function GigHeader({ gig }: GigHeaderProps) {
  // Calculate rating
  const rating = gig.totalStars > 0 ? (gig.totalStars / gig.starNumber).toFixed(1) : "New"

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">{gig.title}</h1>

      {/* Seller Quick Info */}
      <div className="flex items-center gap-3 mb-6">
        <Avatar className="h-8 w-8">
          <AvatarImage src={gig.user.profilePic || "/placeholder.svg?height=32&width=32"} alt={gig.user.username} />
          <AvatarFallback>{gig.user.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{gig.user.username}</span>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-400 mr-1 fill-yellow-400" />
          <span className="font-medium">{rating}</span>
          <span className="text-muted-foreground ml-1">({gig.starNumber})</span>
        </div>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{gig.user.country || "Not specified"}</span>
        </div>
      </div>
    </div>
  )
}

