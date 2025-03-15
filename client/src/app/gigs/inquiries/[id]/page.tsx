"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  Calendar,
  DollarSign,
  Package,
  TrendingDown,
  Zap,
  Info,
} from "lucide-react"

// Helper: Format date in a readable way
const formatDate = (dateString: string): string => {
    const date: Date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };
  
  // Helper: Calculate time remaining in hours
  const calculateTimeRemaining = (dateString: string): number => {
    const deadlineDate: Date = new Date(dateString);
    const currentDate: Date = new Date();
    // Use getTime() to ensure we're working with numbers
    const diffMs: number = deadlineDate.getTime() - currentDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60));
  };

// Business Logic: Calculate negotiation metrics
const calculateNegotiationMetrics = (inquiry) => {
  // Calculate price difference from original to current
  const originalPrice = inquiry.requestedPrice
  const currentPrice = inquiry.proposedPrice !== null ? inquiry.proposedPrice : originalPrice
  const priceDiff = ((currentPrice - originalPrice) / originalPrice) * 100

  // Calculate quantity difference
  const originalQty = inquiry.requestedQuantity
  const currentQty = inquiry.proposedQuantity !== null ? inquiry.proposedQuantity : originalQty
  const qtyDiff = ((currentQty - originalQty) / originalQty) * 100

  // Calculate total deal value
  const originalValue = originalPrice * originalQty
  const currentValue = currentPrice * currentQty
  const valueDiff = ((currentValue - originalValue) / originalValue) * 100

  // Calculate deal rating (higher for better deals)
  let dealRating = 0
  const gigBulkPrice = inquiry.gig.bulkPrice

  if (inquiry.buyer.id === inquiry.buyer.id) {
    // For buyer: better deals have lower prices
    dealRating = Math.min(100, Math.max(0, 100 - (currentPrice / gigBulkPrice) * 100))
  } else {
    // For seller: better deals have higher prices
    dealRating = Math.min(100, Math.max(0, (currentPrice / gigBulkPrice) * 100))
  }

  return {
    priceDiff: priceDiff.toFixed(2),
    qtyDiff: qtyDiff.toFixed(2),
    valueDiff: valueDiff.toFixed(2),
    dealRating: Math.round(dealRating),
    totalValue: (currentPrice * currentQty).toFixed(2),
    marginalSavings: (gigBulkPrice - currentPrice) * currentQty,
    isProfitable: currentPrice > (inquiry.gig.productionCost || 0),
  }
}

// Business Logic: Market price analyzer
const analyzeMarketPrice = (price, category, minPrice, maxPrice) => {
  if (!minPrice || !maxPrice) return "Market data unavailable"

  if (price < minPrice) return "Below market - Very competitive"
  if (price < (minPrice + maxPrice) / 2) return "Lower than average - Good deal"
  if (price < maxPrice) return "Higher than average - Consider negotiating"
  return "Above market - May need significant negotiation"
}

// UI helper: Render status badge
const getStatusBadge = (status) => {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      )
    case "NEGOTIATING":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <MessageSquare className="w-3 h-3 mr-1" /> Negotiating
        </Badge>
      )
    case "ACCEPTED":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" /> Accepted
        </Badge>
      )
    case "REJECTED":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" /> Rejected
        </Badge>
      )
    case "EXPIRED":
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
          <Clock className="w-3 h-3 mr-1" /> Expired
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// UI helper: Get user avatar element
const getUserAvatar = (userObj, size = 40) => {
  if (userObj.profilePic) {
    return (
      <Image
        src={userObj.profilePic || "/placeholder.svg"}
        alt={userObj.username}
        width={size}
        height={size}
        className="rounded-full"
      />
    )
  } else {
    return (
      <div className={`w-${size} h-${size} rounded-full bg-gray-300 flex items-center justify-center`}>
        {userObj.username.charAt(0).toUpperCase()}
      </div>
    )
  }
}

