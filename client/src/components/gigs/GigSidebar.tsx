"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, CheckCircle, MessageSquare, Edit, Trash2, X, Package, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

//
// Updated Gig interface with new supplier listing fields
//
export interface Gig {
  id: string;
  title: string;
  description: string;
  leadTime: number;
  bulkPrice: number;
  minOrderQty: number;
  totalStars: number;
  starNumber: number;
  sales: number;
  features?: string[];
  category?: string;
  user: {
    id: string;
    username: string;
    profilePic?: string;
    bio?: string;
    country?: string;
    createdAt: string;
    badges?: string[];
  };
  reviews?: Review[];
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface GigSidebarProps {
  gig: Gig;
  isOwner: boolean;
}

export default function GigSidebar({ gig, isOwner }: GigSidebarProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [hasOrdered, setHasOrdered] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const baseApiUrl = `${process.env.NEXT_PUBLIC_API_URL}`
  const { token, user } = useAuthStore()
  
  // Updated form state based on new supplier listing fields
  const [formData, setFormData] = useState({
    title: gig.title || "",
    description: gig.description || "",
    bulkPrice: gig.bulkPrice || 0,
    leadTime: gig.leadTime || 1,
    minOrderQty: gig.minOrderQty || 0,
    features: Array.isArray(gig.features) ? gig.features : [""]
  })

  // Format date for "Member since" info
  const memberSince = new Date(gig.user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  })

