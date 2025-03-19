"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, FileDown, MessageSquare, Calendar, CheckCircle, Package } from "lucide-react"
import Header from "@/components/global/Header"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { useAuthStore } from "@/store/authStore"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type GigDelivery = {
  id: string
  gigOrderId: string
  sellerId: string
  buyerId: string
  fileUrl: string
  message: string
  isAccepted: boolean
  createdAt: string
}

export default function BuyerDeliveryReview() {
  const { token } = useAuthStore()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  // Extract gigOrderId from either the URL path or query string
  const gigOrderId = params?.gigOrderId || params?.id || searchParams.get("id")

  const [delivery, setDelivery] = useState<GigDelivery | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [acceptLoading, setAcceptLoading] = useState(false)

  // State for the extra confirmation dialog
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false)

  useEffect(() => {
    if (!token) {
      router.push("/login")
      return
    }

    if (!gigOrderId) {
      setError("Invalid Order ID")
      setLoading(false)
      return
    }

    const fetchDelivery = async () => {
      const apiEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/gig-deliveries/order/${gigOrderId}`
      try {
        const res = await fetch(apiEndpoint, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })

        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Failed to fetch delivery: ${res.status} - ${errorText}`)
        }

        const data: GigDelivery = await res.json()

        if (!data || Object.keys(data).length === 0) {
          setError("No delivery found for this order.")
          setLoading(false)
          return
        }

        setDelivery(data)
      } catch (err: any) {
        setError(err.message || "Failed to load delivery.")
      } finally {
        setLoading(false)
      }
    }

    fetchDelivery()
  }, [gigOrderId, token, router])

  const handleAcceptDelivery = async () => {
    if (!delivery) return
    setAcceptLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gig-deliveries/${delivery.id}/accept`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error("Failed to accept delivery")
      }

      const updatedDelivery = await res.json()
      setDelivery(updatedDelivery)

      // Show success dialog or redirect
      setTimeout(() => {
        router.push("/gigs/orders")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Failed to accept delivery.")
    } finally {
      setAcceptLoading(false)
      setIsReceiveDialogOpen(false)
    }
  }

  // This handler opens a dialog asking the buyer to confirm
  const handleOpenReceiveDialog = () => {
    setIsReceiveDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <Card className="overflow-hidden border-border/40 shadow-md">
            <CardHeader className="bg-muted/50 border-b border-border/30 pb-4">
              <Skeleton className="h-8 w-64" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
              <Separator />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/gigs/orders")} variant="outline">
            Return to Orders
          </Button>
        </div>
      </div>
    )
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-4xl mx-auto px-4 py-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No Delivery Found</h2>
          <p className="text-muted-foreground mb-6">No delivery information was found for this order.</p>
          <Button onClick={() => router.push("/gigs/orders")} variant="outline">
            Return to Orders
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/gigs/orders")}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Orders
          </Button>
        </div>

        <Card className="overflow-hidden border-border/40 shadow-md">
          <CardHeader className="bg-muted/50 border-b border-border/30 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Package className="h-5 w-5" /> Delivery Details
              </CardTitle>
              {delivery.isAccepted ? (
                <Badge
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 flex items-center gap-1"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Accepted
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                  Pending Approval
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <FileDown className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground">Delivery File</h3>
                    <a
                      href={delivery.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      View or Download File
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground">Delivery Date</h3>
                    <p className="text-muted-foreground">
                      {new Date(delivery.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground">Seller's Message</h3>
                    <div className="mt-1 text-muted-foreground bg-muted/50 p-3 rounded-md border border-border/30 max-h-[120px] overflow-y-auto">
                      {delivery.message || "No message provided."}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {delivery.isAccepted ? (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <p className="font-medium text-green-800 dark:text-green-300">
                    You've accepted this delivery. The order is now complete.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border border-border/30">
                <p className="text-center mb-4 text-muted-foreground">
                  Please review the delivery and accept it if you have received the order.
                </p>
                <Button onClick={handleOpenReceiveDialog} variant="default" size="lg" className="font-medium">
                  Accept Delivery
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Receive Confirmation Dialog */}
      <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Receipt of Delivery</DialogTitle>
            <DialogDescription>
              Please confirm that you have received and reviewed your order. Once accepted, the order will be marked as
              complete.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <Alert
              variant="destructive"
              className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Only accept the delivery if you received your products. This action cannot be undone.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReceiveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAcceptDelivery} disabled={acceptLoading} className="gap-2">
              {acceptLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Yes, Accept Delivery
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

