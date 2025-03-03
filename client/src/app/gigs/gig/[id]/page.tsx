"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import Header from "@/components/global/Header"
import GigsSidebar from "@/components/gigs/GigsSidebar"
import GigHeader from "@/components/gigs/GigHeader"
import GigImageGallery from "@/components/gigs/GigImageGallery"
import GigTabs from "@/components/gigs/GigTabs"
import GigSidebar from "@/components/gigs/GigSidebar"
import { useAuthStore } from "@/store/authStore"
import type { Gig } from "@/app/gigs/types/gig"
import LoadingSkeleton from "@/components/gigs/LoadingSkeleton"

export default function GigDetailsPage() {
  const params = useParams()
  const gigId = params.id as string
  const [gig, setGig] = useState<Gig | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const router = useRouter()
  const { user } = useAuthStore()

  // Check if the current user is the owner of the gig
  const isOwner = user && gig?.userId === user.id

  useEffect(() => {
    const fetchGig = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8800/api/gigs/${gigId}`)
        if (!response.ok) throw new Error("Gig not found")
        const data = await response.json()
        setGig(data)
      } catch (error) {
        console.error(error)
        router.push("/404")
      } finally {
        setLoading(false)
      }
    }

    fetchGig()
  }, [gigId, router])

  useEffect(() => {
    // Only fetch likes and bookmarks if user is logged in and not the owner
    if (user && gig && !isOwner) {
      // Check if user has liked this gig
      const checkLikeStatus = async () => {
        try {
          const response = await fetch(`http://localhost:8800/api/gig-likes/${gigId}`)
          if (response.ok) {
            const data = await response.json()
            setIsLiked(data.isLiked || false)
          }
        } catch (error) {
          console.error("Error checking like status:", error)
        }
      }

      // Check if user has bookmarked this gig
      const checkBookmarkStatus = async () => {
        try {
          const response = await fetch(`http://localhost:8800/api/gig-bookmarks/${gigId}`)
          if (response.ok) {
            const data = await response.json()
            setIsBookmarked(data.isBookmarked || false)
          }
        } catch (error) {
          console.error("Error checking bookmark status:", error)
        }
      }

      checkLikeStatus()
      checkBookmarkStatus()
    }
  }, [gigId, user, gig, isOwner])

  const handleLike = async () => {
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(`/gigs/${gigId}`))
      return
    }

    try {
      const response = await fetch("http://localhost:8800/api/gig-likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gigId }),
        credentials: "include",
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        // Optionally refresh gig data to update like count
        if (gig) {
          setGig({
            ...gig,
            likes: isLiked ? (gig.likes || 1) - 1 : (gig.likes || 0) + 1,
          })
        }
      }
    } catch (error) {
      console.error("Error liking gig:", error)
    }
  }

  const handleBookmark = async () => {
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(`/gigs/${gigId}`))
      return
    }

    try {
      const response = await fetch("http://localhost:8800/api/gig-bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gigId }),
        credentials: "include",
      })

      if (response.ok) {
        setIsBookmarked(!isBookmarked)
      }
    } catch (error) {
      console.error("Error bookmarking gig:", error)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className=" min-h-screen flex">
          <GigsSidebar />
          <LoadingSkeleton />
        </div>
      </>
    )
  }

  if (!gig) return <div className="container py-10 text-center">Gig not found</div>

  return (
    <>
      <Header />
      <div className=" min-h-screen flex">
        <GigsSidebar />

        <div className="container py-8 px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Section - Gig Details */}
            <div className="lg:col-span-2 space-y-8">
              <GigHeader gig={gig} />

              <GigImageGallery
                gig={gig}  
                isLiked={isLiked}
                isBookmarked={isBookmarked}
                onLike={handleLike}
                onBookmark={handleBookmark}
                isOwner={isOwner || false}
              />

              <GigTabs gig={gig} isOwner={isOwner || false} />

            
            </div>

            {/* Right Sidebar - Pricing & Order */}
            <div className="lg:col-span-1">
              <GigSidebar gig={gig} isOwner={isOwner || false} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

