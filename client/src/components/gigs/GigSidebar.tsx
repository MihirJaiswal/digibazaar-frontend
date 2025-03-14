"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, RefreshCw, CheckCircle, MessageSquare, Edit, Trash2, X, Package } from "lucide-react"
import type { Gig } from "@/app/gigs/types/gig"
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

interface GigSidebarProps {
  gig: Gig
  isOwner: boolean
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
  const baseApiUrl = "http://localhost:8800/api"
  const { token, user } = useAuthStore()

  // State for form fields with safer initialization
  const [formData, setFormData] = useState({
    title: gig.title || "",
    shortDesc: gig.shortDesc || "",
    price: gig.price || 0,
    deliveryTime: gig.deliveryTime || 1,
    revisionNumber: gig.revisionNumber || 1,
    features: Array.isArray(gig.features) ? gig.features : ["", "", ""]
  })

  // Format date
  const memberSince = new Date(gig.user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  })

  // Check if user has already ordered this gig
  useEffect(() => {
    const checkOrderStatus = async () => {
      if (!token || !user?.id) {
        setIsLoading(false)
        return
      }

      try {
        // Get all orders for the current user
        const response = await fetch(`${baseApiUrl}/gig-orders/user/${user.id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          credentials: "include",
        })

        if (response.ok) {
          const orders = await response.json()
          // Check if any order contains this gig
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

  const handleEditGig = () => {
    setFormData({
      title: gig.title || "",
      shortDesc: gig.shortDesc || "",
      price: gig.price || 0,
      deliveryTime: gig.deliveryTime || 1,
      revisionNumber: gig.revisionNumber || 1,
      features: Array.isArray(gig.features) ? gig.features : ["", "", ""]
    })
    setIsEditDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "price" || name === "deliveryTime" || name === "revisionNumber" 
        ? parseInt(value) || 0 
        : value
    })
  }

  const handleFeatureChange = (index: number, value: string) => {
    // Ensure features is an array before updating it
    const currentFeatures = Array.isArray(formData.features) 
      ? [...formData.features] 
      : ["", "", ""]
    
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
        throw new Error(`Failed to update gig: ${response.status}`)
      }

      // Refresh the page to show updated data
      window.location.reload()
      return true
    } catch (error) {
      console.error("Error updating gig:", error)
      alert("Failed to update gig. Please try again.")
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Ensure features is an array before filtering
    const featuresToFilter = Array.isArray(formData.features) 
      ? formData.features 
      : ["", "", ""]
      
    // Filter out empty features
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
      setHasOrdered(false); // Update UI to remove order actions
      setOrderData(null); // Reset order data
    } catch (error: any) {
      console.error("Error canceling order:", error);
      alert(error.message || "Failed to cancel order. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteGig = async () => {
    if (!confirm("Are you sure you want to delete this gig? This action cannot be undone.")) {
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
        throw new Error(`Failed to delete gig: ${errorData?.message || response.status}`)
      }
    } catch (error) {
      console.error("Error deleting gig:", error)
      alert("Failed to delete gig. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleProceedToOrder = () => {
    if (!token) {
      router.push("/login") // Redirect to login if user is not authenticated
    } else {
      router.push(`/gigs/gig/${gig.id}/confirm-order`) // Redirect to order confirmation page
    }
  }

  const handleTrackOrder = () => {
    if (orderData) {
      router.push(`/gigs/orders/track/${orderData.id}`); // Redirects to the dynamic order tracking page
    }
  };

  // NEW: Create conversation when "Contact Seller" is clicked
  const handleContactSeller = async () => {
    if (!token) {
      router.push("/login")
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
          to: gig.user.id, // The seller's user id
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create conversation")
      }
      const conversation = await response.json()
      // Redirect to the messaging page with the conversation id as a query parameter
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
              <h2 className="text-xl font-bold mb-4">Manage Your Gig</h2>

              <div className="space-y-4">
                <Button 
                  className="w-full" 
                  onClick={handleEditGig} 
                  disabled={isUpdating || isDeleting}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Gig
                </Button>

                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={handleDeleteGig} 
                  disabled={isDeleting || isUpdating}
                >
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
                hasOrdered && orderData?.status == " IN_PROGRESS" ?(
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 font-medium ">
                        You cannot cancel this order. Please contact the seller to request cancellation.
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
                )
              : (
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white mb-3" 
                  onClick={handleProceedToOrder}
                >
                  Continue (${gig.price})
                </Button>
              )}

              {/* Contact Seller Button triggers conversation creation */}
              <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={handleContactSeller}
              >
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

      {/* Edit Gig Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Edit Gig
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
              <Label htmlFor="shortDesc">Short Description</Label>
              <Textarea
                id="shortDesc"
                name="shortDesc"
                value={formData.shortDesc}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Delivery (days)</Label>
                <Input
                  id="deliveryTime"
                  name="deliveryTime"
                  type="number"
                  min="1"
                  value={formData.deliveryTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="revisionNumber">Revisions</Label>
                <Input
                  id="revisionNumber"
                  name="revisionNumber"
                  type="number"
                  min="0"
                  value={formData.revisionNumber}
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
                  <Input 
                    placeholder="Feature 1" 
                    onChange={(e) => handleFeatureChange(0, e.target.value)} 
                    className="mb-2" 
                  />
                  <Input 
                    placeholder="Feature 2" 
                    onChange={(e) => handleFeatureChange(1, e.target.value)} 
                    className="mb-2" 
                  />
                  <Input 
                    placeholder="Feature 3" 
                    onChange={(e) => handleFeatureChange(2, e.target.value)} 
                    className="mb-2" 
                  />
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
