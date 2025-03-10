"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Edit2, Trash2 } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import type { Review } from "@/app/gigs/types/gig"
import { useRouter } from "next/navigation"
import Image from "next/image"
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
  const [existingReviews, setExistingReviews] = useState<Review[]>([])
  const [existingStarCount, setExistingStarCount] = useState(0)
  const [userHasReviewed, setUserHasReviewed] = useState(false)
  const [existingUserReview, setExistingUserReview] = useState<Review | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const { user, token } = useAuthStore()
  const router = useRouter()
  // Fetch existing reviews and star count when component mounts
  useEffect(() => {
    if (gigId) {
      fetchReviews()
      fetchStarCount()
    }
  }, [gigId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:8800/api/gig-reviews/${gigId}`, {
        headers: {
          "Content-Type": "application/json",
        }
      });
  
      if (response.ok) {
        const data = await response.json();
        const formattedReviews = data.map((review: any) => ({
          id: review.id,
          userId: review.userId,
          gigId: review.gigId,
          rating: review.star,
          comment: review.content,
          createdAt: review.createdAt,
          user: review.user
        }));
        
        setExistingReviews(formattedReviews);
  
        // Check if current user has already reviewed
        if (user) {
          const userReview = formattedReviews.find((review: Review) => review.userId === user.id);
          if (userReview) {
            setUserHasReviewed(true);
            setExistingUserReview(userReview);
            
            // Pre-fill form if in editing mode
            if (isEditing) {
              setRating(userReview.rating);
              setComment(userReview.comment);
            }
          } else {
            setUserHasReviewed(false);
            setExistingUserReview(null);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchStarCount = async () => {
    try {
      const response = await fetch(`http://localhost:8800/api/gig-stars/count/${gigId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      })

      if (response.ok) {
        const data = await response.json()
        setExistingStarCount(data.starCount)
      }
    } catch (error) {
      console.error("Error fetching star count:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return
    if (rating === 0) return // Require a rating

    setIsSubmitting(true)

    try {
      // 1. Submit the gig review using the POST endpoint
      const reviewResponse = await fetch("http://localhost:8800/api/gig-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          gigId,
          star: rating,
          content: comment,
        }),
        credentials: "include",
      })

      if (!reviewResponse.ok) {
        throw new Error("Failed to submit review")
      }

      const reviewData = await reviewResponse.json()

      // 2. Add the star rating via the gig-stars/add endpoint
      const starResponse = await fetch("http://localhost:8800/api/gig-stars/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          gigId,
          star: rating,
          // The userId is extracted from the token on the server
        }),
        credentials: "include",
      })


      if (!starResponse.ok) {
        throw new Error("Failed to add star rating")
      }

      // Construct a new review object to pass back to the parent component
      const newReview: Review = {
        id: reviewData.id,
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

      // Pass the new review back to the parent component
      onSubmit(newReview)
      
      // Refresh reviews and star count
      fetchReviews()
      fetchStarCount()
      
      setUserHasReviewed(true)
      setIsEditing(false)

      router.refresh()
    
    } catch (error) {
      console.error("Error submitting review or adding star:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || rating === 0 || !existingUserReview) return;
    
    setIsSubmitting(true);
  
    try {
      // 1. Update the review
      const reviewResponse = await fetch(`http://localhost:8800/api/gig-reviews/${existingUserReview.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          star: rating,
          content: comment,
        }),
        credentials: "include",
      });
  
      if (!reviewResponse.ok) {
        throw new Error("Failed to update review");
      }
      
      // 2. Update the local state
      setExistingReviews(prev => 
        prev.map(review => 
          review.id === existingUserReview.id 
            ? {
                ...review, 
                rating: rating,
                comment: comment
              } 
            : review
        )
      );
      
      // Show success message
      setEditSuccess(true);
      setTimeout(() => setEditSuccess(false), 3000);
      
      // Exit editing mode
      setIsEditing(false);
      
      // Refresh reviews and star count
      fetchReviews();
      fetchStarCount();
    } catch (error) {
      console.error("Error updating review:", error);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleDelete = async (reviewId: string) => {
    if (!user || !token) return;
    
    if (!window.confirm("Are you sure you want to delete your review?")) {
      return;
    }
    
    setIsSubmitting(true);
  
    try {
      // 1. Delete the review
      const reviewResponse = await fetch(`http://localhost:8800/api/gig-reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      });
  
      if (!reviewResponse.ok) {
        throw new Error("Failed to delete review");
      }
      
      // 2. Remove the star
      const starResponse = await fetch("http://localhost:8800/api/gig-stars/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          gigId,
        }),
        credentials: "include",
      });
  
      if (!starResponse.ok) {
        throw new Error("Failed to remove star rating");
      }
      
      // 3. Update local state
      setExistingReviews(prev => prev.filter(review => review.id !== reviewId));
      
      if (existingUserReview && existingUserReview.id === reviewId) {
        setUserHasReviewed(false);
        setRating(0);
        setComment("");
        setExistingUserReview(null);
        setIsEditing(false);
      }
      
      // Refresh star count
      fetchStarCount();
    } catch (error) {
      console.error("Error deleting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const startEditing = (review: Review) => {
    setIsEditing(true);
    setRating(review.rating);
    setComment(review.comment);
  }

  const cancelEditing = () => {
    setIsEditing(false);
    setRating(existingUserReview ? existingUserReview.rating : 0);
    setComment(existingUserReview ? existingUserReview.comment : "");
  }

  // Display average rating from existing reviews
  const calculateAverageRating = () => {
    if (existingReviews.length === 0) return 0
    const totalRating = existingReviews.reduce((sum, review) => sum + review.rating, 0)
    return (totalRating / existingReviews.length).toFixed(1)
  }

  return (
    <>
      {/* Display Existing Star Rating Summary */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Ratings & Reviews</h3>
              <div className="flex items-center mt-2">
                <div className="text-2xl font-bold mr-2">{calculateAverageRating()}</div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= parseFloat(calculateAverageRating() || "0")
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="ml-2 text-gray-500">({existingReviews.length} reviews)</div>
              </div>
              <div className="mt-1 text-sm text-gray-500">{existingStarCount} people starred this gig</div>
            </div>
          </div>
        </CardContent>
      </Card>
      {user && !userHasReviewed && !isEditing ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4">Write a Review</h3>

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
      ) : !user ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
              Please log in to leave a review.
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Display Existing Reviews */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">Customer Reviews</h3>
          
          {existingReviews.length > 0 ? (
            <div className="space-y-4">
              {existingReviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                        {review.user?.profilePic && (
                          <Image 
                            src={review.user.profilePic} 
                            alt={review.user?.username} 
                            width={40}
                            height={40}
                            loading="lazy"
                            quality={100}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{review.user?.username}</div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Edit and Delete buttons - only for current user's review */}
                    {user && user.id === review.userId && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                          onClick={() => startEditing(review)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                          onClick={() => handleDelete(review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No reviews yet. Be the first to leave a review!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Review Form */}
      {user && isEditing && existingUserReview && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Edit Your Review</h3>
              {editSuccess && (
                <div className="text-sm text-green-600">Review updated successfully!</div>
              )}
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
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
                <Button type="button" variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
                <Button type="submit" disabled={rating === 0 || isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Review"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* New Review Form */}
      
    </>
  )
}