"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import Header from "@/components/global/Header"
import GigsSidebar from "@/components/gigs/GigsSidebar"
import OrderUpdateForm from "@/components/gigs/OrderUpdateForm"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Loader2,
  AlertCircle,
  Clock,
  DollarSign,
  User,
  FileText,
  Calendar,
  ShieldAlert,
  Package,
  ExternalLink,
  Truck,
  IndianRupee
} from "lucide-react"

type Order = {
  id: string
  gigId: string
  buyerId: string
  sellerId: string
  price: number
  status: string
  requirement: string
  paymentIntent: string
  createdAt: string
  updatedAt: string
  gig: {
    id: string
    title: string
    desc: string
    cover: string
  }
  buyer?: {
    id: string
    username: string
  }
  seller?: {
    id: string
    username: string
  }
}

export default function OrderDetailsPage() {
  const { token, user } = useAuthStore()
  const params = useParams()
  const orderId = params?.id
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!token || !user?.id || !orderId) {
      console.warn("Missing dependencies: token, user, or orderId")
      return
    }

    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`http://localhost:8800/api/gig-orders/${orderId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch order details: ${res.statusText}`)
        }

        const data = await res.json()
        setOrder(data)
      } catch (error) {
        console.error("Error fetching order:", error)
        setError("Failed to load order details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [token, user?.id, orderId])

  const handleRejectOrder = async () => {
    if (!order) return

    try {
      setActionLoading(true)

      const res = await fetch(`http://localhost:8800/api/gig-orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "REJECTED" }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to update order status: ${res.status}`)
      }

      const updatedOrder = await res.json()
      setOrder(updatedOrder)
    } catch (error: any) {
      console.error("Error rejecting order:", error)
      setError(error.message || "Failed to reject order. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleTrackOrder = async () => {
    if (!order) return
    router.push(`/gigs/orders/track/${order.id}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "IN_PROGRESS":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
            <Package className="h-3 w-3" />
            In Progress
          </Badge>
        )
        case "DELIVERED":
          return (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 gap-1">
              <Truck className="h-3 w-3" />
              Delivered
            </Badge>
          )
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
            <Package className="h-3 w-3" />
            Completed
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
            <ShieldAlert className="h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            {status.replace("_", " ")}
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex bg-white dark:bg-zinc-900">
        <GigsSidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Order Details</h1>
              <p className="text-gray-500 dark:text-zinc-300">View and manage your order information</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64 rounded-lg shadow-sm border">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading order details...</p>
                </div>
              </div>
            ) : error ? (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : !order ? (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Not Found</AlertTitle>
                <AlertDescription>Order not found.</AlertDescription>
              </Alert>
            ) : (
              <Card className="overflow-hidden shadow-md rounded-lg border-gray-200 dark:border-gray-700 mb-8">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl font-bold">
                          Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        {getStatusBadge(order.status)}
                      </div>
                      <CardDescription className="text-sm text-gray-500 dark:text-gray-300 mt-1 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(order.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-3">
                      {order.sellerId === user?.id ? (
                        <Button
                          variant="destructive"
                          onClick={handleRejectOrder}
                          disabled={actionLoading || order.status === "REJECTED"}
                          className="h-9"
                        >
                          {actionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <ShieldAlert className="h-4 w-4 mr-1.5" />
                              Reject Order
                            </>
                          )}
                        </Button>
                      ) : order.buyerId === user?.id ? (
                        <Button variant="outline" onClick={handleTrackOrder} className="h-9">
                          <ExternalLink className="h-4 w-4 mr-1.5" />
                          Track Order
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Order Details
                    </h3>
                    <p className="text-gray-800  dark:text-gray-300 font-medium text-lg">{order.gig?.title}</p>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">{order.gig?.desc}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 uppercase mb-3">Order Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <Clock className="h-4 w-4 mr-3 text-gray-400  dark:text-gray-300" />
                          <span className="text-gray-500 dark:text-gray-300 w-24">Status:</span>
                          <span className="font-medium">{order.status.replace("_", " ")}</span>
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <IndianRupee className="h-4 w-4 mr-3 text-gray-400 dark:text-gray-300" />
                          <span className="text-gray-500 dark:text-gray-300 w-24">Price:</span>
                          <span className="font-medium">₹{order.price != null ? order.price.toLocaleString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-start text-gray-700 dark:text-gray-300">
                          <FileText className="h-4 w-4 mr-3 text-gray-400 dark:text-gray-300 mt-0.5" />
                          <span className="text-gray-500 dark:text-gray-300 w-24">Payment ID:</span>
                          <span className="font-medium break-all">{order.paymentIntent || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-200  dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 uppercase mb-3">Buyer & Seller</h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <User className="h-4 w-4 mr-3 text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-300 w-24">Buyer:</span>
                          <span className="font-medium">{order.buyer?.username || "Unknown"}</span>
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <User className="h-4 w-4 mr-3 text-gray-400 dark:text-gray-300" />
                          <span className="text-gray-500 dark:text-gray-300 w-24">Seller:</span>
                          <span className="font-medium">{order.seller?.username || "Unknown"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-lg border border-gray-200  dark:border-gray-700 ">
                    <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                    <div className="p-4 rounded border border-gray-100 dark:border-gray-700">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{order.requirement || 'No requirements specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {order && order.sellerId === user?.id && <OrderUpdateForm orderId={order.id} />}
          </div>
        </main>
      </div>
    </div>
  )
}