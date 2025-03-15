"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/store/authStore"
import {
  ArrowLeft,
  DollarSign,
  Package,
  Clock,
  Calculator,
  Send,
  AlertCircle,
  Calendar,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

export default function InquiryPage() {
  const router = useRouter()
  const params = useParams()
  const gigId = params.id as string
  const { token } = useAuthStore()

  // State to hold gig details
  const [gig, setGig] = useState<any>(null)
  // Inquiry fields
  const [requestedQuantity, setRequestedQuantity] = useState("")
  const [requestedPrice, setRequestedPrice] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingGig, setFetchingGig] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch gig details to show key listing information
  useEffect(() => {
    if (!gigId) return
    setFetchingGig(true)
    fetch(`http://localhost:8800/api/gigs/${gigId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load gig details")
        }
        return res.json()
      })
      .then((data) => {
        setGig(data)
        // Pre-fill with the bulk price as a starting point
        setRequestedPrice(data.bulkPrice.toString())
      })
      .catch((err) => {
        console.error("Error fetching listing:", err)
        setError("Unable to load gig details. Please try again later.")
      })
      .finally(() => {
        setFetchingGig(false)
      })
  }, [gigId])

  // Calculate total price based on quantity and price
  const calculateTotal = () => {
    const qty = Number.parseInt(requestedQuantity, 10) || 0
    const price = Number.parseFloat(requestedPrice) || 0
    return (qty * price).toFixed(2)
  }

  // Calculate savings compared to list price
  const calculateSavings = () => {
    if (!gig) return "0.00"
    const qty = Number.parseInt(requestedQuantity, 10) || 0
    const requestedTotal = qty * (Number.parseFloat(requestedPrice) || 0)
    const listTotal = qty * gig.bulkPrice
    return (listTotal - requestedTotal).toFixed(2)
  }

  // Calculate percentage savings
  const calculateSavingsPercentage = () => {
    if (!gig) return 0
    const requestedPriceNum = Number.parseFloat(requestedPrice) || 0
    if (requestedPriceNum <= 0 || gig.bulkPrice <= 0) return 0
    return Math.round(((gig.bulkPrice - requestedPriceNum) / gig.bulkPrice) * 100)
  }

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault()

    const qty = Number.parseInt(requestedQuantity, 10)
    const price = Number.parseFloat(requestedPrice)

    // Validate required fields
    if (!requestedQuantity || !requestedPrice) {
      setError("Please enter both quantity and your requested price per unit.")
      return
    }
    if (qty < gig.minOrderQty) {
      setError(`Minimum order quantity is ${gig.minOrderQty} units.`)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch("http://localhost:8800/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gigId: gig.id,
          supplierId: gig.user.id, // Supplier is the gig owner
          requestedQuantity: qty,
          requestedPrice: price,
          message,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to submit inquiry")
      }
      alert("Inquiry submitted successfully! Please check your dashboard for supplier responses.")
      router.push("/gigs/inquiries")
    } catch (error: any) {
      console.error("Error submitting inquiry:", error)
      setError(error.message || "Error submitting inquiry.")
    } finally {
      setLoading(false)
    }
  }

  if (fetchingGig) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/gigs" className="text-primary hover:text-primary/80 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listings
            </Link>
          </div>
          <Card className="shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b px-6 py-5">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Separator />
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error && !gig) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button asChild>
            <Link href="/gigs">Return to Listings</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!gig) return null

  const savingsPercentage = calculateSavingsPercentage()
  const isPriceHigher = Number.parseFloat(requestedPrice) > gig.bulkPrice

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/gigs" className="text-primary hover:text-primary/80 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Link>
        </div>

        <Card className="shadow-lg rounded-xl overflow-hidden border-0">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b px-6 py-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-white">
                <Image
                  src={gig.cover || "/placeholder.svg?height=64&width=64"}
                  alt={gig.title}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <Badge className="mb-2">{gig.category}</Badge>
                <CardTitle className="text-2xl font-bold">Inquiry for {gig.title}</CardTitle>
                <CardDescription className="text-sm mt-1 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Start negotiation with {gig.user?.username || "Supplier"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Gig Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-white dark:bg-zinc-800 shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                  <DollarSign className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">List Price</p>
                  <p className="text-2xl font-bold">${gig.bulkPrice}</p>
                  <p className="text-xs text-muted-foreground">per unit</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-zinc-800 shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                  <Package className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Minimum Order</p>
                  <p className="text-2xl font-bold">{gig.minOrderQty}</p>
                  <p className="text-xs text-muted-foreground">units</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-zinc-800 shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                  <Clock className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Lead Time</p>
                  <p className="text-2xl font-bold">{gig.leadTime}</p>
                  <p className="text-xs text-muted-foreground">day{gig.leadTime !== 1 ? "s" : ""}</p>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmitInquiry} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                    Quantity Required
                  </label>
                  <Input
                    type="number"
                    min={gig.minOrderQty}
                    value={requestedQuantity}
                    onChange={(e) => setRequestedQuantity(e.target.value)}
                    className="bg-white dark:bg-zinc-800"
                    placeholder={`Minimum ${gig.minOrderQty} units`}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum order: {gig.minOrderQty} units</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    Requested Price (per unit)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={requestedPrice}
                      onChange={(e) => setRequestedPrice(e.target.value)}
                      className="pl-8 bg-white dark:bg-zinc-800"
                      placeholder="Enter your price"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">List price: ${gig.bulkPrice} per unit</p>
                </div>
              </div>

              {/* Price Calculator */}
              {requestedQuantity && requestedPrice && (
                <Card
                  className={`border ${isPriceHigher ? "border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800" : savingsPercentage > 0 ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800" : "bg-gray-50 dark:bg-zinc-800"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <Calculator
                        className={`h-5 w-5 mr-2 ${isPriceHigher ? "text-orange-500" : savingsPercentage > 0 ? "text-green-500" : "text-muted-foreground"}`}
                      />
                      <h3 className="font-medium">Order Summary</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="font-medium">{Number.parseInt(requestedQuantity, 10) || 0} units</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Price per unit</p>
                        <p className="font-medium">${Number.parseFloat(requestedPrice) || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="font-bold">${calculateTotal()}</p>
                      </div>
                      <div>
                        {isPriceHigher ? (
                          <div className="text-orange-600 dark:text-orange-400">
                            <p className="text-sm">Price Increase</p>
                            <p className="font-bold">+{Math.abs(savingsPercentage)}% above list</p>
                          </div>
                        ) : savingsPercentage > 0 ? (
                          <div className="text-green-600 dark:text-green-400">
                            <p className="text-sm">Potential Savings</p>
                            <p className="font-bold">
                              ${calculateSavings()} ({savingsPercentage}%)
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-muted-foreground">Compared to List</p>
                            <p className="font-medium">No change</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                  Additional Requirements
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter any additional details, customization requests, or questions..."
                  className="min-h-[120px] bg-white dark:bg-zinc-800"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Provide clear details to help the supplier understand your needs
                </p>
              </div>

              <CardFooter className="px-0 pt-4 flex flex-col sm:flex-row gap-4">
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span> Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" /> Submit Inquiry
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

