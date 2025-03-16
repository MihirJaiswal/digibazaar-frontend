"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle, MessageSquare, Zap } from "lucide-react"
import Header from "@/components/global/Header"

// --- Helper Functions ---
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`
}

const calculateTimeRemaining = (dateString: string): number => {
  const deadline = new Date(dateString)
  const now = new Date()
  return deadline.getTime() - now.getTime()
}

const formatCountdown = (milliseconds: number): string => {
  if (milliseconds <= 0) return "Expired"
  const totalSeconds = Math.floor(milliseconds / 1000)
  const days = Math.floor(totalSeconds / (3600 * 24))
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0 || days > 0) parts.push(`${hours}h`)
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)
  return parts.join(" ")
}

const getUserAvatar = (userObj: { username: string; profilePic?: string }, size = 12) => {
  if (userObj.profilePic) {
    return (
      <div className={`relative rounded-full overflow-hidden border-2 border-background shadow-sm`}>
        <Image src={userObj.profilePic || "/placeholder.svg"} 
        alt={userObj.username} 
        height={500}
        width={500}
         className="object-cover h-20 w-20" />
      </div>
    )
  }
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-primary/10 border-2 border-background shadow-sm flex items-center justify-center text-primary font-medium`}
    >
      {userObj.username.charAt(0).toUpperCase()}
    </div>
  )
}

// --- Type Definitions ---
export interface Inquiry {
  id: string
  message: string
  createdAt: string
  expiresAt: string
  buyer: { id: string; username: string; profilePic?: string; role: "buyer" } | null
  supplier: { id: string; username: string; profilePic?: string; role: "seller" } | null
  requestedQuantity: number
  requestedPrice: number
  proposedQuantity: number | null
  proposedPrice: number | null
  status: "PENDING" | "NEGOTIATING" | "ACCEPTED" | "REJECTED" | "EXPIRED"
  round: number
  gig: {
    id: string
    title: string
    description: string
    cover: string
    bulkPrice: number
    minOrderQty: number
    productionCost?: number
    leadTime: number
    category: string
  }
}

