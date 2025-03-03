"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, RefreshCw, CheckCircle, MessageSquare, Edit, Trash2 } from "lucide-react"
import type { Gig } from "@/app/gigs/types/gig"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface GigSidebarProps {
  gig: Gig
  isOwner: boolean
}

export default function GigSidebar({ gig, isOwner }: GigSidebarProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  // Format date
  const memberSince = new Date(gig.user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  })

  const handleEditGig = () => {
    router.push(`/gigs/edit/${gig.id}`)
  }

  const handleDeleteGig = async () => {
    if (!confirm("Are you sure you want to delete this gig? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`http://localhost:8800/api/gigs/${gig.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        router.push("/dashboard/gigs")
      } else {
        throw new Error("Failed to delete gig")
      }
    } catch (error) {
      console.error("Error deleting gig:", error)
      alert("Failed to delete gig. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="sticky top-4 space-y-6">
      {isOwner ? (
        <Card className="border-primary/20 shadow-md">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">Manage Your Gig</h2>

            <div className="space-y-4">
              <Button className="w-full" onClick={handleEditGig}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Gig
              </Button>

              <Button variant="destructive" className="w-full" onClick={handleDeleteGig} disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete Gig"}
              </Button>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
                <p className="font-medium">Gig Statistics</p>
                <ul className="mt-2 space-y-1">
                  <li>Views: 124</li>
                  <li>Orders: {gig.sales}</li>
                  <li>Conversion Rate: {gig.sales > 0 ? ((gig.sales / 124) * 100).toFixed(1) + "%" : "0%"}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/20 shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Standard Package</h2>
              <span className="text-2xl font-bold text-primary">${gig.price}</span>
            </div>

            <p className="text-muted-foreground mb-6">{gig.shortDesc}</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-muted-foreground mr-3" />
                <span>
                  {gig.deliveryTime} day{gig.deliveryTime !== 1 ? "s" : ""} delivery
                </span>
              </div>
              <div className="flex items-center">
                <RefreshCw className="h-5 w-5 text-muted-foreground mr-3" />
                <span>
                  {gig.revisionNumber} revision{gig.revisionNumber !== 1 ? "s" : ""}
                </span>
              </div>

              {gig.features && gig.features.filter((f) => f).length > 0 && (
                <>
                  {gig.features.map(
                    (feature, index) =>
                      feature && (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ),
                  )}
                </>
              )}
            </div>

            <Button className="w-full bg-primary hover:bg-primary/90 text-white mb-3">Continue (${gig.price})</Button>

            <Button variant="outline" className="w-full">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Seller
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Seller Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={gig.user.profilePic || "/placeholder.svg?height=48&width=48"} alt={gig.user.username} />
              <AvatarFallback>{gig.user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{gig.user.username}</h3>
              <p className="text-sm text-muted-foreground">
                {gig.user.country ? `${gig.user.country} • ` : ""}
                Member since {memberSince}
              </p>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => router.push(`/profile/${gig.user.id}`)}>
            View Profile
          </Button>
        </CardContent>
      </Card>

      {/* Trust & Safety */}
      {!isOwner && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-3 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            Trust & Safety
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
              <span>Secure Payments</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
              <span>Privacy Protected</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
              <span>24/7 Customer Support</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

// Shield component
function Shield(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  )
}