// Business Logic: Calculate fairness score based on various factors
const calculateFairnessScore = (inquiry, currentUser) => {
  const isBuyer = currentUser.id === inquiry.buyer.id
  let score = 50 // Start with neutral score

  const marketRate = inquiry.gig.marketRatePerUnit || inquiry.gig.bulkPrice
  const currentPrice = inquiry.proposedPrice !== null ? inquiry.proposedPrice : inquiry.requestedPrice

  // Price fairness (from respective sides)
  if (isBuyer) {
    // Buyer perspective: lower is better
    if (currentPrice < marketRate * 0.8) score += 20
    else if (currentPrice < marketRate * 0.9) score += 10
    else if (currentPrice > marketRate * 1.1) score -= 10
    else if (currentPrice > marketRate * 1.2) score -= 20
  } else {
    // Seller perspective: higher is better
    if (currentPrice > marketRate * 1.2) score += 20
    else if (currentPrice > marketRate * 1.1) score += 10
    else if (currentPrice < marketRate * 0.9) score -= 10
    else if (currentPrice < marketRate * 0.8) score -= 20
  }

  // Quantity fairness - both parties benefit from higher quantities
  const minOrderQty = inquiry.gig.minOrderQty
  const currentQty = inquiry.proposedQuantity !== null ? inquiry.proposedQuantity : inquiry.requestedQuantity

  if (currentQty > minOrderQty * 2) score += 15
  else if (currentQty > minOrderQty * 1.5) score += 10
  else if (currentQty < minOrderQty) score -= 10

  // Negotiation round penalty - too many rounds may indicate unfair demands
  if (inquiry.round > 5) score -= 15
  else if (inquiry.round > 3) score -= 5

  // Clamp score between 0-100
  return Math.min(100, Math.max(0, score))
}

// Business Logic: Get negotiation recommendation
const getNegotiationRecommendation = (inquiry, user) => {
  const isBuyer = user.id === inquiry.buyer.id
  const fairnessScore = calculateFairnessScore(inquiry, user)
  const currentPrice = inquiry.proposedPrice !== null ? inquiry.proposedPrice : inquiry.requestedPrice
  const marketRate = inquiry.gig.marketRatePerUnit || inquiry.gig.bulkPrice
  const priceRatio = currentPrice / marketRate

  if (fairnessScore >= 80) {
    return {
      action: "accept",
      message: "This appears to be a favorable deal. Consider accepting.",
      reason: isBuyer ? "Price is significantly below market rate" : "Price is above average for this category",
    }
  } else if (fairnessScore >= 60) {
    return {
      action: "counter",
      message: "Deal is reasonable but could be improved.",
      suggestedPrice: isBuyer ? Math.round(currentPrice * 0.95) : Math.round(currentPrice * 1.05),
      reason: "Moderate adjustment may lead to agreement",
    }
  } else if (fairnessScore >= 40) {
    return {
      action: "counter",
      message: "Deal needs significant improvement.",
      suggestedPrice: isBuyer ? Math.round(currentPrice * 0.85) : Math.round(currentPrice * 1.15),
      reason: "Current terms are not adequately aligned with market rates",
    }
  } else {
    return {
      action: "reject",
      message: "Consider rejecting this offer.",
      reason: isBuyer ? "Price is significantly above market rate" : "Price is too low to be profitable",
    }
  }
}

export interface Inquiry {
  id: string
  message: string
  createdAt: string
  expiresAt: string
  buyer: {
    id: string
    username: string
    role: "buyer"
    profilePic?: string
    reputation: number
    negotiationHistory?: {
      totalDeals: number
      completedDeals: number
      avgNegotiationRounds: number
    }
  }
  supplier: {
    id: string
    username: string
    role: "seller"
    profilePic?: string
    reputation: number
    negotiationHistory?: {
      totalDeals: number
      completedDeals: number
      avgNegotiationRounds: number
    }
  }
  requestedQuantity: number
  requestedPrice: number
  proposedQuantity: number | null
  proposedPrice: number | null
  status: "PENDING" | "NEGOTIATING" | "ACCEPTED" | "REJECTED" | "EXPIRED"
  marketData?: {
    minPrice: number
    maxPrice: number
    avgPrice: number
    trendDirection: "up" | "down" | "stable"
    trendPercentage: number
  }
  round: number
  negotiationHistory: Array<{
    timestamp: string
    actor: string
    action: string
    price?: number
    quantity?: number
    message?: string
  }>
  gig: {
    id: string
    title: string
    description: string
    bulkPrice: number
    marketRatePerUnit?: number
    productionCost?: number
    cover: string
    minOrderQty: number
    leadTime: number
    category: string
    shippingOptions?: Array<{
      name: string
      cost: number
      timeframe: string
    }>
  }
}