// --- NegotiationDetailPage Component ---
export default function NegotiationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, token } = useAuthStore()

  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  // Dialog states
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false)
  const [confirmAction, setConfirmAction] = useState<"accept" | "reject" | "delete" | null>(null)
  const [isNegotiationOpen, setIsNegotiationOpen] = useState<boolean>(false)
  const [newQuantity, setNewQuantity] = useState<string>("")
  const [newPrice, setNewPrice] = useState<string>("")
  const [newMessage, setNewMessage] = useState<string>("")

  // --- Fetch Inquiry Data ---
  const fetchInquiry = useCallback(async () => {
    try {
      console.log("[Fetch Inquiry] Requesting inquiry with ID:", id)
      setLoading(true)
      const res = await fetch(`http://localhost:8800/api/inquiries/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error("Failed to fetch inquiry")
      }
      const data: Inquiry = await res.json()
      console.log("[Fetch Inquiry] Received data:", data)
      setInquiry(data)
      const remaining = calculateTimeRemaining(data.expiresAt)
      setTimeRemaining(remaining)
      if (remaining <= 0 && data.status !== "ACCEPTED" && data.status !== "REJECTED") {
        console.log("[Fetch Inquiry] Inquiry expired; updating status to EXPIRED")
        await updateInquiry({ status: "EXPIRED" })
      }
    } catch (err: any) {
      console.error("[Fetch Inquiry] Error:", err)
      setError(err.message || "Failed to load inquiry details.")
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => {
    if (id && token) {
      fetchInquiry()
    }
  }, [id, token, fetchInquiry])

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (inquiry) {
        setTimeRemaining(calculateTimeRemaining(inquiry.expiresAt))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [inquiry])

  // --- Update Inquiry Function ---
  const updateInquiry = async (updatedFields: Partial<Inquiry>) => {
    try {
      console.log("[Update Inquiry] Request received:", { inquiryId: inquiry?.id, updatedFields })
      const res = await fetch(`http://localhost:8800/api/inquiries/${inquiry!.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(updatedFields),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to update inquiry")
      }
      const updatedInquiry: Inquiry = await res.json()
      console.log("[Update Inquiry] Successfully updated inquiry:", updatedInquiry)
      setInquiry(updatedInquiry)
      return true
    } catch (err: any) {
      console.error("[Update Inquiry] Error:", err)
      setError(err.message || "Failed to update inquiry")
      return false
    }
  }

  // --- Action Handlers ---
  const handleAccept = async () => {
    const success = await updateInquiry({ status: "ACCEPTED" })
    if (success) alert("Offer accepted!")
    setIsConfirmOpen(false)
  }

  const handleReject = async () => {
    const success = await updateInquiry({ status: "REJECTED" })
    if (success) alert("Offer rejected")
    setIsConfirmOpen(false)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return
    try {
      const res = await fetch(`http://localhost:8800/api/inquiries/${inquiry!.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
      if (res.ok) {
        alert("Inquiry deleted successfully")
        router.push("/gigs/inquiries")
      } else {
        setError("Failed to delete inquiry")
      }
    } catch (err) {
      console.error("[Delete Inquiry] Error:", err)
      setError("Failed to delete inquiry. Please try again later.")
    } finally {
      setIsConfirmOpen(false)
    }
  }

  const handleSubmitNegotiation = async () => {
    if (!newQuantity || !newPrice) {
      setError("Please enter both quantity and price for your counter-offer.");
      return;
    }
    const quantity = Number(newQuantity);
    const price = Number(newPrice);
    if (isNaN(quantity) || quantity <= 0 || quantity < inquiry!.gig.minOrderQty) {
      setError(`Quantity must be at least ${inquiry!.gig.minOrderQty}`);
      return;
    }
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid price");
      return;
    }
    // Extend expiration time by 48 hours from now
    const newExpiryDate = new Date();
    newExpiryDate.setHours(newExpiryDate.getHours() + 48);
  
    // Use a type assertion to ensure the status is typed as a literal.
    const negotiationData: Partial<Inquiry> = {
      status: "NEGOTIATING" as "NEGOTIATING",
      proposedQuantity: quantity,
      proposedPrice: price,
      round: inquiry!.round + 1,
      message: newMessage,
      expiresAt: newExpiryDate.toISOString(),
    };
  
    const success = await updateInquiry(negotiationData);
    if (success) {
      setIsNegotiationOpen(false);
      setNewQuantity("");
      setNewPrice("");
      setNewMessage("");
      setError(null);
      alert("Negotiation submitted successfully");
    }
  };

  const openConfirmDialog = (action: "accept" | "reject" | "delete") => {
    setConfirmAction(action)
    setIsConfirmOpen(true)
  }

  const openNegotiationDialog = () => {
    if (inquiry?.status === "NEGOTIATING" && inquiry.proposedQuantity !== null && inquiry.proposedPrice !== null) {
      setNewQuantity(inquiry.proposedQuantity?.toString() ?? "");
      setNewPrice(inquiry.proposedPrice?.toString() ?? "");
    } else {
      setNewQuantity(inquiry?.requestedQuantity?.toString() ?? "");
      setNewPrice(inquiry?.requestedPrice?.toString() ?? "");
    }
    setNewMessage("");
    setIsNegotiationOpen(true);
  };

  // --- UI Rendering Helpers ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800 px-3 py-1 font-medium flex items-center gap-1"
          >
            <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
            Pending
          </Badge>
        )
      case "NEGOTIATING":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 px-3 py-1 font-medium flex items-center gap-1"
          >
            <MessageSquare className="h-3 w-3" />
            Negotiating
          </Badge>
        )
      case "ACCEPTED":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 px-3 py-1 font-medium flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Accepted
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 px-3 py-1 font-medium flex items-center gap-1"
          >
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
      case "EXPIRED":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700 px-3 py-1 font-medium flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calculate countdown string
  const countdownString = formatCountdown(timeRemaining)

  // --- Safety Check ---
  if (!inquiry?.buyer || !inquiry?.supplier) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error: Inquiry data is incomplete.</AlertDescription>
      </Alert>
    )
  }

  // --- Determine Roles ---
  const isBuyer = user?.id === inquiry.buyer.id
  const isSeller = user?.id === inquiry.supplier.id
  // Determine who made the last offer (round odd: buyer, even: seller)
  const lastOfferBy = inquiry.round % 2 === 0 ? "seller" : "buyer"
  // Current user can respond only if they did NOT make the last offer
  const canRespondToOffer = (isBuyer && lastOfferBy === "seller") || (isSeller && lastOfferBy === "buyer")

  // Determine recent offer details (using proposed values if available)
  const recentOfferPrice = inquiry.proposedPrice !== null ? inquiry.proposedPrice : inquiry.requestedPrice
  const recentOfferQuantity = inquiry.proposedQuantity !== null ? inquiry.proposedQuantity : inquiry.requestedQuantity
  const orderTotal = recentOfferPrice * recentOfferQuantity

  // --- Render ---
  return (
    <div className="bg-white dark:bg-zinc-900">
    <Header/>
    <div className="container mx-auto py-5 px-4 space-y-8 max-w-5xl">
      <Link
        href="/gigs/inquiries"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">Back to Inquiries</span>
      </Link>

      {/* Header Section */}
      <div className="bg-card rounded-xl shadow-md overflow-hidden border border-border">
        <div className="p-6 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Inquiry Details</h1>
              <p className="text-muted-foreground mt-1">Negotiation for {inquiry.gig.title}</p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(inquiry.status)}
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full text-sm font-medium">
                <Zap className="h-4 w-4" />
                <span>{countdownString}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getUserAvatar(inquiry.buyer, 40)}
                <div>
                  <p className="text-sm text-muted-foreground">Buyer</p>
                  <p className="font-medium">{inquiry.buyer.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getUserAvatar(inquiry.supplier, 40)}
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium">{inquiry.supplier.username}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Created on</p>
                <p className="font-medium">{formatDate(inquiry.createdAt)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Negotiation Round</p>
                <p className="font-medium">{inquiry.round}</p>
              </div>
            </div>

            <div className="relative h-[25REM] w-full rounded-lg overflow-hidden flex items-center justify-center">
            <Image
              src={inquiry.gig.cover || "/placeholder.svg"}
              alt={inquiry.gig.title}
              height={500}
              width={500}
              loading="lazy"
              className="w-full h-full object-cover object-center"
            />
          </div>

          </div>
        </div>
      </div>

      {/* Gig Summary Card */}
      <Card className="shadow-sm border border-border overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-border shadow-sm flex items-center justify-center">
                <Image
                  src={inquiry.gig.cover || "/placeholder.svg"}
                  alt={inquiry.gig.title}
                  width={80}
                  height={80}
                  loading="lazy"
                  quality={100}
                  className="w-full h-full object-cover object-center aspect-square"
                />
              </div>
            <div>
              <CardTitle className="text-2xl font-bold">{inquiry.gig.title}</CardTitle>
              <Badge variant="outline" className="mt-2 font-normal">
                {inquiry.gig.category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground">{inquiry.gig.description}</p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Bulk Price</p>
              <p className="text-xl font-semibold text-primary">
                ${inquiry.gig.bulkPrice}
                <span className="text-sm font-normal text-muted-foreground">/unit</span>
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Min Order</p>
              <p className="text-xl font-semibold">
                {inquiry.gig.minOrderQty}
                <span className="text-sm font-normal text-muted-foreground"> units</span>
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Lead Time</p>
              <p className="text-xl font-semibold">
                {inquiry.gig.leadTime}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  day{inquiry.gig.leadTime !== 1 ? "s" : ""}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inquiry Detail Card */}
      <Card className="shadow-sm border border-border overflow-hidden">
        <CardHeader className="p-6 pb-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row items-center gap-4">
              {getUserAvatar(user?.id === inquiry.buyer.id ? inquiry.supplier! : inquiry.buyer!, 40)}
              <div>
                <CardTitle className="text-xl">
                  {(user?.id === inquiry.buyer.id ? inquiry.supplier : inquiry.buyer)?.username || "Unknown"}
                </CardTitle>
              </div>
            </div>
            {isBuyer ? (
              <Badge variant="outline" className="px-3 py-1 bg-primary/5">
                You initiated this inquiry
              </Badge>
            ) : (
              <Badge variant="outline" className="px-3 py-1 bg-primary/5">
                Inquiry received
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Message
                </h3>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-muted-foreground">{inquiry.message || "No additional message."}</p>
                </div>
              </div>

              {/* Display current counter offer if status is NEGOTIATING */}
              {inquiry.status === "NEGOTIATING" && inquiry.proposedQuantity !== null && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="font-medium text-primary mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Current Counter Offer (Round {inquiry.round})
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Proposed Quantity</p>
                      <p className="font-semibold">{inquiry.proposedQuantity} units</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Proposed Price</p>
                      <p className="font-semibold">${inquiry.proposedPrice} per unit</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Negotiation Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Requested Quantity</p>
                    <p className="font-semibold">{inquiry.requestedQuantity} units</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Requested Price</p>
                    <p className="font-semibold">${inquiry.requestedPrice} per unit</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Proposed Quantity</p>
                    <p className="font-semibold">
                      {inquiry.proposedQuantity !== null ? inquiry.proposedQuantity : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Proposed Price</p>
                    <p className="font-semibold">
                      {inquiry.proposedPrice !== null ? `$${inquiry.proposedPrice}` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <h3 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Order Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Quantity</p>
                    <p className="font-semibold">{recentOfferQuantity} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unit Price</p>
                    <p className="font-semibold">${recentOfferPrice}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Order Total</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-400">${orderTotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-3 justify-end">
            {inquiry.status === "PENDING" || inquiry.status === "NEGOTIATING" ? (
              <>
                {(() => {
                  const lastOfferBy = inquiry.round % 2 === 0 ? "seller" : "buyer"
                  const canRespondToOffer =
                    (isBuyer && lastOfferBy === "seller") || (!isBuyer && lastOfferBy === "buyer")
                  return (
                    canRespondToOffer && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setConfirmAction("reject")
                            setIsConfirmOpen(true)
                          }}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject Offer
                        </Button>
                        <Button
                          onClick={() => {
                            setConfirmAction("accept")
                            setIsConfirmOpen(true)
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Accept Offer
                        </Button>
                      </>
                    )
                  )
                })()}
                <Button onClick={openNegotiationDialog} variant="outline" className="border-primary/20 bg-primary/5">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Counter Offer
                </Button>
                {isBuyer && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setConfirmAction("delete")
                      setIsConfirmOpen(true)
                    }}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Delete Inquiry
                  </Button>
                )}
              </>
            ) : inquiry.status === "ACCEPTED" ? (
              // Show "Confirm Order" button only for the buyer when inquiry is accepted
              isBuyer ? (
                <Button
                  onClick={() => router.push(`/gigs/inquiries/${inquiry.id}/confirm-order`)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Order
                </Button>
              ) : (
                <Badge className="px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Inquiry Accepted
                </Badge>
              )
            ) : inquiry.status === "EXPIRED" ? (
              <Button onClick={openNegotiationDialog} variant="outline" className="border-primary/20 bg-primary/5">
                <Zap className="mr-2 h-4 w-4" />
                Revive Negotiation
              </Button>
            ) : (
              <Badge
                className={`px-4 py-2 ${
                  (inquiry.status as string) === "ACCEPTED"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                {(inquiry.status as string) === "ACCEPTED" ? (
                  <CheckCircle className="mr-2 h-4 w-4" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Inquiry {inquiry.status}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Negotiation Dialog */}
      {isNegotiationOpen && (
        <Dialog open={isNegotiationOpen} onOpenChange={setIsNegotiationOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Make a Counter Offer
              </DialogTitle>
              <DialogDescription className="mt-2">
                Propose new terms for this inquiry. Both parties must agree before finalizing.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="quantity" className="text-sm font-medium flex items-center gap-1">
                    Quantity <span className="text-xs text-muted-foreground">(min: {inquiry.gig.minOrderQty})</span>
                  </label>
                  <Input
                    id="quantity"
                    type="number"
                    min={inquiry.gig.minOrderQty}
                    placeholder="Enter quantity"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium flex items-center gap-1">
                    Price per unit <span className="text-xs text-muted-foreground">($)</span>
                  </label>
                  <Input
                    id="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Enter price"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Total Order Value:</span>
                  <span className="font-medium">
                    $
                    {!isNaN(Number(newQuantity)) && !isNaN(Number(newPrice))
                      ? (Number(newQuantity) * Number(newPrice)).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Additional Message (optional)
                </label>
                <Textarea
                  id="message"
                  placeholder="Explain your offer or reasoning"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                  className="focus-visible:ring-primary resize-none"
                />
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsNegotiationOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitNegotiation} className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Submit Offer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog */}
      {isConfirmOpen && (
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                {confirmAction === "accept" ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Accept Offer
                  </>
                ) : confirmAction === "reject" ? (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    Reject Inquiry
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    Delete Inquiry
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {confirmAction === "accept"
                  ? "Are you sure you want to accept this offer? This will finalize the negotiation."
                  : confirmAction === "reject"
                    ? "Are you sure you want to reject this inquiry? This action cannot be undone."
                    : "Are you sure you want to delete this inquiry? This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {confirmAction === "accept" && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <h3 className="font-medium text-green-700 dark:text-green-400 mb-2">Order Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-muted-foreground">Quantity:</p>
                    <p className="font-medium">{recentOfferQuantity} units</p>
                    <p className="text-muted-foreground">Price per unit:</p>
                    <p className="font-medium">${recentOfferPrice}</p>
                    <p className="text-muted-foreground">Total:</p>
                    <p className="font-medium">${orderTotal.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="sm:justify-end gap-2">
              <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={confirmAction === "accept" ? "default" : "destructive"}
                onClick={
                  confirmAction === "accept" ? handleAccept : confirmAction === "reject" ? handleReject : handleDelete
                }
                className={confirmAction === "accept" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {confirmAction === "accept" ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Yes, Accept
                  </>
                ) : confirmAction === "reject" ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Yes, Reject
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Yes, Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </div>
  )
}