  // Check if the user has already ordered this listing
  useEffect(() => {
    const checkOrderStatus = async () => {
      if (!token || !user?.id) {
        setIsLoading(false)
        return
      }
      try {
        const response = await fetch(`${baseApiUrl}/gig-orders/user/${user.id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          credentials: "include",
        })
        if (response.ok) {
          const orders = await response.json()
          const existingOrder = orders.find((order: any) => order.gigId === gig.id)
          if (existingOrder) {
            setHasOrdered(true)
            setOrderData(existingOrder)
          }
        } else {
          console.error("Failed to fetch orders:", response.status)
        }
      } catch (error) {
        console.error("Error checking order status:", error)
      } finally {
        setIsLoading(false)
      }
    }
    checkOrderStatus()
  }, [token, user, gig.id, baseApiUrl])

  // Define handleDeleteGig to delete the listing
  const handleDeleteGig = async () => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return
    }
    setIsDeleting(true)
    try {
      const response = await fetch(`${baseApiUrl}/gigs/${gig.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      if (response.ok) {
        router.push("/dashboard/gigs")
        router.refresh()
      } else {
        const errorData = await response.json().catch(() => null)
        throw new Error(`Failed to delete listing: ${errorData?.message || response.status}`)
      }
    } catch (error: any) {
      console.error("Error deleting listing:", error)
      alert("Failed to delete listing. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditGig = () => {
    setFormData({
      title: gig.title || "",
      description: gig.description || "",
      bulkPrice: gig.bulkPrice || 0,
      leadTime: gig.leadTime || 1,
      minOrderQty: gig.minOrderQty || 0,
      features: Array.isArray(gig.features) ? gig.features : [""]
    })
    setIsEditDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: (name === "bulkPrice" || name === "leadTime" || name === "minOrderQty")
        ? parseInt(value) || 0
        : value
    })
  }

  const handleFeatureChange = (index: number, value: string) => {
    const currentFeatures = Array.isArray(formData.features) ? [...formData.features] : [""]
    currentFeatures[index] = value
    setFormData({
      ...formData,
      features: currentFeatures
    })
  }

  const handleUpdateGig = async (updatedData: Partial<Gig>) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`${baseApiUrl}/gigs/${gig.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error(`Failed to update listing: ${response.status}`)
      }
      window.location.reload()
      return true
    } catch (error) {
      console.error("Error updating listing:", error)
      alert("Failed to update listing. Please try again.")
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const featuresToFilter = Array.isArray(formData.features) ? formData.features : [""]
    const filteredFeatures = featuresToFilter.filter(feature => feature.trim() !== "")
    const success = await handleUpdateGig({
      ...formData,
      features: filteredFeatures
    })
    if (success) {
      setIsEditDialogOpen(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!orderData) return;
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return;
    }
    setIsCancelling(true);
    try {
      const response = await fetch(`${baseApiUrl}/gig-orders/${orderData.id}/cancel`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel order");
      }
      alert("Order canceled successfully!");
      setHasOrdered(false);
      setOrderData(null);
    } catch (error: any) {
      console.error("Error canceling order:", error);
      alert(error.message || "Failed to cancel order. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleProceedToOrder = () => {
    if (!token) {
      router.push("/auth/login")
    } else {
      router.push(`/gigs/gig/${gig.id}/create-inquiry`)
    }
  }

  const handleTrackOrder = () => {
    if (orderData) {
      router.push(`/gigs/orders/track/${orderData.id}`);
    }
  };

  const handleContactSeller = async () => {
    if (!token) {
      router.push("/auth/login")
      return
    }
    try {
      const response = await fetch(`${baseApiUrl}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          to: gig.user.id,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create conversation")
      }
      const conversation = await response.json()
      router.push(`/chats?conversationId=${conversation.id}`)
    } catch (error: any) {
      console.error("Error creating conversation:", error)
      alert(error.message || "Failed to create conversation")
    }
  }

  return (
    <>
      <div className="sticky top-4 space-y-6">
        {isOwner ? (
          <Card className="border-primary/20 shadow-md">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">Manage Your Listing</h2>
              <div className="space-y-4">
                <Button 
                  className="w-full" 
                  onClick={handleEditGig} 
                  disabled={isUpdating || isDeleting}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Listing
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={handleDeleteGig} 
                  disabled={isDeleting || isUpdating}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete Listing"}
                </Button>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
                  <p className="font-medium">Listing Statistics</p>
                  <ul className="mt-2 space-y-1">
                    <li>Views: 124</li>
                    <li>Orders: {gig.sales}</li>
                    <li>
                      Conversion Rate:{" "}
                      {gig.sales > 0 ? ((gig.sales / 124) * 100).toFixed(1) + "%" : "0%"}
                    </li>
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
                <span className="text-2xl font-bold text-primary">
                ₹{gig.bulkPrice}
                </span>
              </div>
              <p className="text-muted-foreground mb-6">{gig.description}</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-muted-foreground mr-3" />
                  <span>
                    {gig.leadTime} day{gig.leadTime !== 1 ? "s" : ""} lead time
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-muted-foreground mr-3" />
                  <span>MOQ: {gig.minOrderQty} units</span>
                </div>
                {gig.features && Array.isArray(gig.features) && gig.features.filter((f) => f).length > 0 && (
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
              {isLoading ? (
                <Button disabled className="w-full bg-primary hover:bg-primary/90 text-white mb-3">
                  Loading...
                </Button>
              ) : hasOrdered && orderData?.status === "PENDING" ? (
                <div className="space-y-3">
                  <Button  
                    className="w-full bg-red-600 hover:bg-red-700 text-white mb-3"
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel Order
                  </Button>
                  <Button 
                    className="w-full" 
                    onClick={handleTrackOrder}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Track Order
                  </Button>
                </div>
              ) : 
              hasOrdered && orderData?.status === "IN_PROGRESS" ? (
                <div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 font-medium">
                      You cannot cancel this order. Please contact the supplier to request cancellation.
                    </p>
                  </div>
                  <Button 
                    className="w-full mt-3" 
                    onClick={handleTrackOrder}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Track Order
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white mb-3" 
                  onClick={handleProceedToOrder}
                >
                  Continue (₹{gig.bulkPrice} per unit)
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={handleContactSeller}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Supplier
              </Button>
            </CardContent>
          </Card>
        )}

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

        {!isOwner && (
          <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Edit Listing
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsEditDialogOpen(false)} 
                className="h-6 w-6 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bulkPrice">Bulk Price ($ per unit)</Label>
                <Input
                  id="bulkPrice"
                  name="bulkPrice"
                  type="number"
                  min="1"
                  value={formData.bulkPrice}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadTime">Lead Time (days)</Label>
                <Input
                  id="leadTime"
                  name="leadTime"
                  type="number"
                  min="1"
                  value={formData.leadTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrderQty">MOQ (units)</Label>
                <Input
                  id="minOrderQty"
                  name="minOrderQty"
                  type="number"
                  min="1"
                  value={formData.minOrderQty}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              {Array.isArray(formData.features) ? (
                formData.features.map((feature, index) => (
                  <Input
                    key={index}
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="mb-2"
                  />
                ))
              ) : (
                <>
                  <Input placeholder="Feature 1" onChange={(e) => handleFeatureChange(0, e.target.value)} className="mb-2" />
                  <Input placeholder="Feature 2" onChange={(e) => handleFeatureChange(1, e.target.value)} className="mb-2" />
                  <Input placeholder="Feature 3" onChange={(e) => handleFeatureChange(2, e.target.value)} className="mb-2" />
                </>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