export default function NegotiationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token } = useAuthStore();

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ReturnType<typeof calculateNegotiationMetrics> | null>(null);
  const [fairnessScore, setFairnessScore] = useState(0);
  const [recommendation, setRecommendation] = useState<ReturnType<typeof getNegotiationRecommendation> | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  // State for negotiation modal (for counter offer)
  const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);
  const [newQuantity, setNewQuantity] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // State for confirmation dialog (for accept/reject/delete actions)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"accept" | "reject" | "delete" | null>(null);
  
  // Business Logic: Check for offer expiration
  const checkExpiration = useCallback(() => {
    if (!inquiry || !inquiry.expiresAt) return;
    
    const expiryDate = new Date(inquiry.expiresAt);
    const now = new Date();
    
    if (now > expiryDate && inquiry.status !== "ACCEPTED" && inquiry.status !== "REJECTED") {
      updateInquiry({ status: "EXPIRED" });
    }
    
    // Update time remaining
    const hoursLeft = calculateTimeRemaining(inquiry.expiresAt);
    setTimeRemaining(hoursLeft);
  }, [inquiry]);

  // --- Calculate business metrics when inquiry changes ---
  useEffect(() => {
    if (inquiry && user) {
      const calculatedMetrics = calculateNegotiationMetrics(inquiry);
      setMetrics(calculatedMetrics);
      
      const calculatedFairness = calculateFairnessScore(inquiry, user);
      setFairnessScore(calculatedFairness);
      
      const calculatedRecommendation = getNegotiationRecommendation(inquiry, user);
      setRecommendation(calculatedRecommendation);
      
      // Check for expiration
      checkExpiration();
      
      // Set interval to check expiration every minute
      const intervalId = setInterval(checkExpiration, 60000);
      return () => clearInterval(intervalId);
    }
  }, [inquiry, user, checkExpiration]);

  // --- Fetch Inquiry Data ---
  useEffect(() => {
    async function fetchInquiry() {
      try {
        const res = await fetch(`http://localhost:8800/api/inquiries/${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
            });
            if (!res.ok) {
              throw new Error("Failed to fetch inquiry");
            }
            const data = await res.json();
            console.log("Fetched inquiry:", data);
            
            // Add expiration date if not present (for demo purposes)
            if (!data.expiresAt) {
              const expiryDate = new Date();
              expiryDate.setHours(expiryDate.getHours() + 48); // 48 hour expiry
              data.expiresAt = expiryDate.toISOString();
            }
            
            // Add negotiation history if not present (for demo purposes)
            if (!data.negotiationHistory) {
              data.negotiationHistory = [
                {
                  timestamp: data.createdAt,
                  actor: data.buyer.username,
                  action: "created_inquiry",
                  price: data.requestedPrice,
                  quantity: data.requestedQuantity,
                  message: data.message || "Initial inquiry"
                }
              ];
              
              // Add counter offer if in negotiation
              if (data.status === "NEGOTIATING" && data.proposedPrice) {
                const counterDate = new Date(data.createdAt);
                counterDate.setHours(counterDate.getHours() + 2);
                
                data.negotiationHistory.push({
                  timestamp: counterDate.toISOString(),
                  actor: data.supplier.username,
                  action: "counter_offer",
                  price: data.proposedPrice,
                  quantity: data.proposedQuantity,
                  message: "Counter offer"
                });
              }
            }
            
            // Add market data if not present (for demo purposes)
            if (!data.marketData) {
              data.marketData = {
                minPrice: data.gig.bulkPrice * 0.8,
                maxPrice: data.gig.bulkPrice * 1.3,
                avgPrice: data.gig.bulkPrice * 1.05,
                trendDirection: "stable",
                trendPercentage: 2
              };
            }
            
            // Add shipping options if not present (for demo purposes)
            if (!data.gig.shippingOptions) {
              data.gig.shippingOptions = [
                { name: "Standard", cost: 15, timeframe: "7-10 days" },
                { name: "Express", cost: 35, timeframe: "3-5 days" },
                { name: "Overnight", cost: 75, timeframe: "1-2 days" }
              ];
            }
            
            // Add production cost if not present (for demo purposes)
            if (!data.gig.productionCost) {
              data.gig.productionCost = data.gig.bulkPrice * 0.7;
            }
            
            // Add reputation if not present (for demo purposes)
            if (!data.buyer.reputation) data.buyer.reputation = 4.7;
            if (!data.supplier.reputation) data.supplier.reputation = 4.8;
            
            // Add negotiation history stats if not present
            if (!data.buyer.negotiationHistory) {
              data.buyer.negotiationHistory = {
                totalDeals: 28,
                completedDeals: 24,
                avgNegotiationRounds: 2.1
              };
            }
            
            if (!data.supplier.negotiationHistory) {
              data.supplier.negotiationHistory = {
                totalDeals: 142,
                completedDeals: 138,
                avgNegotiationRounds: 1.8
              };
            }
            
            setInquiry(data);
          } catch (err:any) {
            console.error("Error fetching inquiry", err);
            setError(err.message || "Failed to load inquiry details. Please try again later.");
          } finally {
            setLoading(false);
          }
        }
        if (id && token) {
          fetchInquiry();
        }
      }, [id, token]);
    
      if (loading) {
        return (
          <div className="flex justify-center items-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4">Loading inquiry details...</p>
            </div>
          </div>
        );
      }
    
      if (error) {
        return (
          <Alert variant="destructive" className="max-w-xl mx-auto mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        );
      }
    
      if (!inquiry) {
        return (
          <Alert variant="destructive" className="max-w-xl mx-auto mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Inquiry not found. It may have been deleted or you lack permission to view it.
            </AlertDescription>
          </Alert>
        );
      }
    
      // Ensure inquiry has both buyer and supplier data
      if (!inquiry.buyer || !inquiry.supplier) {
        return (
          <Alert variant="destructive" className="max-w-xl mx-auto mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Error: Inquiry data is incomplete.</AlertDescription>
          </Alert>
        );
      }
    
      // --- Determine Roles ---
      const isBuyer = inquiry.buyer.id === user?.id;
      const otherParty = isBuyer ? inquiry.supplier : inquiry.buyer;
    
      // --- Business Logic: Profit Margin Analysis ---
      const calculateProfitMargin = () => {
        const currentPrice = inquiry.proposedPrice !== null ? inquiry.proposedPrice : inquiry.requestedPrice;
        const cost = inquiry.gig.productionCost || 0;
        
        if (cost === 0) return 100;
        return ((currentPrice - cost) / currentPrice * 100).toFixed(2);
      };
       
      // --- Business Logic: Calculate Volume Discount ---
      const calculateVolumeDiscount = (qty) => {
        const baseQty = inquiry.gig.minOrderQty;
        const currentQty = qty || inquiry.requestedQuantity;
        
        if (currentQty < baseQty * 2) return 0;
        if (currentQty < baseQty * 5) return 5;
        if (currentQty < baseQty * 10) return 10;
        return 15;
      };
    
      // --- Action Helpers ---
      const openConfirmDialog = (action) => {
        setConfirmAction(action);
        setIsConfirmOpen(true);
      };
    
      const updateInquiry = async (updatedFields) => {
        try {
          const res = await fetch(`http://localhost:8800/api/inquiries/${inquiry.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            body: JSON.stringify(updatedFields),
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to update inquiry");
          }
          const updatedInquiry = await res.json();
          console.log("Updated inquiry:", updatedInquiry);
          
          // Add to negotiation history
          if (!updatedInquiry.negotiationHistory) {
            updatedInquiry.negotiationHistory = inquiry.negotiationHistory || [];
          }
          
          // Add entry to history based on action
          if (updatedFields.status === "ACCEPTED") {
            updatedInquiry.negotiationHistory.push({
              timestamp: new Date().toISOString(),
              actor: user?.username,
              action: "accepted_offer",
              price: inquiry.proposedPrice || inquiry.requestedPrice,
              quantity: inquiry.proposedQuantity || inquiry.requestedQuantity
            });
          } else if (updatedFields.status === "REJECTED") {
            updatedInquiry.negotiationHistory.push({
              timestamp: new Date().toISOString(),
              actor: user?.username,
              action: "rejected_offer"
            });
          } else if (updatedFields.status === "NEGOTIATING") {
            updatedInquiry.negotiationHistory.push({
              timestamp: new Date().toISOString(),
              actor: user?.username,
              action: "counter_offer",
              price: updatedFields.proposedPrice,
              quantity: updatedFields.proposedQuantity,
              message: updatedFields.message
            });
          }
          
          setInquiry(updatedInquiry);
          return true;
        } catch (err:any) {
          console.error("Error updating inquiry", err);
          setError(err.message || "Failed to update inquiry");
          return false;
        }
      };
    
      const handleAccept = async () => {
        const success = await updateInquiry({ status: "ACCEPTED" });
        if (success) {
          // In a real app, this would trigger follow-up actions like contract generation
          alert("Inquiry accepted! Redirecting to contract generation...");
        }
        setIsConfirmOpen(false);
      };
    
      const handleReject = async () => {
        const success = await updateInquiry({ status: "REJECTED" });
        if (success) alert("Inquiry rejected");
        setIsConfirmOpen(false);
      };
    
      const handleDelete = async () => {
        try {
          const res = await fetch(`http://localhost:8800/api/inquiries/${inquiry.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          });
          if (res.ok) {
            alert("Inquiry deleted successfully");
            router.push("/inquiries");
          } else {
            setError("Failed to delete inquiry");
          }
        } catch (err) {
          console.error("Error deleting inquiry", err);
          setError("Failed to delete inquiry. Please try again later.");
        } finally {
          setIsConfirmOpen(false);
        }
      };
    
      const handleSubmitNegotiation = async () => {
        if (!newQuantity || !newPrice) {
          setError("Please enter both quantity and price for your counter-offer.");
          return;
        }
        const quantity = Number(newQuantity);
        const price = Number(newPrice);
        if (isNaN(quantity) || quantity <= 0) {
          setError("Please enter a valid quantity.");
          return;
        }
        if (isNaN(price) || price <= 0) {
          setError("Please enter a valid price.");
          return;
        }
        
        // Business logic: Check minimum order quantity
        if (quantity < inquiry.gig.minOrderQty) {
          setError(`Quantity must be at least ${inquiry.gig.minOrderQty} units.`);
          return;
        }
        
        // Business logic: Check if price is profitable for seller
        if (!isBuyer && price < (inquiry?.gig?.productionCost ?? 0)) {
            if (!confirm("Warning: This price is below your production cost. Are you sure you want to proceed?")) {
              return;
            }
        }
        
        // Business logic: Extend expiration time with each counter-offer
        const newExpiryDate = new Date();
        newExpiryDate.setHours(newExpiryDate.getHours() + 48); // 48 hour extension
        
        // For a counter-offer, update the inquiry: set status to NEGOTIATING,
        // update proposed values, and increment the negotiation round.
        const negotiationData = {
          status: "NEGOTIATING",
          proposedQuantity: quantity,
          proposedPrice: price,
          round: inquiry.round + 1,
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
    
      const openNegotiationDialog = () => {
        // Pre-fill with current counter-offer if available, otherwise use requested values.
        if (inquiry.status === "NEGOTIATING" && inquiry.proposedQuantity !== null && inquiry.proposedPrice !== null) {
          setNewQuantity(inquiry.proposedQuantity.toString());
          setNewPrice(inquiry.proposedPrice.toString());
        } else {
          setNewQuantity(inquiry.requestedQuantity.toString());
          setNewPrice(inquiry.requestedPrice.toString());
        }
        
        // Business logic: If we're a seller, automatically apply recommended price
        if (!isBuyer && recommendation && recommendation.suggestedPrice) {
          setNewPrice(recommendation.suggestedPrice.toString());
        }
        
        setNewMessage("");
        setIsNegotiationOpen(true);
      };
    
      // --- Render Action Buttons ---
      const renderActionButtons = () => {
        if (inquiry.status === "EXPIRED") {
          return (
            <Button 
              variant="outline" 
              className="border-blue-500 text-blue-500 hover:bg-blue-50"
              onClick={openNegotiationDialog}
            >
              <Zap className="w-4 h-4 mr-2" /> Revive Negotiation
            </Button>
          );
        }
        
        if (inquiry.status === "ACCEPTED") {
          return (
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => alert("Order confirmed! Proceeding to fulfillment...")}
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Confirm Order
            </Button>
          );
        } else if (inquiry.status === "PENDING" || inquiry.status === "NEGOTIATING") {
          return (
            <>
              <Button
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-50"
                onClick={() => openConfirmDialog("accept")}
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Accept Offer
              </Button>
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => openConfirmDialog("reject")}
              >
                <XCircle className="w-4 h-4 mr-2" /> Reject Offer
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={openNegotiationDialog}>
                <MessageSquare className="w-4 h-4 mr-2" /> Counter Offer
              </Button>
              {isBuyer && (
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                  onClick={() => openConfirmDialog("delete")}
                >
                  <XCircle className="w-4 h-4 mr-2" /> Delete Inquiry
                </Button>
              )}
            </>
          );
        } else {
          return (
            <Badge
              className="px-3 py-1"
            >
              Inquiry {inquiry.status}
            </Badge>
          );
        }
      };
    
      // Business logic: Calculate total with shipping
      // Business logic: Calculate total with shipping

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <Link href="/inquiries">
        <span className="text-blue-500 hover:underline flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Inquiries
        </span>
      </Link>

      {/* Header Section */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-zinc-700">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Negotiation Details</h1>
          {getStatusBadge(inquiry.status)}
        </div>
        <div className="flex justify-between items-center flex-wrap gap-3">
          <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            Created on {formatDate(inquiry.createdAt)}
          </p>
          
          {/* Time Remaining Display */}
          {inquiry.status !== "ACCEPTED" && inquiry.status !== "REJECTED" && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className={`text-sm font-medium ${timeRemaining && timeRemaining <= 4 ? 'text-red-500' : timeRemaining && timeRemaining <= 12 ? 'text-orange-500' : 'text-gray-600 dark:text-gray-300'}`}>
              {timeRemaining && timeRemaining > 0 
                ? `Expires in ${timeRemaining} hours` 
                : "Expired"}
            </span>
          </div>
        )}
      </div>

      {/* Gig Summary Card */}
      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={inquiry.gig.cover || "/placeholder.svg"}
                alt={inquiry.gig.title}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div className="ml-4">
              <CardTitle className="text-xl font-bold">{inquiry.gig.title}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">{inquiry.gig.category}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">{inquiry.gig.description}</p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Bulk Price</p>
              <p className="font-bold">${inquiry.gig.bulkPrice}/unit</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Min Order</p>
              <p className="font-bold">{inquiry.gig.minOrderQty} units</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Lead Time</p>
              <p className="font-bold">
                {inquiry.gig.leadTime} day{inquiry.gig.leadTime !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inquiry Detail Card */}
      <Card className="shadow-lg rounded-xl bg-white dark:bg-zinc-800 p-6">
        <div className="flex items-center space-x-4">
          {otherParty?.profilePic ? (
            <Image
              src={otherParty.profilePic || "/placeholder.svg"}
              alt={otherParty.username}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              {otherParty?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{otherParty?.username || "Unknown"}</h2>
            <p className="text-sm text-gray-500">{otherParty?.role || "Unknown"}</p>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Price Summary */}
        <div className="mb-6 bg-gray-50 dark:bg-zinc-700/50 p-5 rounded-lg border border-gray-100 dark:border-zinc-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-primary" />
            Order Summary
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Item Price</span>
              <span>${inquiry.proposedPrice !== null ? inquiry.proposedPrice : inquiry.requestedPrice}/unit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Quantity</span>
              <span>{inquiry.proposedQuantity !== null ? inquiry.proposedQuantity : inquiry.requestedQuantity} units</span>
            </div>
            {calculateVolumeDiscount(inquiry.proposedQuantity || inquiry.requestedQuantity) > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center">
                  <TrendingDown className="w-4 h-4 mr-1" /> Volume Discount
                </span>
                <span>-{calculateVolumeDiscount(inquiry.proposedQuantity || inquiry.requestedQuantity)}%</span>
              </div>
            )}
            
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>${((inquiry.proposedPrice !== null ? inquiry.proposedPrice : inquiry.requestedPrice) * 
                (inquiry.proposedQuantity !== null ? inquiry.proposedQuantity : inquiry.requestedQuantity)).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Original Message */}
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Inquiry Message</h3>
          <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-700/50 p-3 rounded">
            {inquiry.message || "No message provided."}
          </p>
        </div>

        {/* Negotiation History */}
        <div className="mb-6 bg-white dark:bg-zinc-800 p-5 rounded-lg border border-gray-100 dark:border-zinc-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-primary" />
            Negotiation Timeline
          </h3>
          <div className="space-y-4">
            {inquiry.negotiationHistory.map((entry, idx) => (
              <div key={idx} className="relative pl-6 pb-4 border-l-2 border-primary/30 dark:border-primary/20">
                <div className="absolute w-4 h-4 bg-primary rounded-full -left-[8px] top-1.5 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="flex items-start justify-between bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {entry.actor} {entry.action.replace(/_/g, " ")}
                    </p>
                    {entry.price && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {entry.quantity} units at ${entry.price}/unit
                      </p>
                    )}
                    {entry.message && (
                      <p className="text-sm mt-2 bg-white dark:bg-zinc-700/50 p-2 rounded border border-gray-100 dark:border-zinc-600 italic">
                        "{entry.message}"
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(entry.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-end mt-6">
          {renderActionButtons()}
        </div>
      </Card>

      {/* Counter Offer Dialog */}
      <Dialog open={isNegotiationOpen} onOpenChange={setIsNegotiationOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-800">
          <DialogHeader className="border-b pb-4">
            <DialogTitle>Make a Counter Offer</DialogTitle>
            <DialogDescription>
              Enter your proposed terms for this negotiation.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Quantity</label>
                <Input
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  min={inquiry.gig.minOrderQty}
                  placeholder={`Min: ${inquiry.gig.minOrderQty}`}
                  className="w-full border-gray-300 dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  Minimum order: {inquiry.gig.minOrderQty} units
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Price per unit</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="pl-8 border-gray-300 dark:border-gray-600"
                    step="0.01"
                    min="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  {isBuyer 
                    ? `Listed price: $${inquiry.gig.bulkPrice}` 
                    : `Production cost: $${inquiry.gig.productionCost?.toFixed(2) || "N/A"}`}
                </p>
              </div>
            </div>

            {/* Volume discount indicator */}
            {newQuantity && Number(newQuantity) > 0 && calculateVolumeDiscount(Number(newQuantity)) > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-3 rounded-lg text-sm text-green-700 dark:text-green-400 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                {calculateVolumeDiscount(Number(newQuantity))}% volume discount applied
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Message (Optional)</label>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Add a message explaining your offer"
                className="w-full border-gray-300 dark:border-gray-600 min-h-[100px]"
              />
            </div>

            {/* Order summary */}
            {newQuantity && newPrice && (
              <div className="bg-gray-50 dark:bg-zinc-700/30 p-4 rounded-lg space-y-2 border border-gray-100 dark:border-zinc-700">
                <p className="font-medium text-sm flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-primary" />
                  Order Summary
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span>${(Number(newPrice) * Number(newQuantity)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                  <span>Total</span>
                  <span>
                    ${(Number(newPrice) * Number(newQuantity)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsNegotiationOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitNegotiation} className="bg-primary hover:bg-primary/90">Submit Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "accept"
                ? "Accept Offer"
                : confirmAction === "reject"
                ? "Reject Offer"
                : "Delete Inquiry"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "accept"
                ? "Are you sure you want to accept this offer? This will create a binding agreement."
                : confirmAction === "reject"
                ? "Are you sure you want to reject this offer? This action cannot be undone."
                : "Are you sure you want to delete this inquiry? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction === "accept" ? "default" : "destructive"}
              onClick={
                confirmAction === "accept"
                  ? handleAccept
                  : confirmAction === "reject"
                  ? handleReject
                  : handleDelete
              }
            >
              {confirmAction === "accept" ? "Accept" : confirmAction === "reject" ? "Reject" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
</div>
  );
  }



