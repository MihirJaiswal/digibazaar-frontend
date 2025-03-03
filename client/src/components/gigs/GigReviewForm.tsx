"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import type { Review } from "@/app/gigs/types/gig"

interface GigReviewFormProps {
  gigId: string
  onSubmit: (review: Review) => void
  onCancel: () => void
}

export default function GigReviewForm({ gigId, onSubmit, onCancel }: GigReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return
    if (rating === 0) return // Require a rating

    setIsSubmitting(true)

    try {
      const response = await fetch("http://localhost:8800/api/gig-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gigId,
          rating,
          comment,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to submit review")
      }

      const data = await response.json()

      // Create a review object to pass back to parent
      const newReview: Review = {
        id: data.id,
        userId: user.id,
        gigId,
        rating,
        comment,
        createdAt: new Date().toISOString(),
        user: {
          username: user.username,
          profilePic: user.profilePic || "",
        },
      }

      onSubmit(newReview)
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h3 className="font-semibold mb-4">Write a Review</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer ${
                    (hoverRating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block mb-2">
              Your Review
            </label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this service..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={rating === 0 || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

