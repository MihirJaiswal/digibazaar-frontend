"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Calendar, Check, Clock, FileUp, Loader2, Package, PlusCircle, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type OrderUpdateFormProps = {
  orderId: string
}

type OrderUpdate = {
  id: string
  title: string
  content: string
  expectedDeliveryDate?: string
  createdAt: string
}

export default function OrderUpdateForm({ orderId }: OrderUpdateFormProps) {
  const { token } = useAuthStore()
  const router = useRouter()

  const [selectedStatus, setSelectedStatus] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("orderStatus_" + orderId) || "PENDING"
    }
    return "PENDING"
  })

  const [updateTitle, setUpdateTitle] = useState("")
  const [updateContent, setUpdateContent] = useState("")
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("")
  const [existingUpdates, setExistingUpdates] = useState<OrderUpdate[]>([])
  const [loadingUpdates, setLoadingUpdates] = useState(true)
  const [updateError, setUpdateError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)

  // Save selectedStatus to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("orderStatus_" + orderId, selectedStatus)
    }
  }, [selectedStatus, orderId])

  // Fetch existing updates for the order
  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch(`http://localhost:8800/api/gig-order-updates/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })
        if (!res.ok) {
          throw new Error("Failed to fetch updates")
        }
        const data = await res.json()
        setExistingUpdates(data)
      } catch (err) {
        console.error("Error fetching order updates", err)
      } finally {
        setLoadingUpdates(false)
      }
    }
    fetchUpdates()
  }, [orderId, token])

  // Handler to update the order status using the dropdown
  const handleStatusUpdate = async () => {
    if (!selectedStatus) return
    setStatusUpdateLoading(true)
    setUpdateError("")

    try {
      const res = await fetch(`http://localhost:8800/api/gig-order-updates/status/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: selectedStatus }),
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error("Failed to update order status")
      }
      alert("Order status updated successfully")
    } catch (err: any) {
      console.error("Error updating order status", err)
      setUpdateError(err.message || "Failed to update order status")
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  const handleDeliverProduct = () => {
    router.push(`/gigs/orders/${orderId}/create`)
  }

  // Handler to create a new order update
  const handleCreateUpdate = async () => {
    if (!updateTitle || !updateContent) return

    setIsSubmitting(true)
    setUpdateError("")

    try {
      const requestBody: any = {
        gigOrderId: orderId,
        title: updateTitle,
        content: updateContent,
      }

      if (expectedDeliveryDate) {
        requestBody.expectedDeliveryDate = expectedDeliveryDate
      }

      const res = await fetch(`http://localhost:8800/api/gig-order-updates/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error("Failed to create order update")
      }

      const newUpdate = await res.json()
      setExistingUpdates((prev) => [...prev, newUpdate])
      setUpdateTitle("")
      setUpdateContent("")
      setExpectedDeliveryDate("")
    } catch (err: any) {
      console.error("Error creating order update", err)
      setUpdateError(err.message || "Failed to create order update")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "IN_PROGRESS":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "COMPLETED":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <Card className="shadow-md border-gray-200 mb-8">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          Order Updates & Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        {updateError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{updateError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Update Order Status
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="status">Current Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status" className={`${getStatusColor(selectedStatus)}`}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleStatusUpdate} disabled={statusUpdateLoading} className="min-w-[120px]">
                {statusUpdateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Update
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileUp className="h-5 w-5 text-primary" />
              Deliver Final Product
            </h3>
            <p className="text-sm text-gray-500">
              Ready to deliver the completed work? Upload your final delivery files.
            </p>
            <Button onClick={handleDeliverProduct} className="w-full sm:w-auto" variant="default">
              <Package className="mr-2 h-4 w-4" />
              Deliver Product
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            Add Progress Update
          </h3>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="space-y-2">
              <Label htmlFor="updateTitle">Update Title</Label>
              <Input
                id="updateTitle"
                type="text"
                placeholder="E.g., First draft completed"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="updateContent">Update Details</Label>
              <Textarea
                id="updateContent"
                placeholder="Describe your progress, challenges, or questions..."
                value={updateContent}
                onChange={(e) => setUpdateContent(e.target.value)}
                rows={4}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedDeliveryDate" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Expected Delivery Date (optional)
              </Label>
              <Input
                id="expectedDeliveryDate"
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCreateUpdate} disabled={isSubmitting || !updateTitle || !updateContent}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Submit Update
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Update History
          </h3>

          {loadingUpdates ? (
            <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-gray-500">Loading updates...</span>
            </div>
          ) : existingUpdates.length > 0 ? (
            <div className="space-y-4">
              {existingUpdates.map((update: OrderUpdate) => (
                <Card key={update.id} className="overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h4 className="font-semibold text-gray-800">{update.title}</h4>
                      <div className="text-xs text-gray-500">{formatDate(update.createdAt)}</div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-gray-700 whitespace-pre-line">{update.content}</p>
                    {update.expectedDeliveryDate && (
                      <div className="mt-3 flex items-center">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Calendar className="h-3 w-3 mr-1" />
                          Expected: {formatDate(update.expectedDeliveryDate)}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-500">No updates have been added yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Add your first update to keep the buyer informed about your progress.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

