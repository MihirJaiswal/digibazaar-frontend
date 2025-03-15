"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuthStore } from "@/store/authStore"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Filter,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Package,
  ArrowRight,
  User,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export interface Inquiry {
  id: string
  message: string
  createdAt: string
  buyer: {
    id: string
    username: string
    role: "buyer"
    profilePic?: string
  }
  supplier: {
    id: string
    username: string
    role: "seller"
    profilePic?: string
  }
  requestedQuantity: number
  requestedPrice: number
  proposedQuantity: number | null
  proposedPrice: number | null
  status: "PENDING" | "NEGOTIATING" | "ACCEPTED" | "REJECTED"
  round: number
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const { user, token } = useAuthStore()

  useEffect(() => {
    async function fetchInquiries() {
      try {
        const res = await fetch("http://localhost:8800/api/inquiries/user", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })
        const data = await res.json()
        setInquiries(Array.isArray(data) ? data : data.inquiries || [])
      } catch (error) {
        console.error("Error fetching inquiries", error)
      } finally {
        setLoading(false)
      }
    }
    if (token) {
      fetchInquiries()
    } else {
      setLoading(false)
    }
  }, [token])

  // Filter inquiries based on search term and status
  const filteredInquiries = inquiries
    .filter((inquiry) => {
      // Use buyer if user is buyer, else supplier, to filter by username
      const relevantParty = inquiry.buyer?.id === user?.id ? inquiry.supplier : inquiry.buyer
      if (searchTerm && !relevantParty?.username.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (statusFilter && inquiry.status !== statusFilter) {
        return false
      }
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Split into two groups:
  // Your enquiries: inquiries where you are the buyer
  // Received enquiries: inquiries where you are the supplier
  const yourEnquiries = filteredInquiries.filter((inquiry) => inquiry.buyer?.id === user?.id)
  const receivedEnquiries = filteredInquiries.filter((inquiry) => inquiry.supplier?.id === user?.id)

  // Format date in a readable way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status badge with appropriate styling and icon
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </Badge>
        )
      case "NEGOTIATING":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> Negotiating
          </Badge>
        )
      case "ACCEPTED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Accepted
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inquiries</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your business negotiations</p>
        </div>
        <Button className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 h-4 w-4" />
              <Select
                onValueChange={(val) => setStatusFilter(val !== "ALL" ? val : null)}
                value={statusFilter || "ALL"}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="your" className="w-full">
        <TabsList className="flex w-full md:w-auto bg-muted p-1 rounded-md mb-6">
          <TabsTrigger value="your" className="flex-1 md:flex-none">
            <User className="w-4 h-4 mr-2" />
            Your Inquiries
          </TabsTrigger>
          <TabsTrigger value="received" className="flex-1 md:flex-none">
            <MessageSquare className="w-4 h-4 mr-2" />
            Received Inquiries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="your">
          {loading ? (
            <InquirySkeletons count={3} />
          ) : (
            <InquiryList
              inquiries={yourEnquiries}
              isSent={true}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
            />
          )}
        </TabsContent>
        <TabsContent value="received">
          {loading ? (
            <InquirySkeletons count={3} />
          ) : (
            <InquiryList
              inquiries={receivedEnquiries}
              isSent={false}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InquiryList({
  inquiries,
  isSent,
  formatDate,
  getStatusBadge,
}: {
  inquiries: Inquiry[]
  isSent: boolean
  formatDate: (date: string) => string
  getStatusBadge: (status: string) => React.ReactNode
}) {
  if (inquiries.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-100 dark:border-zinc-700">
        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
          {isSent ? <User className="w-8 h-8 text-gray-400" /> : <MessageSquare className="w-8 h-8 text-gray-400" />}
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No inquiries found</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
          {isSent
            ? "You haven't made any inquiries yet. Browse gigs to start a negotiation."
            : "You haven't received any inquiries yet."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => {
        // For "Your Enquiries", user is buyer, so show supplier as the other party.
        // For "Received Enquiries", user is supplier, so show buyer.
        const otherParty = isSent ? inquiry.supplier : inquiry.buyer

        // Calculate total value
        const currentPrice = inquiry.proposedPrice !== null ? inquiry.proposedPrice : inquiry.requestedPrice
        const currentQty = inquiry.proposedQuantity !== null ? inquiry.proposedQuantity : inquiry.requestedQuantity
        const totalValue = currentPrice * currentQty

        return (
          <Link key={inquiry.id} href={`/gigs/inquiries/${inquiry.id}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer border-gray-200 dark:border-gray-700 mb-8">
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      {otherParty?.profilePic ? (
                        <Image
                          src={otherParty.profilePic || "/placeholder.svg"}
                          alt={otherParty.username}
                          width={48}
                          height={48}
                          className="rounded-full border-2 border-gray-100 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {otherParty?.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white flex items-center">
                          {otherParty?.username}
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                            {otherParty?.role}
                          </span>
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(inquiry.createdAt)}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(inquiry.status)}
                  </div>

                  <div className="mt-4">
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{inquiry.message}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                        <Package className="w-3 h-3 mr-1" /> Quantity
                      </p>
                      <p className="font-medium">{currentQty} units</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" /> Unit Price
                      </p>
                      <p className="font-medium">${currentPrice}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" /> Total Value
                      </p>
                      <p className="font-medium">${totalValue.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                        <RefreshCw className="w-3 h-3 mr-1" /> Round
                      </p>
                      <p className="font-medium">{inquiry.round}</p>
                    </div>
                  </div>
                </div>

                {inquiry.status === "NEGOTIATING" && (
                  <>
                    <Separator />
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Negotiation in progress</p>
                        <div className="flex items-center text-sm">
                          View details <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {inquiry.status === "ACCEPTED" && (
                  <>
                    <Separator />
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Deal accepted</p>
                        <div className="flex items-center text-sm">
                          View details <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

function InquirySkeletons({ count }: { count: number }) {
  return (
    <div className="space-y-4">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="ml-auto">
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                {Array(4)
                  .fill(0)
                  .map((_, j) => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}

